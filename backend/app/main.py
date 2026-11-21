from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.ml.service import MLInferenceService
from app.routers import analysis, auth, dashboard, patients, settings as settings_router


logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        app.state.ml_service = MLInferenceService(settings.resolved_ml_model_dir)
        logger.info("ML inference service loaded from %s", settings.resolved_ml_model_dir)
    except Exception:
        app.state.ml_service = None
        logger.exception("ML inference service could not be loaded")
    yield


app = FastAPI(title="NeuroVision AI API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(settings_router.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}