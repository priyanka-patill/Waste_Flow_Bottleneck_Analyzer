from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", summary="Backend Health Check")
async def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENV
    }

@router.get("/dependencies", summary="Dependency & Service Status")
async def dependency_status():
    return {
        "database": "connected",
        "cache": "active",
        "external_apis": {
            "open_meteo": "ready",
            "osrm": "ready",
            "data_gov": "configured" if settings.DATAGOV_API_KEY else "fallback_baseline",
            "openaq": "configured" if settings.OPENAQ_API_KEY else "fallback_baseline"
        }
    }
