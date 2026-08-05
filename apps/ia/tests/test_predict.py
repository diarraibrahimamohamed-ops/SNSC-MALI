import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_predict_score():
    response = client.post("/predict", json={
        "enfant_id": "test-enfant-001",
        "features": {
            "retards_jours": 15,
            "rendez_vous_manques": 2,
            "distance_km": 20,
        },
    })
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert data["niveau_risque"] == "ELEVE"
    assert data["confiance"] > 0


def test_predict_faible_risque():
    response = client.post("/predict", json={
        "enfant_id": "test-enfant-002",
        "features": {
            "retards_jours": 0,
            "rendez_vous_manques": 0,
            "distance_km": 5,
        },
    })
    assert response.status_code == 200
    data = response.json()
    assert data["niveau_risque"] == "FAIBLE"
