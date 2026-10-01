from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "WasteWise" in data["service"]

def test_dependencies():
    response = client.get("/api/health/dependencies")
    assert response.status_code == 200
    data = response.json()
    assert data["database"] == "connected"
