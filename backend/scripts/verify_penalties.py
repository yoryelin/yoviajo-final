import requests
import datetime
from datetime import timedelta

BASE_URL = "http://localhost:8000/api"

def create_user(email, password, name, role="user"):
    # Try to login first, if fails, register
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": password})
        if resp.status_code == 200:
            print(f"User {name} already exists, logging in...")
            return resp.json()["access_token"]
    except:
        pass

    # Register
    print(f"Creating user {name}...")
    resp = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password,
        "name": name,
        "role": role
    })
    if resp.status_code != 200:
        print(f"Failed to register {name}: {resp.text}")
        # Try login again in case race condition or error
        resp = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": password})
        return resp.json()["access_token"]
        
    return resp.json()["access_token"]

def verify_penalties():
    print("--- STARTING VERIFICATION ---")
    
    # 1. Setup Users
    driver_token = create_user("driver_verifier@test.com", "password123", "Driver Verifier", "driver")
    passenger_token = create_user("passenger_verifier@test.com", "password123", "Passenger Verifier", "user")
    
    driver_headers = {"Authorization": f"Bearer {driver_token}"}
    passenger_headers = {"Authorization": f"Bearer {passenger_token}"}
    
    # 2. Test 72h limit (Failure Case)
    print("\n[TEST] Creating Ride > 72h in future...")
    future_date = (datetime.datetime.now() + timedelta(hours=73)).isoformat()
    ride_data = {
        "origin": "Test Origin",
        "destination": "Test Dest",
        "departure_time": future_date,
        "available_seats": 4,
        "price": 1000,
        "origin_lat": -31.4201,
        "origin_lng": -64.1888,
        "destination_lat": -31.4201, 
        "destination_lng": -64.1888
    }
    resp = requests.post(f"{BASE_URL}/rides/", json=ride_data, headers=driver_headers)
    if resp.status_code == 400 and "72 horas" in resp.text:
        print("✅ PASSED: Ride > 72h rejected.")
    else:
        print(f"❌ FAILED: Ride > 72h not rejected properly. Status: {resp.status_code}, Body: {resp.text}")

    # 3. Create Valid Ride
    print("\n[TEST] Creating Valid Ride...")
    valid_date = (datetime.datetime.now() + timedelta(hours=24)).isoformat()
    ride_data["departure_time"] = valid_date
    resp = requests.post(f"{BASE_URL}/rides/", json=ride_data, headers=driver_headers)
    if resp.status_code == 200:
        ride_id = resp.json()["id"]
        print(f"✅ PASSED: Ride created with ID {ride_id}")
    else:
        print(f"❌ FAILED: Could not create ride. {resp.text}")
        return

    # 4. Passenger Books Ride
    print("\n[TEST] Passenger Booking Ride...")
    booking_data = {"ride_id": ride_id, "seats_booked": 1}
    resp = requests.post(f"{BASE_URL}/bookings/", json=booking_data, headers=passenger_headers)
    if resp.status_code == 201:
        print("✅ PASSED: Booking created.")
    else:
        print(f"❌ FAILED: Booking failed. {resp.text}")
        return

    # 5. Driver Cancels Ride (Should trigger penalty)
    print("\n[TEST] Driver Cancelling Ride (Expect Penalty)...")
    # First get current stats
    resp = requests.get(f"{BASE_URL}/users/me", headers=driver_headers)
    initial_score = resp.json()["reputation_score"]
    initial_count = resp.json()["cancellation_count"]
    print(f"Initial Score: {initial_score}, Cancellations: {initial_count}")

    resp = requests.delete(f"{BASE_URL}/rides/{ride_id}", headers=driver_headers)
    if resp.status_code == 200:
        print("✅ PASSED: Ride cancelled.")
    else:
        print(f"❌ FAILED: Cancellation failed. {resp.text}")
        return

    # 6. Verify Penalty
    print("\n[TEST] Verifying Penalty Stats...")
    resp = requests.get(f"{BASE_URL}/users/me", headers=driver_headers)
    final_score = resp.json()["reputation_score"]
    final_count = resp.json()["cancellation_count"]
    print(f"Final Score: {final_score}, Cancellations: {final_count}")
    
    if final_count == initial_count + 1 and final_score == initial_score - 10:
        print("✅ PASSED: Penalty applied correctly (Count +1, Score -10).")
    else:
        print("❌ FAILED: Penalty NOT applied correctly.")

    print("\n--- VERIFICATION COMPLETE ---")

if __name__ == "__main__":
    verify_penalties()
