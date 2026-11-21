from pydantic import BaseModel

from app.schemas.analysis import AnalysisResponse


class StageCount(BaseModel):
    stage: str
    count: int


class DashboardStats(BaseModel):
    total_patients: int
    total_analyses: int
    high_risk_cases: int
    analyses_today: int
    recent_predictions: list[AnalysisResponse]
    stage_distribution: list[StageCount]