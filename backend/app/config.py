import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SubFlow"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./subflow.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "subflow-hackathon-dark-luxury-neon-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    PDF_STORAGE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage", "invoices")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
