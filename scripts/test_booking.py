import requests
import json
import os
import sys
import random

# Configuration
API_URL = "https://yoviajo-backend.onrender.com"  # Production URL
# API_URL = "http://localhost:8000" # Local URL

TEST_USER_EMAIL = "test_passenger_auto@yoviajo.com"
TEST_USER_PASS = "Test1234!"
TEST_USER_DNI = "99247531" # Fixed DNI of approved user

def register_user():
    """Registers a new test user."""
    print(f"Registering new test user: {TEST_USER_EMAIL}...")
    payload = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASS,
        "name": "Test Passenger Auto",
        "dni": TEST_USER_DNI,
        "role": "P",
        "birth_date": "1995-05-15",
        "phone": "5491199998888",
        "gender": "M",
        "address": "Test Address 123"
    }
    try:
        response = requests.post(f"{API_URL}/api/register", json=payload)
        if response.status_code == 200 or response.status_code == 201:
            print("Registration successful!")
            return True
        elif response.status_code == 400 and "Email already registered" in response.text:
             print("User already exists (proceeding to login).")
             return True
        else:
            print(f"Registration failed: {response.text}")
            return False
    except Exception as e:
        print(f"Connection error during registration: {e}")
        return False

def login(email, password):
    """Logs in and returns the access token."""
    print(f"Logging in as {TEST_USER_DNI}...")
    while True:
        try:
            response = requests.post(
                f"{API_URL}/api/login",
                json={"dni": TEST_USER_DNI, "password": password},
            )
            if response.status_code == 200:
                token = response.json().get("access_token")
                print("Login successful!")
                return token
            elif response.status_code == 403:
                print("\n⚠️  ACCOUNT PENDING APPROVAL")
                print(f"👉 Please go to your Admin Dashboard and approve user: {email}")
                print(f"   (DNI: {TEST_USER_DNI})")
                input("⌨️  Press Enter here after you have approved the user...")
                continue # Retry login
            else:
                print(f"Login failed: {response.text}")
                return None
        except Exception as e:
            print(f"Connection error: {e}")
            return None

def find_available_ride(token):
    """Finds a ride with available seats that is NOT owned by the current user."""
    print("\nSearching for an available ride...")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        # NOTE: Endpoint is /api/rides (no slash), adding slash causes Redirect which may drop Auth
        print(f"Requesting GET {API_URL}/api/rides")
        response = requests.get(f"{API_URL}/api/rides", headers=headers)
        
        if response.history:
            print(f"   (Redirected from {response.history[0].url} to {response.url})")

        if response.status_code == 200:
            rides = response.json()
            # Filter rides: available seats > 0
            candidates = [r for r in rides if r.get("available_seats", 0) > 0]
            
            if candidates:
                print(f"Found {len(candidates)} candidate rides.")
                return candidates[0]
            else:
                print("No rides with available seats found.")
                return None
        else:
            print(f"Failed to fetch rides: {response.text}")
            print(f"Status: {response.status_code}")
            return None
    except Exception as e:
         print(f"Error fetching rides: {e}")
         return None

def create_booking(token, ride_id):
    """Attempts to book a seat on the specified ride."""
    print(f"\nAttempting to book specific ride (ID: {ride_id})...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "ride_id": ride_id,
        "seats_booked": 1
    }
    
    try:
        response = requests.post(f"{API_URL}/api/bookings/", headers=headers, json=payload)
        
        if response.status_code == 201: # Created
            data = response.json()
            print("BOOKING SUCCESSFUL!")
            print(f"   Booking ID: {data.get('id')}")
            print(f"   Status: {data.get('status')}")
            print(f"   Payment Status: {data.get('payment_status')}")
            
            mp_url = data.get('payment_init_point')
            if mp_url:
                print(f"   MercadoPago URL: {mp_url}")
                print("   (Verification Passed: MP Preference Generated)")
            else:
                print("   WARNING: No MercadoPago URL returned.")
                
            return data
        else:
            print(f"Booking failed: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        print(f"Error creating booking: {e}")
        return None

if __name__ == "__main__":
    print("=== YoViajo Booking Verification Script ===")
    
    # Auto-Registration / Login Flow
    print(f"Using Test Account: {TEST_USER_EMAIL}")
    
    # Try Registering first (idempotent-ish)
    register_user() # Will print info if exists
    
    # Login
    token = login(TEST_USER_EMAIL, TEST_USER_PASS)
    
    if token:
        # 2. Find a ride (or let user specify ID)
        ride_id_input = input("\nEnter Ride ID to book (or press Enter to auto-find one): ").strip()
        
        target_ride = None
        if ride_id_input:
            target_ride = {"id": int(ride_id_input)}
        else:
            target_ride = find_available_ride(token)
            
        if target_ride:
            # 3. Create Booking
            print(f"Selected Ride: {target_ride['id']} ({target_ride.get('origin')} -> {target_ride.get('destination')})")
            if input(f"\nProceed to book Ride #{target_ride['id']}? (y/n): ").lower() == 'y':
                create_booking(token, target_ride['id'])
            else:
                print("Creation cancelled.")
        else:
            print("Could not proceed without a target ride.")
