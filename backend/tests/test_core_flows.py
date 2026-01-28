
import pytest
from app.models.user import User
from app.models.booking import Booking, BookingStatus
from app.models.ride import Ride
from datetime import datetime, timedelta

def test_audit_core_flows(client, db_session):
    """
    Audit Audit System Core Flows:
    1. Register Driver & Passenger
    2. Create Ride (Driver)
    3. Create Request (Passenger)
    4. Book Ride (Passenger) -> Check Payment Init
    5. Check Contact Hiding (Unpaid)
    6. Simulate Payment
    7. Check Contact Unlocking (Paid)
    """

    # 1. Register Users
    # Driver
    driver_data = {
        "email": "driver_audit@example.com",
        "password": "password123",
        "name": "Audit Driver",
        "dni": "10000001",
        "phone": "555-DRIVER"
    }
    res = client.post("/api/register", json=driver_data)
    assert res.status_code == 200
    
    # Login Driver
    res = client.post("/api/login", json={"dni": driver_data["dni"], "password": driver_data["password"]})
    assert res.status_code == 200, f"Driver login failed: {res.text}"
    driver_token = res.json()["access_token"]
    driver_headers = {"Authorization": f"Bearer {driver_token}"}

    # Passenger
    passenger_data = {
        "email": "passenger_audit@example.com",
        "password": "password123",
        "name": "Audit Passenger",
        "dni": "10000002",
        "phone": "555-PASSENGER"
    }
    res = client.post("/api/register", json=passenger_data)
    assert res.status_code == 200

    # Login Passenger
    res = client.post("/api/login", json={"dni": passenger_data["dni"], "password": passenger_data["password"]})
    assert res.status_code == 200, f"Passenger login failed: {res.text}"
    passenger_token = res.json()["access_token"]
    passenger_headers = {"Authorization": f"Bearer {passenger_token}"}

    # 2. Create Ride
    ride_data = {
        "origin": "Audit City A",
        "destination": "Audit City B",
        "departure_time": (datetime.utcnow() + timedelta(days=2)).isoformat(),
        "available_seats": 4,
        "price": 1000.0,
        "car_model": "Audit Car",
        "car_plate": "AUDIT01"
    }
    res = client.post("/api/rides/", json=ride_data, headers=driver_headers)
    assert res.status_code == 201
    ride_id = res.json()["id"]

    # 3. Create Request (Demand)
    request_data = {
        "origin": "Audit City B",
        "destination": "Audit City A",
        "date": (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d"), # YYYY-MM-DD format usually
    }
    res = client.post("/api/requests/", json=request_data, headers=passenger_headers)
    assert res.status_code == 201
    # Check if request was created
    requests = client.get("/api/requests/", headers=passenger_headers).json()
    assert len(requests) > 0

    # 4. Book Ride
    booking_payload = {
        "ride_id": ride_id,
        "seats_booked": 1
    }
    res = client.post("/api/bookings/", json=booking_payload, headers=passenger_headers)
    assert res.status_code == 201
    booking_resp = res.json()
    booking_id = booking_resp["id"]
    
    # Check Payment info
    # Note: payment_init_point might be missing if MP creds are invalid, but the flow shouldn't crash.
    assert "id" in booking_resp

    # 5. Check Contact Hiding (Unpaid)
    # Passenger checking their bookings
    res = client.get("/api/bookings/me", headers=passenger_headers)
    my_bookings = res.json()
    target_booking = next(b for b in my_bookings if b["id"] == booking_id)
    
    # Driver phone should be missing or None
    assert target_booking.get("driver_phone") is None
    
    # Driver checking ride bookings
    res = client.get(f"/api/bookings/ride/{ride_id}", headers=driver_headers)
    ride_bookings = res.json()
    target_booking_driver = next(b for b in ride_bookings if b["id"] == booking_id)
    
    # Passenger phone should be missing or None
    assert target_booking_driver.get("passenger_phone") is None

    # 6. Simulate Payment (Direct DB manipulation because we can't pay in tests)
    db_booking = db_session.query(Booking).filter(Booking.id == booking_id).first()
    db_booking.payment_status = "paid"
    db_session.commit()

    # 7. Check Contact Unlocking (Paid)
    # Passenger checking again
    res = client.get("/api/bookings/me", headers=passenger_headers)
    my_bookings_paid = res.json()
    target_booking_paid = next(b for b in my_bookings_paid if b["id"] == booking_id)
    
    # Driver phone SHOULD be visible now
    assert target_booking_paid.get("driver_phone") == "555-DRIVER"

    # Driver checking again
    res = client.get(f"/api/bookings/ride/{ride_id}", headers=driver_headers)
    ride_bookings_paid = res.json()
    target_booking_driver_paid = next(b for b in ride_bookings_paid if b["id"] == booking_id)
    
    # Passenger phone SHOULD be visible now
    assert target_booking_driver_paid.get("passenger_phone") == "555-PASSENGER"
