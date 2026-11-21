from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class DoctorReviewWrite(BaseModel):
    is_correct: bool
    remarks: str | None = Field(default=None, max_length=2000)

    @field_validator("remarks")
    @classmethod
    def normalize_remarks(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None


class DoctorReviewResponse(BaseModel):
    id: int
    analysis_id: str
    doctor_id: int
    doctor_name: str
    is_correct: bool
    remarks: str | None
    created_at: datetime
    updated_at: datetime


class DoctorReviewListItem(BaseModel):
    id: int
    analysis_id: str
    patient_id: str
    patient_name: str
    final_prediction: str
    predicted_stage: str
    stage: str
    is_correct: bool
    remarks: str | None
    doctor_id: int
    doctor_name: str
    created_at: datetime
    updated_at: datetime

