from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "wasteCollectedTonnes" in data["data"]
    assert "topBottleneck" in data["data"]

def test_flow_network():
    response = client.get("/api/flow/network")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["nodes"]) > 0
