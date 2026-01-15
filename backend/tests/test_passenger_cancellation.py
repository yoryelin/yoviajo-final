
import sys
import os
import requests
from datetime import datetime, timedelta

# BASE_URL Port 8003
BASE_URL = "http://localhost:8003/api"

# Credenciales (from seeded data)
# We need to use DIFFERENT USERS for this test to avoid reputation noise from prev tests if possible.
# But we can reuse, just checking delta.

DRIVER_DNI = "11111111"
DRIVER_PASS = "12345678"
DRIVER_ROLE = "C"

PASSENGER_DNI = "22222222" # Maria Pasajero (starts with 100)
PASSENGER_PASS = "12345678"
PASSENGER_ROLE = "P"

def get_token(dni, password, role):
    res = requests.post(f"{BASE_URL}/login", json={"dni": dni, "password": password, "role": role})
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        sys.exit(1)
    return res.json()["access_token"], res.json()["user"]["reputation_score"]

def create_ride(token, hours_future):
    dep_time = (datetime.now() + timedelta(hours=hours_future)).isoformat()
    data = {
        "origin": "Test Psg Cancel",
        "destination": "Test Psg Cancel",
        "departure_time": dep_time,
        "price": 100,
        "available_seats": 4
    }
    res = requests.post(f"{BASE_URL}/rides/", json=data, headers={"Authorization": f"Bearer {token}"})
    return res.json()["id"]

def book_ride(token, ride_id):
    data = {"ride_id": ride_id, "seats_booked": 1}
    res = requests.post(f"{BASE_URL}/bookings/", json=data, headers={"Authorization": f"Bearer {token}"})
    return res.json()["id"]

def cancel_booking(token, booking_id):
    data = {"status": "cancelled"}
    res = requests.patch(f"{BASE_URL}/bookings/{booking_id}", json=data, headers={"Authorization": f"Bearer {token}"})
    return res.json()

def test_passenger_cancellation():
    print("Testing Passenger Cancellation Rules...", flush=True)
    
    driver_token, _ = get_token(DRIVER_DNI, DRIVER_PASS, DRIVER_ROLE)
    passenger_token, initial_rep = get_token(PASSENGER_DNI, PASSENGER_PASS, PASSENGER_ROLE)
    
    print(f"Initial Passenger Reputation: {initial_rep}")

    # ---------------------------------------------------------
    # Scenario 1: Late Cancellation (> 6 hours) -> NO PENALTY
    # ---------------------------------------------------------
    print("\n[Scenario 1] Ride 8 hours future. Passenger books & cancels.")
    ride_id = create_ride(driver_token, 8)
    booking_id = book_ride(passenger_token, ride_id)
    
    cancel_booking(passenger_token, booking_id)
    
    # Check reputation
    _, current_rep = get_token(PASSENGER_DNI, PASSENGER_PASS, PASSENGER_ROLE)
    print(f"Reputation after (Expect {initial_rep}): {current_rep}")
    
    if current_rep == initial_rep:
        print("✅ PASS: No penalty applied.")
    else:
        print("❌ FAIL: Penalty applied incorrectly.")
        initial_rep = current_rep # Reset baseline

    # ---------------------------------------------------------
    # Scenario 2: Short Notice Cancellation (< 6 hours) -> PENALTY (-5)
    # ---------------------------------------------------------
    print("\n[Scenario 2] Ride 3 hours future. Passenger books & cancels.")
    ride_id = create_ride(driver_token, 3)
    booking_id = book_ride(passenger_token, ride_id)
    
    cancel_booking(passenger_token, booking_id)
    
    # Check reputation
    _, final_rep = get_token(PASSENGER_DNI, PASSENGER_PASS, PASSENGER_ROLE)
    print(f"Reputation after (Expect {initial_rep - 5}): {final_rep}")
    
    if final_rep == initial_rep - 5:
        print("✅ PASS: Penalty (-5) applied correctly.")
    else:
        print("❌ FAIL: Penalty NOT applied correctly.")

if __name__ == "__main__":
    test_passenger_cancellation()
