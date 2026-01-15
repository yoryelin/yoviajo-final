
import sys
import os
import requests
from datetime import datetime, timedelta

# BASE_URL Port 8003
BASE_URL = "http://localhost:8003/api"

# Credenciales
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
    # Return token, user_id, reputation
    data = res.json()
    return data["access_token"], data["user"]["id"], data["user"]["reputation_score"]

def create_ride(token, hours_offset):
    # hours_offset can be negative for past rides
    dep_time = (datetime.now() + timedelta(hours=hours_offset)).isoformat()
    data = {
        "origin": "Test NoShow",
        "destination": "Test NoShow",
        "departure_time": dep_time,
        "price": 100,
        "available_seats": 4
    }
    res = requests.post(f"{BASE_URL}/rides/", json=data, headers={"Authorization": f"Bearer {token}"})
    if res.status_code != 200:
        # If created in past, backend might block creation?
        # Check backend/rides.py: "if departure_dt < now - timedelta(minutes=15)" -> Raises 400.
        # So we cannot create a past ride directly via API!
        # Workaround: Create future ride, then update DB directly? No easy way via API.
        # Workaround via API: Create ride 1 min in future, wait 1 min? Too slow.
        # Workaround via API: The check has a 15 min grace period? "now - timedelta(minutes=15)".
        # So if we create it "now", it is valid.
        # But report requires "now < dep_dt" (wait, report requires "now > dep_dt").
        # If we create ride for NOW (0 offset), we can report immediately?
        print(f"Ride creation failed: {res.text}")
        return None
    return res.json()["id"]

def book_ride(token, ride_id):
    data = {"ride_id": ride_id, "seats_booked": 1}
    res = requests.post(f"{BASE_URL}/bookings/", json=data, headers={"Authorization": f"Bearer {token}"})
    return res.json()["id"]

def confirm_booking(driver_token, booking_id):
    # Driver confirms booking
    data = {"status": "confirmed"}
    requests.patch(f"{BASE_URL}/bookings/{booking_id}", json=data, headers={"Authorization": f"Bearer {driver_token}"})

def report_no_show(reporter_token, ride_id, target_user_id):
    data = {
        "ride_id": ride_id,
        "target_user_id": target_user_id,
        "reason": "no_show"
    }
    res = requests.post(f"{BASE_URL}/reports/", json=data, headers={"Authorization": f"Bearer {reporter_token}"})
    return res

def test_no_show():
    print("Testing No-Show Report...", flush=True)
    
    driver_token, driver_id, _ = get_token(DRIVER_DNI, DRIVER_PASS, DRIVER_ROLE)
    passenger_token, passenger_id, initial_rep_p = get_token(PASSENGER_DNI, PASSENGER_PASS, PASSENGER_ROLE)
    
    # PROBLEM: We cannot create a ride in the past via API (blocked).
    # We need to create a ride for NOW (just barely future), sleep a sec, then report?
    # Backend check: if departure_dt < now - 15min: Error.
    # So we can create a ride for "Now + 1 minute".
    # Report check: if now < dep_dt: Error.
    # So we create for Now + 2 seconds, wait 3 seconds, then report.
    
    print("Creating ride for Now + 20 seconds...")
    now_plus_window = datetime.now() + timedelta(seconds=20)
    # We must pass string iso
    dep_str = now_plus_window.isoformat()
    
    # We manually call create because helper uses hours
    data = {
        "origin": "Test NoShow",
        "destination": "Test NoShow",
        "departure_time": dep_str,
        "price": 100,
        "available_seats": 4
    }
    res = requests.post(f"{BASE_URL}/rides/", json=data, headers={"Authorization": f"Bearer driver_token"})
    # Wait, header var name string mistake above? No.
    res = requests.post(f"{BASE_URL}/rides/", json=data, headers={"Authorization": f"Bearer {driver_token}"})
    
    if res.status_code != 200:
        print(f"Failed to create urgent ride: {res.text}")
        return

    ride_id = res.json()["id"]
    print(f"Ride {ride_id} created.")
    
    # Passenger books
    booking_id = book_ride(passenger_token, ride_id)
    # Driver confirms
    confirm_booking(driver_token, booking_id)
    print("Booking confirmed.")
    
    # Try to report IMMEDIATELY (Should Fail - Too Early)
    print("Attempting premature report...")
    res_early = report_no_show(driver_token, ride_id, passenger_id)
    if res_early.status_code == 400:
        print("✅ PASS: Premature report blocked.")
    else:
        print(f"❌ FAIL: Premature report allowed? {res_early.status_code}")

    # Wait for time to pass
    print("Waiting 21 seconds for ride 'departure'...")
    import time
    time.sleep(21)
    
    # Try to report NOW (Should Succeed)
    print("Attempting valid report...")
    res_valid = report_no_show(driver_token, ride_id, passenger_id)
    
    if res_valid.status_code == 201: # Created
        print("✅ PASS: Valid report accepted.")
        # Check reputation
        _, _, new_rep_p = get_token(PASSENGER_DNI, PASSENGER_PASS, PASSENGER_ROLE)
        print(f"Passenger Rep: {initial_rep_p} -> {new_rep_p}")
        if new_rep_p == max(0, initial_rep_p - 20):
             print("✅ PASS: Penalty (-20) applied.")
        else:
             print("❌ FAIL: Penalty not applied correctly.")
    else:
        print(f"❌ FAIL: Valid report rejected: {res_valid.text}")

if __name__ == "__main__":
    test_no_show()
