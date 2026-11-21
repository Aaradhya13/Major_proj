import base64
import io
import threading
from pathlib import Path

import joblib
import matplotlib
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import models, transforms

matplotlib.use("Agg")
import matplotlib.pyplot as plt


STAGE1_LABELS = {0: "Non-Demented", 1: "Demented"}
STAGE2_LABELS = {0: "Very Mild", 1: "Mild", 2: "Moderate"}


class GradCAM:
    """The Grad-CAM implementation used by the teammate's existing model API."""

    def __init__(self, model: torch.nn.Module, target_layer: torch.nn.Module):
        self.model = model
        self.gradients = None
        self.activations = None
        target_layer.register_forward_hook(self._save_activation)
        target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module, inputs, output):
        self.activations = output

    def _save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]

    def generate_heatmap(self, input_tensor: torch.Tensor) -> np.ndarray:
        self.model.eval()
        output = self.model(input_tensor)
        target_class = output.argmax(dim=1).item()
        self.model.zero_grad()
        output[0, target_class].backward()

        gradients = self.gradients.detach().cpu().numpy()[0]
        activations = self.activations.detach().cpu().numpy()[0]
        channel_weights = np.mean(gradients, axis=(1, 2))
        cam = np.zeros(activations.shape[1:], dtype=np.float32)
        for channel, weight in enumerate(channel_weights):
            cam += weight * activations[channel]

        cam = np.maximum(cam, 0)
        if cam.max() > 0:
            cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
        cam_tensor = torch.tensor(cam).unsqueeze(0).unsqueeze(0)
        return F.interpolate(cam_tensor, size=(224, 224), mode="bilinear", align_corners=False).squeeze().numpy()


class MLInferenceService:
    """Loads the existing trained artifacts once and performs hierarchical inference."""

    def __init__(self, model_dir: Path):
        self.model_dir = model_dir
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        stage1_path = model_dir / "stage1_model.joblib"
        stage2_path = model_dir / "stage2_3class_model.joblib"
        if not stage1_path.is_file() or not stage2_path.is_file():
            raise FileNotFoundError("Configured ML model directory is missing one or more trained model files")

        self.stage1_model = joblib.load(stage1_path)
        self.stage2_model = joblib.load(stage2_path)
        self.transform = transforms.Compose(
            [
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ]
        )
        weights = models.EfficientNet_B0_Weights.DEFAULT
        self.feature_extractor = models.efficientnet_b0(weights=weights)
        self.feature_extractor.classifier = torch.nn.Identity()
        self.feature_extractor.to(self.device).eval()

        gradcam_model = models.efficientnet_b0(weights=weights).to(self.device)
        self.gradcam = GradCAM(gradcam_model, gradcam_model.features[-1])
        self._lock = threading.Lock()

    def predict(self, image_path: Path) -> dict:
        with self._lock:
            image = Image.open(image_path).convert("RGB")
            tensor = self.transform(image).unsqueeze(0).to(self.device)
            with torch.no_grad():
                embedding = self.feature_extractor(tensor).cpu().numpy().reshape(1, -1)

            stage1_class = int(self.stage1_model.predict(embedding)[0])
            stage1_score = float(np.asarray(self.stage1_model.decision_function(embedding)).reshape(-1)[0])
            gradcam = self._generate_gradcam(image, tensor)
            result = {
                "stage1_prediction": STAGE1_LABELS[stage1_class],
                "stage1_class": stage1_class,
                "stage1_decision_score": stage1_score,
                "final_prediction": STAGE1_LABELS[stage1_class],
                "stage2_prediction": None,
                "stage2_class": None,
                "stage2_decision_score": None,
                "gradcam": gradcam,
            }

            if stage1_class == 1:
                stage2_class = int(self.stage2_model.predict(embedding)[0])
                stage2_scores = np.asarray(self.stage2_model.decision_function(embedding)).reshape(-1)
                result.update(
                    {
                        "stage2_prediction": STAGE2_LABELS[stage2_class],
                        "stage2_class": stage2_class,
                        "stage2_decision_score": float(stage2_scores[stage2_class]),
                        "final_prediction": f"Demented - {STAGE2_LABELS[stage2_class]}",
                    }
                )
            return result

    def _generate_gradcam(self, image: Image.Image, tensor: torch.Tensor) -> str:
        cam = self.gradcam.generate_heatmap(tensor)
        image_np = np.asarray(image.resize((224, 224))) / 255.0
        heatmap = plt.get_cmap("jet")(cam)[:, :, :3]
        overlay = np.clip(0.6 * image_np + 0.4 * heatmap, 0, 1)
        figure, axes = plt.subplots(1, 3, figsize=(10, 3.5))
        axes[0].imshow(image_np)
        axes[0].set_title("Input MRI Scan")
        axes[1].imshow(cam, cmap="jet")
        axes[1].set_title("Grad-CAM Activation")
        axes[2].imshow(overlay)
        axes[2].set_title("Biomarker Overlay")
        for axis in axes:
            axis.axis("off")
        figure.tight_layout()
        buffer = io.BytesIO()
        figure.savefig(buffer, format="png", dpi=200)
        plt.close(figure)
        return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")