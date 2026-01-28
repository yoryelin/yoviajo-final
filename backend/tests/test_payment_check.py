
import pytest
from unittest.mock import patch, MagicMock
from app.models.user import User
from app.models.ride import Ride
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment
from datetime import datetime, timedelta
import time

@pytest.fixture
def mock_payment_service():
    # Patch globally at the service definition level (for bookings.py local import)
    with patch("app.services.payment_service.PaymentService") as MockServiceDef:
        # Patch at the usage level in payment routes (for payment.py top-level import)
        with patch("app.api.routes.payment.PaymentService") as MockServiceRoute:
            instance = MockServiceDef.return_value
            MockServiceRoute.return_value = instance # Share the same instance
            yield instance

def test_active_payment_check_flow(client, db_session, mock_payment_service):
    """
    Verifica que el endpoint /check/{booking_id} actualice la reserva
    cuando encuentra un pago aprobado en MercadoPago via API Search.
    """
    import time
    timestamp = int(time.time())
    
    # Driver
    print("--- Registering Driver ---")
    driver_email = f"driver_{timestamp}@test.com"
    driver_data = {"email": driver_email, "password": "password123", "name": "Driver P", "dni": "11111111"}
    reg_res = client.post("/api/register", json=driver_data)
    assert reg_res.status_code in [200, 400], f"Driver Reg Failed: {reg_res.text}"
    
    login_res = client.post("/api/login", json={"dni": "11111111", "password": "password123", "role": "driver"})
    assert login_res.status_code == 200, f"Driver login failed: {login_res.text}"
    driver_token = login_res.json()["access_token"]
    
    # Passenger
    print("--- Registering Passenger ---")
    pass_email = f"passenger_{timestamp}@test.com"
    passenger_data = {"email": pass_email, "password": "password123", "name": "Passenger P", "dni": "22222222"}
    reg_res2 = client.post("/api/register", json=passenger_data)
    assert reg_res2.status_code in [200, 400], f"Passenger Reg Failed: {reg_res2.text}"
    
    passenger_res = client.post("/api/login", json={"dni": "22222222", "password": "password123"})
    assert passenger_res.status_code == 200, f"Passenger login failed: {passenger_res.text}"
    passenger_token = passenger_res.json()["access_token"]
    
    # Ride
    print("--- Creating Ride ---")
    ride_data = {
        "origin": "A", "destination": "B", 
        "departure_time": (datetime.utcnow() + timedelta(days=1)).isoformat(),
        "available_seats": 2, "price": 100.0,
        "car_model": "Car", "car_plate": "ABC"
    }
    ride_res = client.post("/api/rides/", json=ride_data, headers={"Authorization": f"Bearer {driver_token}"})
    assert ride_res.status_code == 201, f"Ride creation failed: {ride_res.text}"
    ride_id = ride_res.json()["id"]
    
    # Booking
    print("--- Creating Booking ---")
    # Setup mock return for create_preference called inside bookings.py
    mock_payment_service.create_preference.return_value = {"preference_id": "test", "init_point": "http://test", "sandbox_init_point": "http://test"}
    
    booking_res = client.post(f"/api/bookings/", json={"ride_id": ride_id, "seats": 1}, headers={"Authorization": f"Bearer {passenger_token}"})
    assert booking_res.status_code == 201, f"Booking creation failed: {booking_res.text}"
    booking_id = booking_res.json()["id"]
    
    # Verify initial state
    db_session.expire_all()
    booking_db = db_session.query(Booking).filter(Booking.id == booking_id).first()
    assert booking_db.payment_status == "pending" or booking_db.payment_status == "unpaid"
    
    # 2. Mock MercadoPago Response
    print("--- Mocking Search Response ---")
    # Simulamos que search_payment_by_reference retorna un pago aprobado
    mock_payment_service.search_payment_by_reference.return_value = {
        "id": 123456789,
        "status": "approved",
        "detail": "accredited",
        "transaction_amount": 100.0,
        "currency_id": "ARS",
        "items": [{"id": str(booking_id)}],
        "external_reference": str(booking_id)
    }
    
    # 3. Call the Active Check Endpoint
    print(f"--- Calling Check Endpoint for Booking {booking_id} ---")
    response = client.post(f"/api/payment/check/{booking_id}")
    
    print(f"Check Response: {response.text}")
    assert response.status_code == 200, f"Check Endpoint Failed: {response.text}"
    data = response.json()
    assert data["status"] == "paid"
    
    # 4. Verify DB Updates
    print("--- Verifying DB updates ---")
    db_session.expire_all()
    booking_updated = db_session.query(Booking).filter(Booking.id == booking_id).first()
    assert booking_updated.payment_status == "paid"
    assert booking_updated.status == BookingStatus.CONFIRMED.value
    
    payment_record = db_session.query(Payment).filter(Payment.booking_id == booking_id).first()
    assert payment_record is not None
    assert payment_record.status == "approved"
    
    print("\n✅ Test Active Payment Check PASSED")

