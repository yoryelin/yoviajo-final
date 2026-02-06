
import requests
import random
import string
import time

# PRODUCTION URL
API_URL = "https://yoviajo-backend.onrender.com/api" 

def generate_random_string(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def generate_dni():
    return str(random.randint(10000000, 99999999))

def register_user(role, name_prefix):
    email = f"test_{name_prefix}_{generate_random_string()}@yoviajo.com"
    password = "password123"
    dni = generate_dni()
    
    print(f"[{role}] Registering user: {email}...")
    
    payload = {
        "email": email,
        "password": password,
        "name": f"Test {role} {generate_random_string(4)}",
        "dni": dni,
        "phone": "+5491112345678",
        "role": "C" if role == "Driver" else "P"
    }
    
    try:
        # Register
        requests.post(f"{API_URL}/register", json=payload)
        
        # Login
        resp = requests.post(f"{API_URL}/login", json={"dni": dni, "password": password})
        if resp.status_code != 200:
             print(f"Login failed: {resp.text}")
             return None, None
             
        token = resp.json()["access_token"]
        return token, email
    except Exception as e:
        print(f"Registration/Login failed: {e}")
        return None, None

def run_simulation():
    print(f"Starting Payment Flow verification Simulation against {API_URL}...")
    
    # 1. Setup Users
    driver_token, driver_email = register_user("Driver", "D")
    passenger_token, passenger_email = register_user("Passenger", "P")
    
    if not driver_token or not passenger_token:
        print("Failed to create test users. Aborting.")
        return

    created_ride_id = None
    created_request_id = None
    created_booking_id = None

    try:
        # 2. Driver Posts Ride
        print("\nDriver posting ride...")
        ride_payload = {
            "origin": "TestCityA",
            "destination": "TestCityB",
            "departure_time": "2026-12-31T10:00:00", # Future date
            "price": 10000,
            "available_seats": 4,
            "allow_luggage": True
        }
        headers_driver = {"Authorization": f"Bearer {driver_token}"}
        
        res_ride = requests.post(f"{API_URL}/rides", json=ride_payload, headers=headers_driver)
        
        if res_ride.status_code != 200:
            print(f"Failed to create ride: {res_ride.status_code} - {res_ride.text}")
            return
        ride_data = res_ride.json()
        created_ride_id = ride_data["id"]
        print(f"Ride created. ID: {created_ride_id}")

        # 3. Passenger Posts Request
        print("\nPassenger posting request...")
        req_payload = {
            "origin": "TestCityA",
            "destination": "TestCityB",
            "date": "2026-12-31",
            "time_window_start": "09:00",
            "time_window_end": "12:00",
            "seats_needed": 1
        }
        headers_passenger = {"Authorization": f"Bearer {passenger_token}"}
        res_req = requests.post(f"{API_URL}/requests/", json=req_payload, headers=headers_passenger)
        if res_req.status_code != 200:
             print(f"Failed to create request: {res_req.text}")
             return
        req_data = res_req.json()
        created_request_id = req_data["id"]
        print(f"Request created. ID: {created_request_id}")

        # 4. Check Matches
        print("\nChecking for matches...")
        time.sleep(3) # Give DB a moment (Render might be slower)
        res_matches = requests.get(f"{API_URL}/matches", headers=headers_passenger)
        matches = res_matches.json()
        
        match_found = next((m for m in matches if m.get("ride_id") == created_ride_id), None)
        
        if match_found:
            print("Match confirmed by System!")
        else:
            print("Match NOT found immediately. API Reachable, proceeding to book by ID.")

        # 5. Passenger Creates Booking
        print("\nSimulating 'Solicitar Unirme' & Payment Link Generation...")
        booking_payload = {
            "ride_id": created_ride_id,
            "seats_booked": 1
        }
        res_booking = requests.post(f"{API_URL}/bookings/", json=booking_payload, headers=headers_passenger)
        
        if res_booking.status_code == 201:
            booking_data = res_booking.json()
            created_booking_id = booking_data["id"]
            
            print(f"Booking Created. ID: {created_booking_id}")
            
            init_point = booking_data.get("payment_init_point")
            if init_point:
                 print(f"SUCCESS! Payment Link Generated: {init_point}")
            else:
                 print("Booking created but NO Payment Link found.")
        else:
             print(f"Failed to create booking: {res_booking.text}")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        print("\nCleaning up simulation data...")
        if created_booking_id:
            requests.patch(f"{API_URL}/bookings/{created_booking_id}", json={"status": "cancelled"}, headers=headers_passenger)
            print(f"Booking {created_booking_id} cancelled.")
        if created_request_id:
             requests.delete(f"{API_URL}/requests/{created_request_id}", headers=headers_passenger)
        if created_ride_id:
            requests.delete(f"{API_URL}/rides/{created_ride_id}", headers=headers_driver)
            print(f"Ride {created_ride_id} deleted.")
            
        print("Simulation Complete.")

if __name__ == "__main__":
    run_simulation()
