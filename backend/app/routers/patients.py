from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.analysis import Analysis
from app.models.patient import Patient
from app.models.user import User
from app.schemas.patient import PatientCreate, PatientResponse, PatientUpdate


router = APIRouter(prefix="/patients", tags=["patients"])


def _patient_response(patient: Patient, db: Session) -> PatientResponse:
    analyses = db.scalars(select(Analysis).where(Analysis.patient_id == patient.patient_id).order_by(desc(Analysis.created_at))).all()
    latest = analyses[0] if analyses else None
    return PatientResponse(
        id=patient.id,
        patient_id=patient.patient_id,
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        latest_prediction=latest.final_prediction if latest else None,
        latest_analysis_date=latest.analysis_date if latest else None,
        analysis_count=len(analyses),
        created_at=patient.created_at,
        updated_at=patient.updated_at,
    )


@router.get("", response_model=list[PatientResponse])
def get_patients(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[PatientResponse]:
    del current_user
    return [_patient_response(patient, db) for patient in db.scalars(select(Patient).order_by(Patient.name)).all()]


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> PatientResponse:
    del current_user
    patient = db.scalar(select(Patient).where(Patient.patient_id == patient_id))
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return _patient_response(patient, db)


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    payload: PatientCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> PatientResponse:
    del current_user
    patient = Patient(**payload.model_dump())
    db.add(patient)
    try:
        db.commit()
        db.refresh(patient)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Patient ID already exists") from error
    return _patient_response(patient, db)


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: str,
    payload: PatientUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> PatientResponse:
    del current_user
    patient = db.scalar(select(Patient).where(Patient.patient_id == patient_id))
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    if payload.patient_id != patient.patient_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Patient ID cannot be changed after analyses are linked")
    for field, value in payload.model_dump().items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    return _patient_response(patient, db)