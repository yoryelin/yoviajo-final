
import sys
import os
import requests
from datetime import datetime, timedelta

# Mock setup - we will use direct API calls to localhost since backend is running
BASE_URL = "http://localhost:8002/api"

# Credenciales (from seeded data)
DRIVER_DNI = "11111111"
DRIVER_PASS = "12345678"
DRIVER_ROLE = "C"

PASSENGER_DNI = "22222222"
PASSENGER_PASS = "12345678"
PASSENGER_ROLE = "P"

def get_token(dni, password, role):
    res = requests.post(f"{BASE_URL}/login", json={"dni": dni, "password": password, "role": role})
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        sys.exit(1)
    return res.json()["access_token"]

def create_ride(token, hours_future):
    dep_time = (datetime.now() + timedelta(hours=hours_future)).isoformat()
    data = {
        "origin": "Test Origin",
        "destination": "Test Destination",
        "departure_time": dep_time,
        "price": 100,
        "available_seats": 4
    }
    res = requests.post(f"{BASE_URL}/rides/", json=data, headers={"Authorization": f"Bearer {token}"})
    if res.status_code != 200:
        print(f"Create Ride failed: {res.text}")
        return None
    return res.json()["id"]

def book_ride(token, ride_id):
    data = {"ride_id": ride_id, "seats_booked": 1}
    res = requests.post(f"{BASE_URL}/bookings/", json=data, headers={"Authorization": f"Bearer {token}"})
    if res.status_code != 201:
        print(f"Booking failed: {res.text}")
        return False
    return True

def cancel_ride(token, ride_id):
    res = requests.delete(f"{BASE_URL}/rides/{ride_id}", headers={"Authorization": f"Bearer {token}"})
    return res.json()

def test_driver_cancellation():
    print("Testing Driver Cancellation Rules...", flush=True)
    
    driver_token = get_token(DRIVER_DNI, DRIVER_PASS, DRIVER_ROLE)
    passenger_token = get_token(PASSENGER_DNI, PASSENGER_PASS, PASSENGER_ROLE)
    
    # ---------------------------------------------------------
    # Scenario 1: Late Cancellation (> 6 hours) -> NO PENALTY
    # ---------------------------------------------------------
    print("\n[Scenario 1] Creating ride 8 hours in future + Booking...")
    ride_id_1 = create_ride(driver_token, 8)
    if ride_id_1:
        book_ride(passenger_token, ride_id_1)
        print(f"Ride {ride_id_1} created and booked.")
        
        print("Cancelling ride (should be penalty-free)...")
        result = cancel_ride(driver_token, ride_id_1)
        
        print(f"Result: {result}")
        if result.get("penalty_applied") == False:
            print("✅ PASS: No penalty applied for > 6h cancellation.")
        else:
            print("❌ FAIL: Penalty WAS applied incorrectly.")

    # ---------------------------------------------------------
    # Scenario 2: Short Notice Cancellation (< 6 hours) -> PENALTY
    # ---------------------------------------------------------
    print("\n[Scenario 2] Creating ride 2 hours in future + Booking...")
    ride_id_2 = create_ride(driver_token, 2)
    if ride_id_2:
        book_ride(passenger_token, ride_id_2)
        print(f"Ride {ride_id_2} created and booked.")
        
        print("Cancelling ride (should apply penalty)...")
        result = cancel_ride(driver_token, ride_id_2)
        
        print(f"Result: {result}")
        if result.get("penalty_applied") == True:
            print("✅ PASS: Penalty applied for < 6h cancellation.")
        else:
            print("❌ FAIL: Penalty WAS NOT applied.")

if __name__ == "__main__":
    test_driver_cancellation()
