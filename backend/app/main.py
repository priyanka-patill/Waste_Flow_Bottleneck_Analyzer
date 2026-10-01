from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.seed import seed_database
from app.api.routes import (
    health,
    dashboard,
    facilities,
    vehicles,
    flow,
    bottlenecks,
    root_cause,
    simulation,
    optimization,
    environmental,
    scenarios,
    external_data
)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="WasteWise Digital Twin Backend & Bottleneck Intelligence Engine",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(facilities.router, prefix="/api")
app.include_router(vehicles.router, prefix="/api")
app.include_router(flow.router, prefix="/api")
app.include_router(bottlenecks.router, prefix="/api")
app.include_router(root_cause.router, prefix="/api")
app.include_router(simulation.router, prefix="/api")
app.include_router(optimization.router, prefix="/api")
app.include_router(environmental.router, prefix="/api")
app.include_router(scenarios.router, prefix="/api")
app.include_router(external_data.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "WasteWise Digital Twin Backend is running",
        "docs": "/docs",
        "health": "/api/health"
    }
