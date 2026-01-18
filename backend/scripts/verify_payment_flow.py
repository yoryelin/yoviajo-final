import requests
import json
import logging
from datetime import datetime, timedelta

# Config
BASE_URL = "http://127.0.0.1:8003/api"
EMAIL_DRIVER = "driver_test_e2e@test.com"
EMAIL_PASSENGER = "passenger_test_e2e@test.com"
PASSWORD = "password123"

# Setup Logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("e2e_test")

def login(dni, password):
    res = requests.post(f"{BASE_URL}/login", json={"dni": dni, "password": password})
    if res.status_code == 200:
        return res.json()["access_token"]
    logger.error(f"Login failed: {res.status_code} {res.text}")
    return None

def register_user(email, role):
    suffix = email.split('_')[1].split('@')[0]
    prefix = "99" if role == "driver" else "88"
    dni = f"{prefix}{suffix}" # Use suffix for DNI to ensure uniqueness and match email
    data = {
        "email": email,
        "password": PASSWORD,
        "name": f"User {role}",
        "dni": dni,
        "birth_date": "1990-01-01",
        "gender": "male",
        "address": "Test Address",
        "role": role # Send role, though backend might ignore it for now
    }
    r = requests.post(f"{BASE_URL}/register", json=data, timeout=5)
    if r.status_code in [200, 201]:
        logger.info(f"Created/Found user {role} with DNI {dni}")
        # If response has DNI, use it.
        try:
             return r.json().get('dni', dni)
        except:
             return dni
    elif r.status_code == 400:
        logger.info(f"User {role} already exists, proceeding to login.")
        return dni
    else:
        logger.error(f"Failed to register {role}: {r.status_code} {r.text} at {r.url}")
        return None

def delete_user(email):
    pass

import random

def run_test():
    logger.info("--- STARTING END-TO-END PAYMENT TEST ---")
    
    # Use unique emails to avoid conflicts
    suffix = random.randint(10000, 99999)
    email_driver = f"driver_{suffix}@test.com" 
    email_passenger = f"passenger_{suffix}@test.com"

    # 1. Setup Users
    dni_driver = register_user(email_driver, "driver")
    dni_passenger = register_user(email_passenger, "passenger")
    
    if not dni_driver or not dni_passenger:
        logger.error("❌ Registration failed")
        return

    # Login with DNI
    token_driver = login(dni_driver, PASSWORD)
    token_passenger = login(dni_passenger, PASSWORD)
    
    if not token_driver or not token_passenger:
        logger.error("❌ Login failed")
        return

    # Update Driver Profile (needed for creating rides)
    requests.put(
        f"{BASE_URL}/users/profile/driver",
        headers={"Authorization": f"Bearer {token_driver}"},
        json={"car_model": "Ford Focus", "license_plate": "ABC 123"}
    )
    
    # 2. Driver Creates Ride
    logger.info("🚗 Client A (Driver) creating ride...")
    ride_data = {
        "origin": "Cordoba",
        "destination": "Villa Carlos Paz",
        "departure_time": (datetime.utcnow() + timedelta(days=1)).isoformat(),
        "available_seats": 4,
        "price": 5000,
        "origin_lat": -31.4201, 
        "origin_lng": -64.1888,
        "destination_lat": -31.4201, # Mock same for simplicity
        "destination_lng": -64.4993
    }
    res_ride = requests.post(
        f"{BASE_URL}/rides/",
        headers={"Authorization": f"Bearer {token_driver}"},
        json=ride_data
    )
    if res_ride.status_code not in [200, 201]:
        logger.error(f"❌ Failed to create ride: {res_ride.text}")
        return
    ride_id = res_ride.json()["id"]
    logger.info(f"✅ Ride Created. ID: {ride_id}")

    # 3. Passenger Creates Booking (Initiates Match/Join)
    logger.info("👋 Client B (Passenger) joining ride...")
    booking_data = {"ride_id": ride_id, "seats_booked": 1}
    res_booking = requests.post(
        f"{BASE_URL}/bookings/",
        headers={"Authorization": f"Bearer {token_passenger}"},
        json=booking_data
    )
    
    if res_booking.status_code not in [200, 201]:
        logger.error(f"❌ Failed to create booking: {res_booking.text}")
        return
    
    booking = res_booking.json()
    logger.info(f"✅ Booking Created. Status: {booking['status']}, Payment: {booking['payment_status']}")

    if booking['payment_status'] != 'unpaid':
        logger.error("❌ Initial payment status should be 'unpaid'")
        return

    # 4. Simulate Payment
    logger.info("💳 Client B paying fee...")
    res_pay = requests.post(
        f"{BASE_URL}/payment/simulate",
        headers={"Authorization": f"Bearer {token_passenger}"},
        json={"booking_id": booking['id']}
    )
    
    if res_pay.status_code != 200:
        logger.error(f"❌ Payment failed: {res_pay.text}")
        return
        
    payment_res = res_pay.json()
    logger.info(f"✅ Payment Simulated. Status: {payment_res['status']}")

    # 5. Verify Booking is Confirmed
    logger.info("🔍 Verifying final status...")
    res_verify = requests.get(
        f"{BASE_URL}/bookings/me",
        headers={"Authorization": f"Bearer {token_passenger}"}
    )
    
    my_bookings = res_verify.json()
    target_booking = next((b for b in my_bookings if b['id'] == booking['id']), None)
    
    if target_booking and target_booking['payment_status'] == 'paid' and target_booking['status'] == 'confirmed':
        logger.info("🎉 SUCCESS: Booking is PAID and CONFIRMED. Contact unlocked.")
    else:
        logger.error(f"❌ Verification failed. Final Status: {target_booking['status'] if target_booking else 'NotFound'}")

if __name__ == "__main__":
    run_test()
