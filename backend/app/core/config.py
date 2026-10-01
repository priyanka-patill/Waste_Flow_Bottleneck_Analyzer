import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "WasteWise Digital Twin Backend"
    VERSION: str = "1.0.0"
    ENV: str = "development"
    
    # Database URL
    DATABASE_URL: str = "sqlite:///./wastewise.db"
    
    # External API Keys
    DATAGOV_API_KEY: str = ""
    OPENAQ_API_KEY: str = ""
    
    # Integration Base URLs
    OSRM_BASE_URL: str = "https://router.project-osrm.org"
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com"
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
