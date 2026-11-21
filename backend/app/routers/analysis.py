import base64
import io
import logging
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import FileResponse
from PIL import Image, UnidentifiedImageError
from sqlalchemy import desc, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.database import get_db
from app.dependencies.auth import get_current_user, get_current_user_flexible
from app.ml.service import MLInferenceService
from app.models.analysis import Analysis
from app.models.doctor_review import DoctorReview
from app.models.patient import Patient
from app.models.user import User
from app.schemas.analysis import AnalysisResponse, PredictionResponse
from app.schemas.doctor_review import DoctorReviewListItem, DoctorReviewResponse, DoctorReviewWrite


router = APIRouter(prefix="/analysis", tags=["analysis"])
logger = logging.getLogger(__name__)
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg"}
MAX_UPLOAD_BYTES = 15 * 1024 * 1024


def _relative_upload_path(path: Path) -> str:
    return path.relative_to(Path(__file__).resolve().parents[2]).as_posix()


def _gradcam_data_url(relative_path: str | None) -> str | None:
    if not relative_path:
        return None
    path = Path(__file__).resolve().parents[2] / relative_path
    if not path.is_file():
        return None
    return "data:image/png;base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def _analysis_response(analysis: Analysis, include_path: bool = False, include_gradcam: bool = False) -> dict:
    response = {
        "analysis_id": analysis.analysis_id,
        "patient_id": analysis.patient_id,
        "patient_name": analysis.patient_name,
        "mri_filename": analysis.mri_filename,
        "mri_path": analysis.mri_path,
        "stage1_prediction": analysis.stage1_prediction,
        "stage1_class": 1 if analysis.stage1_prediction == "Demented" else 0,
        "stage1_decision_score": analysis.stage1_decision_score,
        "final_prediction": analysis.final_prediction,
        "stage2_prediction": analysis.stage2_prediction,
        "stage2_class": {"Very Mild": 0, "Mild": 1, "Moderate": 2}.get(analysis.stage2_prediction),
        "stage2_decision_score": analysis.stage2_decision_score,
        "gradcam": _gradcam_data_url(analysis.gradcam_path) if include_gradcam else None,
        "gradcam_path": analysis.gradcam_path,
        "analysis_date": analysis.analysis_date,
        "status": analysis.status,
        "clinical_notes": analysis.clinical_notes,
    }
    if include_path:
        response["mri_path"] = analysis.mri_path
    return response


def _doctor_review_response(review: DoctorReview) -> DoctorReviewResponse:
    return DoctorReviewResponse(
        id=review.id,
        analysis_id=review.analysis_id,
        doctor_id=review.doctor_id,
        doctor_name=review.doctor.name,
        is_correct=review.is_correct,
        remarks=review.remarks,
        created_at=review.created_at,
        updated_at=review.updated_at,
    )


def _require_analysis(db: Session, analysis_id: str) -> Analysis:
    analysis = db.scalar(select(Analysis).where(Analysis.analysis_id == analysis_id))
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return analysis


def _doctor_review_for_user(db: Session, analysis_id: str, doctor_id: int) -> DoctorReview | None:
    return db.scalar(
        select(DoctorReview).where(
            DoctorReview.analysis_id == analysis_id,
            DoctorReview.doctor_id == doctor_id,
        )
    )


@router.post("/predict", response_model=PredictionResponse)
async def predict_analysis(
    request: Request,
    file: UploadFile,
    patient_id: str = Form(...),
    patient_name: str | None = Form(None),
    clinical_notes: str | None = Form(None),
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
) -> PredictionResponse:
    del current_user
    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PNG and JPEG MRI images are supported")

    contents = await file.read()
    await file.close()
    if not contents:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The uploaded image is empty")
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The uploaded image is too large")

    try:
        with Image.open(io.BytesIO(contents)) as image:
            image.verify()
    except (UnidentifiedImageError, OSError) as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The uploaded file is not a valid PNG or JPEG image") from error

    service: MLInferenceService | None = getattr(request.app.state, "ml_service", None)
    if service is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="The ML model is unavailable")

    patient = db.scalar(select(Patient).where(Patient.patient_id == patient_id))
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    analysis_id = f"analysis-{uuid.uuid4().hex}"
    safe_name = f"{analysis_id}{extension}"
    mri_dir = settings.resolved_upload_dir / "mri"
    gradcam_dir = settings.resolved_upload_dir / "gradcam"
    mri_dir.mkdir(parents=True, exist_ok=True)
    gradcam_dir.mkdir(parents=True, exist_ok=True)
    temporary_path = None
    mri_path = mri_dir / safe_name
    gradcam_path = gradcam_dir / f"{analysis_id}.png"

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as temporary_file:
            temporary_file.write(contents)
            temporary_path = Path(temporary_file.name)
        prediction = service.predict(temporary_path)
        gradcam_data = prediction.get("gradcam")
        if gradcam_data and gradcam_data.startswith("data:image/png;base64,"):
            gradcam_path.write_bytes(base64.b64decode(gradcam_data.split(",", 1)[1]))
        mri_path.write_bytes(contents)
        analysis = Analysis(
            analysis_id=analysis_id,
            patient_id=patient_id,
            patient_name=patient.name,
            mri_filename=file.filename or safe_name,
            mri_path=_relative_upload_path(mri_path),
            final_prediction=prediction["final_prediction"],
            stage1_prediction=prediction["stage1_prediction"],
            stage1_decision_score=prediction["stage1_decision_score"],
            stage2_prediction=prediction["stage2_prediction"],
            stage2_decision_score=prediction["stage2_decision_score"],
            analysis_date=datetime.now(timezone.utc),
            status="Completed",
            clinical_notes=clinical_notes,
            gradcam_path=_relative_upload_path(gradcam_path) if gradcam_path.is_file() else None,
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        return PredictionResponse(**_analysis_response(analysis, include_gradcam=True))
    except HTTPException:
        raise
    except Exception as error:
        db.rollback()
        mri_path.unlink(missing_ok=True)
        gradcam_path.unlink(missing_ok=True)
        logger.exception("MRI analysis persistence failed: %s", error)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="MRI analysis could not be saved") from error
    finally:
        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)


@router.get("", response_model=list[AnalysisResponse])
def get_analyses(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[AnalysisResponse]:
    del current_user
    analyses = db.scalars(select(Analysis).order_by(desc(Analysis.created_at))).all()
    return [AnalysisResponse(**_analysis_response(analysis, include_path=True)) for analysis in analyses]


@router.get("/patient/{patient_id}", response_model=list[AnalysisResponse])
def get_patient_analyses(
    patient_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[AnalysisResponse]:
    del current_user
    analyses = db.scalars(
        select(Analysis).where(Analysis.patient_id == patient_id).order_by(desc(Analysis.created_at))
    ).all()
    return [AnalysisResponse(**_analysis_response(analysis, include_path=True)) for analysis in analyses]


@router.get("/reviews", response_model=list[DoctorReviewListItem])
def get_all_doctor_reviews(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[DoctorReviewListItem]:
    del current_user
    reviews = db.scalars(
        select(DoctorReview)
        .options(joinedload(DoctorReview.analysis), joinedload(DoctorReview.doctor))
        .order_by(desc(DoctorReview.created_at))
    ).all()

    items = []
    for review in reviews:
        if review.analysis is None or review.doctor is None:
            continue
        stage = (
            "Normal"
            if review.analysis.stage1_prediction == "Non-Demented"
            else (review.analysis.stage2_prediction or "Normal")
        )
        items.append(
            DoctorReviewListItem(
                id=review.id,
                analysis_id=review.analysis_id,
                patient_id=review.analysis.patient_id,
                patient_name=review.analysis.patient_name,
                final_prediction=review.analysis.final_prediction,
                predicted_stage=stage,
                stage=stage,
                is_correct=review.is_correct,
                remarks=review.remarks,
                doctor_id=review.doctor_id,
                doctor_name=review.doctor.name,
                created_at=review.created_at,
                updated_at=review.updated_at,
            )
        )
    return items


@router.get("/{analysis_id}/review", response_model=DoctorReviewResponse)
def get_doctor_review(
    analysis_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> DoctorReviewResponse:
    _require_analysis(db, analysis_id)
    review = _doctor_review_for_user(db, analysis_id, current_user.id)
    if review is None:
        review = db.scalar(
            select(DoctorReview)
            .where(DoctorReview.analysis_id == analysis_id)
            .order_by(desc(DoctorReview.updated_at))
        )
    if review is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No doctor review found for this analysis")
    return _doctor_review_response(review)


@router.post("/{analysis_id}/review", response_model=DoctorReviewResponse)
def create_doctor_review(
    analysis_id: str,
    payload: DoctorReviewWrite,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> DoctorReviewResponse:
    _require_analysis(db, analysis_id)
    review = _doctor_review_for_user(db, analysis_id, current_user.id)
    if review is None:
        review = DoctorReview(
            analysis_id=analysis_id,
            doctor_id=current_user.id,
            is_correct=payload.is_correct,
            remarks=payload.remarks,
        )
        db.add(review)
    else:
        review.is_correct = payload.is_correct
        review.remarks = payload.remarks

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A doctor review already exists for this analysis",
        ) from error

    db.refresh(review)
    return _doctor_review_response(review)


@router.put("/{analysis_id}/review", response_model=DoctorReviewResponse)
def update_doctor_review(
    analysis_id: str,
    payload: DoctorReviewWrite,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> DoctorReviewResponse:
    _require_analysis(db, analysis_id)
    review = _doctor_review_for_user(db, analysis_id, current_user.id)
    if review is None:
        existing_any = db.scalar(
            select(DoctorReview).where(DoctorReview.analysis_id == analysis_id)
        )
        if existing_any is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to modify another doctor's review",
            )
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No doctor review found for this analysis")

    review.is_correct = payload.is_correct
    review.remarks = payload.remarks
    db.commit()
    db.refresh(review)
    return _doctor_review_response(review)


@router.delete("/{analysis_id}/review", status_code=status.HTTP_204_NO_CONTENT)
def delete_doctor_review(
    analysis_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    _require_analysis(db, analysis_id)
    review = _doctor_review_for_user(db, analysis_id, current_user.id)
    if review is None:
        existing_any = db.scalar(
            select(DoctorReview).where(DoctorReview.analysis_id == analysis_id)
        )
        if existing_any is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to delete another doctor's review",
            )
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No doctor review found for this analysis")

    db.delete(review)
    db.commit()
    return None


@router.get("/{analysis_id}/image")
def get_analysis_image(
    analysis_id: str,
    current_user: Annotated[User, Depends(get_current_user_flexible)],
    db: Annotated[Session, Depends(get_db)],
) -> FileResponse:
    del current_user
    analysis = db.scalar(select(Analysis).where(Analysis.analysis_id == analysis_id))
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")

    if not analysis.mri_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MRI image path not recorded")

    backend_root = Path(__file__).resolve().parents[2]
    image_path = (backend_root / analysis.mri_path).resolve()
    upload_root = settings.resolved_upload_dir.resolve()

    if not image_path.is_relative_to(upload_root):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if not image_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MRI scan image file not found")

    ext = image_path.suffix.lower()
    media_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }
    media_type = media_types.get(ext, "application/octet-stream")

    return FileResponse(
        path=str(image_path),
        media_type=media_type,
        filename=analysis.mri_filename or image_path.name,
    )


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> AnalysisResponse:
    del current_user
    analysis = db.scalar(select(Analysis).where(Analysis.analysis_id == analysis_id))
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return AnalysisResponse(**_analysis_response(analysis, include_path=True, include_gradcam=True))
