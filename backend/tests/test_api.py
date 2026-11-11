import os

os.environ["DATABASE_URL"] = "sqlite:///./test_homiego.db"

from fastapi.testclient import TestClient
from app.main import app


def test_health():
    with TestClient(app) as client:
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json()["status"] == "ok"


def test_registration_and_login():
    email = "test@homiego.example.com"
    password = "LongPass123!"

    with TestClient(app) as client:

        register_response = client.post(
            "/auth/register",
            json={
                "email": email,
                "password": password,
                "first_name": "Test"
            }
        )

        assert register_response.status_code in (201, 409)

        login_response = client.post(
            "/auth/login",
            json={
                "email": email,
                "password": password
            }
        )

        assert login_response.status_code == 200

        assert "access_token" in login_response.json()