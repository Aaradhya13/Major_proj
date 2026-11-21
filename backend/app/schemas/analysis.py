from pydantic import BaseModel
from datetime import datetime


class PredictionResponse(BaseModel):
    analysis_id: str
    patient_id: str
    patient_name: str
    mri_filename: str
    mri_path: str | None = None
    stage1_prediction: str
    stage1_class: int
    stage1_decision_score: float
    final_prediction: str
    stage2_prediction: str | None
    stage2_class: int | None
    stage2_decision_score: float | None
    gradcam: str | None
    gradcam_path: str | None
    analysis_date: datetime
    status: str
    clinical_notes: str | None


class AnalysisResponse(PredictionResponse):
    mri_path: str