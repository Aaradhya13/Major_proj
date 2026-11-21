from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict


load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class AppSettings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5433/neurovision"
    jwt_secret: str = "change-this-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: str = "http://localhost:5173"
    ml_model_dir: str = "../efficientnet/models"
    upload_dir: str = "uploads"

    model_config = SettingsConfigDict(env_file=None, extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def resolved_ml_model_dir(self) -> Path:
        model_dir = Path(self.ml_model_dir)
        if not model_dir.is_absolute():
            model_dir = Path(__file__).resolve().parents[2] / model_dir
        return model_dir.resolve()

    @property
    def resolved_upload_dir(self) -> Path:
        upload_dir = Path(self.upload_dir)
        if not upload_dir.is_absolute():
            upload_dir = Path(__file__).resolve().parents[1] / upload_dir
        return upload_dir.resolve()


settings = AppSettings()