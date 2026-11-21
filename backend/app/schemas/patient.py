from datetime import datetime

from pydantic import BaseModel, Field


class PatientCreate(BaseModel):
    patient_id: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=160)
    age: int = Field(ge=0, le=150)
    gender: str = Field(min_length=1, max_length=40)


class PatientUpdate(PatientCreate):
    pass


class PatientResponse(BaseModel):
    id: int
    patient_id: str
    name: str
    age: int
    gender: str
    latest_prediction: str | None = None
    latest_analysis_date: datetime | None = None
    analysis_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}