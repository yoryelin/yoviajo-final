import requests
import sys
import datetime

# Configuration
API_URL = "https://yoviajo-backend.onrender.com"
DRIVER_EMAIL = "test_driver_auto@yoviajo.com"
DRIVER_PASS = "Test1234!"
DRIVER_DNI = "99247532"  # Different from passenger

def register_driver():
    print(f"Registering Driver: {DRIVER_EMAIL}...")
    payload = {
        "email": DRIVER_EMAIL,
        "password": DRIVER_PASS,
        "name": "Test Driver Auto",
        "dni": DRIVER_DNI,
        "role": "C",
        "birth_date": "1990-01-01",
        "phone": "5491155556666",
        "gender": "M",
        "address": "Driver HQ 123",
        "car_model": "Fiat Cronos",
        "car_plate": "TEST 123",
        "car_color": "Red",
        "prefs_smoking": False,
        "prefs_pets": True,
        "prefs_luggage": True,
        "check_license": True,
        "check_insurance": True
    }
    
    try:
        response = requests.post(f"{API_URL}/api/register", json=payload)
        if response.status_code == 200 or response.status_code == 201:
            print("Driver Registration successful!")
            return True
        elif response.status_code == 400 and ("Email" in response.text or "DNI" in response.text):
             print("Driver already exists (proceeding to login).")
             return True
        else:
            print(f"Driver Registration failed: {response.text}")
            return False
    except Exception as e:
        print(f"Connection error: {e}")
        return False

def login_driver():
    print(f"Logging in as Driver {DRIVER_DNI}...")
    while True:
        try:
            response = requests.post(
                f"{API_URL}/api/login",
                json={"dni": DRIVER_DNI, "password": DRIVER_PASS},
            )
            if response.status_code == 200:
                token = response.json().get("access_token")
                print("Login successful!")
                return token
            elif response.status_code == 403:
                print("\nDRIVER ACCOUNT PENDING APPROVAL")
                print(f"Please approve user: {DRIVER_EMAIL} (DNI: {DRIVER_DNI})")
                input("Press Enter here after you have approved the driver...")
                continue
            else:
                print(f"Login failed: {response.text}")
                return None
        except Exception as e:
            print(f"Connection error: {e}")
            return None

def create_ride(token):
    print("Creating Test Ride...")
    tomorrow = datetime.datetime.now() + datetime.timedelta(days=1)
    # Format: ISO 8601
    dep_time = tomorrow.isoformat()
    
    payload = {
        "origin": "Buenos Aires - Obelisco",
        "destination": "Mar del Plata - Casino (TEST)",
        "departure_time": dep_time,
        "price": 12500.0,
        "available_seats": 3,
        "women_only": False,
        "allow_pets": False,
        "allow_smoking": False,
        "allow_luggage": True,
        "origin_lat": -34.6037,
        "origin_lng": -58.3816,
        "destination_lat": -38.0055,
        "destination_lng": -57.5426
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # endpoint /api/rides (with or without slash? View file said @router.post("") which usually means /api/rides
        # But let's try /api/rides/ first as default post behavior in this project seems to use slashes?
        # Actually rides.py has @router.post("") so it maps to /api/rides
        # BUT wait, post("") usually means /api/rides/ if include_in_schema is True?
        # Let's try /api/rides (no slash) first to be safe based on Get discovery.
        # Although CreateRide uses POST.
        
        response = requests.post(f"{API_URL}/api/rides", headers=headers, json=payload)
        
        if response.status_code == 201:
            data = response.json()
            print(f"Ride Created Successfully! ID: {data.get('id')}")
            return data.get('id')
        else:
             # Try with slash if 307
            if response.status_code == 307:
                 print("Redirected.. trying with slash...")
                 response = requests.post(f"{API_URL}/api/rides/", headers=headers, json=payload)
                 if response.status_code == 201:
                     print(f"Ride Created! ID: {response.json().get('id')}")
                     return response.json().get('id')

            print(f"Ride Creation Failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error creating ride: {e}")
        return None

if __name__ == "__main__":
    if register_driver():
        token = login_driver()
        if token:
            create_ride(token)
