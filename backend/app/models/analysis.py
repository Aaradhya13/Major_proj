from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, func
from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.doctor_review import DoctorReview


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(primary_key=True)
    analysis_id: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.patient_id"), index=True, nullable=False)
    patient_name: Mapped[str] = mapped_column(String(160), nullable=False)
    mri_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    mri_path: Mapped[str] = mapped_column(String(500), nullable=False)
    final_prediction: Mapped[str] = mapped_column(String(160), nullable=False)
    stage1_prediction: Mapped[str] = mapped_column(String(80), nullable=False)
    stage1_decision_score: Mapped[float] = mapped_column(Float, nullable=False)
    stage2_prediction: Mapped[str | None] = mapped_column(String(80), nullable=True)
    stage2_decision_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    analysis_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="Completed")
    clinical_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    gradcam_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    doctor_reviews: Mapped[list[DoctorReview]] = relationship(back_populates="analysis")
