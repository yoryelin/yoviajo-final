import requests
import sys
import time
from datetime import datetime, timedelta

# Configuración
API_URL = "http://localhost:8003/api"
TIMESTAMP = int(time.time())
# DNI must be numeric. limiting to 8 digits for realism or just ensuring it's an int string
DRIVER_DNI = str(TIMESTAMP)[-8:] # Get last 8 digits
PASSENGER_DNI = str(TIMESTAMP + 1)[-8:]
DRIVER_EMAIL = f"driver_{TIMESTAMP}@test.com"
PASSENGER_EMAIL = f"passenger_{TIMESTAMP}@test.com"
PASSWORD = "password123"

def print_step(msg):
    print(f"\n🔹 {msg}...")

def check_response(response, expected_status=200):
    if response.status_code != expected_status:
        print(f"❌ ERROR: Expected {expected_status}, got {response.status_code}")
        print(response.text)
        sys.exit(1)
    return response.json()

try:
    print("🤖 Iniciando Test E2E Automático (El Bot Probador)")
    print(f"Target: {API_URL}")

    # 1. Registrar Conductor
    print_step("1. Registrando Conductor")
    payload = {
        "dni": DRIVER_DNI,
        "email": DRIVER_EMAIL,
        "name": "Auto Driver",
        "password": PASSWORD,
        "role": "C"
    }
    check_response(requests.post(f"{API_URL}/register", json=payload))
    print(f"   ✅ Conductor registrado (DNI: {DRIVER_DNI}).")

    # 2. Login Conductor
    print_step("2. Login Conductor")
    login_payload = {"dni": DRIVER_DNI, "password": PASSWORD, "role": "C"}
    resp = check_response(requests.post(f"{API_URL}/login", json=login_payload))
    driver_token = resp["access_token"]
    driver_headers = {"Authorization": f"Bearer {driver_token}"}
    print("   ✅ Login exitoso. Token recibido.")

    # 3. Registrar Pasajero
    print_step("3. Registrando Pasajero")
    pass_payload = {
        "dni": PASSENGER_DNI,
        "email": PASSENGER_EMAIL,
        "name": "Auto Passenger",
        "password": PASSWORD,
        "role": "P"
    }
    check_response(requests.post(f"{API_URL}/register", json=pass_payload))
    print(f"   ✅ Pasajero registrado (DNI: {PASSENGER_DNI}).")

    # 4. Login Pasajero
    print_step("4. Login Pasajero")
    login_payload_p = {"dni": PASSENGER_DNI, "password": PASSWORD, "role": "P"}
    resp_p = check_response(requests.post(f"{API_URL}/login", json=login_payload_p))
    passenger_token = resp_p["access_token"]
    passenger_headers = {"Authorization": f"Bearer {passenger_token}"}
    print("   ✅ Login exitoso.")

    # 5. Publicar Viaje
    print_step("5. Conductor publica viaje")
    departure = (datetime.utcnow() + timedelta(hours=24)).isoformat()
    ride_payload = {
        "origin": "Buenos Aires",
        "destination": "Mar del Plata",
        "departure_time": departure,
        "available_seats": 4,
        "price": 5000.0,
        "origin_lat": -34.6037,
        "origin_lng": -58.3816,
        "destination_lat": -38.0055,
        "destination_lng": -57.5426
    }
    ride_resp = check_response(requests.post(f"{API_URL}/rides/", json=ride_payload, headers=driver_headers))
    ride_id = ride_resp["id"]
    print(f"   ✅ Viaje publicado. ID: {ride_id}")

    # 6. Pasajero busca viaje
    print_step("6. Pasajero busca viajes")
    rides = check_response(requests.get(f"{API_URL}/rides/"))
    found = any(r["id"] == ride_id for r in rides)
    if not found:
        print("❌ El viaje publicado no aparece en la lista.")
        sys.exit(1)
    print("   ✅ Viaje encontrado en la lista pública.")

    # 7. Pasajero Reserva
    print_step("7. Pasajero intenta reservar")
    book_payload = {"ride_id": ride_id}
    check_response(requests.post(f"{API_URL}/bookings/", json=book_payload, headers=passenger_headers))
    print("   ✅ Reserva creada exitosamente.")

    print("\n🎉 ¡PRUEBA EXITOSA! El sistema funciona correctamente end-to-end.")
    
except requests.exceptions.ConnectionError:
    print("\n❌ ERROR DE CONEXIÓN: No se pudo conectar a localhost:8003. ¿Está Docker corriendo?")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ ERROR INESPERADO: {e}")
    sys.exit(1)
