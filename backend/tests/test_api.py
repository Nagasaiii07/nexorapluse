"""
Unit and Integration Tests for NEXUS FastAPI Endpoints.
"""
import sys
from pathlib import Path
from fastapi.testclient import TestClient

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from main import app

def test_health_check():
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ("healthy", "degraded")
        assert data["app_code"] == "NEXUS"
        assert "database" in data
        assert data["database"]["status"] == "connected"

def test_overview_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/overview")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "kpis" in data
        assert "trend" in data
        assert "status_overview" in data
        assert "top_states" in data
        assert "recent_orders" in data
        assert data["kpis"]["total_orders"]["value"] == "8,426"

def test_platform_filter_overview():
    with TestClient(app) as client:
        response = client.get("/api/overview?platform=Amazon")
        assert response.status_code == 200
        data = response.json()
        raw_orders = data["kpis"]["total_orders"]["raw_value"]
        assert raw_orders > 0
        assert raw_orders < 8426

def test_orders_list():
    with TestClient(app) as client:
        response = client.get("/api/orders?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert len(data["orders"]) <= 10

def test_events_stream():
    with TestClient(app) as client:
        response = client.get("/api/events?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert len(data["events"]) > 0
