from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.analysis import Analysis
from app.models.patient import Patient
from app.models.user import User
from app.routers.analysis import _analysis_response
from app.schemas.dashboard import DashboardStats, StageCount


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> DashboardStats:
    del current_user
    analyses = db.scalars(select(Analysis).order_by(desc(Analysis.created_at))).all()
    stage_counts = {stage: 0 for stage in ("Normal", "Very Mild", "Mild", "Moderate")}
    for analysis in analyses:
        stage = "Normal" if analysis.stage1_prediction == "Non-Demented" else analysis.stage2_prediction
        if stage in stage_counts:
            stage_counts[stage] += 1
    today_count = sum(1 for analysis in analyses if analysis.created_at and analysis.created_at.date() == date.today())
    return DashboardStats(
        total_patients=db.query(Patient).count(),
        total_analyses=len(analyses),
        high_risk_cases=sum(1 for analysis in analyses if analysis.stage1_prediction == "Demented"),
        analyses_today=today_count,
        recent_predictions=[_analysis_response(analysis, include_path=True) for analysis in analyses[:5]],
        stage_distribution=[StageCount(stage=stage, count=count) for stage, count in stage_counts.items()],
    )