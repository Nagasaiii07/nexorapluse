"""
NEXUS Logistics Intelligence — FastAPI Application Entrypoint.
Production-ready for Vercel Serverless & GitHub CI/CD.
"""
import os
import sys
import time
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

# Ensure backend root is in python path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from core.config import APP_NAME, APP_CODE, APP_VERSION, ALLOWED_ORIGINS, DATABASE_URL
from database.session import DatabaseConnection
from database.seed_data import seed_database
from core.event_manager import event_bus
from core import event_handlers  # Ensure event subscriptions are active

from api.routes_analytics import router as analytics_router
from api.routes_orders import router as orders_router
from api.routes_shipments import router as shipments_router
from api.routes_events import router as events_router
from api.routes_data import router as data_router
from api.routes_reports import router as reports_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes database schema and seed data on startup."""
    try:
        DatabaseConnection.init_db()
        seed_database(force=False)
    except Exception as e:
        print(f"[NEXUS Startup Warning] Database initialization: {e}")
    yield


app = FastAPI(
    title=APP_NAME,
    description="Event-Driven Logistics and E-Commerce Intelligence API",
    version=APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration for Vercel & local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# API Router with /api prefix
api_router = APIRouter(prefix="/api")

@api_router.get("/health", tags=["Health"])
@app.get("/health", tags=["Health"])
def health_check():
    """
    Returns application health, API version, and database connection status
    without exposing credentials.
    """
    db_status = "connected"
    db_type = "PostgreSQL" if "postgresql" in DATABASE_URL else "SQLite"
    db_error = None
    try:
        res = DatabaseConnection.execute_query("SELECT 1 as ping;")
        if not res or res[0]["ping"] != 1:
            db_status = "degraded"
    except Exception as e:
        db_status = "error"
        db_error = f"{type(e).__name__}: {str(e)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "app_name": APP_NAME,
        "app_code": APP_CODE,
        "api_version": APP_VERSION,
        "environment": os.getenv("NODE_ENV", "production"),
        "database": {
            "status": db_status,
            "engine": db_type,
            "error": db_error
        },
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

# Mount sub-routers under /api
api_router.include_router(analytics_router)
api_router.include_router(orders_router)
api_router.include_router(shipments_router)
api_router.include_router(events_router)
api_router.include_router(data_router)
api_router.include_router(reports_router)

# Include both with and without prefix for resilient Vercel routing
app.include_router(api_router)

# Also support non-prefixed calls if Vercel strips /api
app.include_router(analytics_router)
app.include_router(orders_router)
app.include_router(shipments_router)
app.include_router(events_router)
app.include_router(data_router)
app.include_router(reports_router)

@app.get("/", response_class=HTMLResponse)
def root_dashboard():
    """Serves the interactive NEXUS Logistics Intelligence Dashboard UI."""
    index_file = BASE_DIR / "static" / "index.html"
    if index_file.exists():
        with open(index_file, "r", encoding="utf-8") as f:
            return f.read()
    return HTMLResponse("<h1>NEXUS Logistics Intelligence</h1><p>API is active. Visit /docs for documentation.</p>")

@app.get("/api-info")
def root_status():
    """Root status endpoint."""
    return {
        "name": APP_NAME,
        "status": "online",
        "version": APP_VERSION,
        "docs": "/docs",
        "api_health": "/api/health",
        "reference_ui": "NEXUS Logistics Intelligence Design System"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
