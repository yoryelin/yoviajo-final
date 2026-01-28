
import pytest
from app.models.user import User

def test_health_check(client):
    """Verifica que la API responda en la raíz."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "YoViajo API funcionando 🚀"

def test_user_registration_and_login_flow(client, db_session):
    """
    Flujo Crítico:
    1. Registrar usuario nuevo
    2. Iniciar sesión (Login)
    3. Verificar que devuelve un Token
    """
    # 1. Registro
    user_data = {
        "email": "test@example.com",
        "password": "securepassword123",
        "name": "Test User",
        "dni": "12345678"
    }
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 200, f"Error: {response.text}"
    data = response.json()
    assert data["email"] == user_data["email"]
    assert "id" in data
    
    # Validar que se guardó en DB
    user_in_db = db_session.query(User).filter(User.email == user_data["email"]).first()
    assert user_in_db is not None
    assert user_in_db.name == user_data["name"]

    # 2. Login
    login_data = {
        "username": "test@example.com", # OAuth2 usa 'username' para el email
        "password": "securepassword123"
    }
    response = client.post("/api/auth/login", data=login_data) # Form-data
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    
    return token_data["access_token"]

def test_create_ride_flow(client, db_session):
    """
    Flujo Crítico:
    1. Autenticarse
    2. Publicar un viaje
    3. Verificar que se creó
    """
    # Pre-requisito: Tener un token (reutilizamos la lógica, o lo hacemos de nuevo)
    # Hacemos login rápido
    client.post("/api/auth/register", json={
        "email": "driver@example.com", 
        "password": "pass", 
        "name": "Driver",
        "dni": "87654321"
    })
    login_res = client.post("/api/auth/login", data={"username": "driver@example.com", "password": "pass"})
    token = login_res.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Crear Viaje
    ride_data = {
        "origin": "Mar del Plata",
        "destination": "Buenos Aires",
        "departure_time": "2026-12-31T10:00:00",
        "available_seats": 3,
        "price": 5000.0,
        "car_model": "Ford Fiesta",
        "car_plate": "AA123BB"
    }
    
    response = client.post("/api/rides/", json=ride_data, headers=headers)
    assert response.status_code == 201, f"Error creating ride: {response.text}"
    
    ride_resp = response.json()
    assert ride_resp["origin"] == "Mar del Plata"
    assert ride_resp["driver_name"] == "Driver"
    
    # Verificar búsqueda pública
    search_response = client.get("/api/rides/search?origin=Mar&destination=Buenos")
    assert search_response.status_code == 200
    results = search_response.json()
    assert len(results) >= 1
    assert results[0]["origin"] == "Mar del Plata"
