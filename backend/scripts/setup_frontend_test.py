
import sys
import os
import requests
from datetime import datetime, timedelta

# BASE_URL Port 8003
BASE_URL = "http://localhost:8003/api"

DRIVER_DNI = "11111111"
DRIVER_PASS = "12345678"
DRIVER_ROLE = "C"

PASSENGER_DNI = "22222222"
PASSENGER_PASS = "12345678"
PASSENGER_ROLE = "P"

def get_token(dni, password, role):
    res = requests.post(f"{BASE_URL}/login", json={"dni": dni, "password": password, "role": role})
    return res.json()["access_token"]

def create_ride(token, origin, hours_offset):
    dep_time = (datetime.now() + timedelta(hours=hours_offset)).isoformat()
    data = {
        "origin": origin,
        "destination": "Test Frontend",
        "departure_time": dep_time,
        "price": 100,
        "available_seats": 4
    }
    res = requests.post(f"{BASE_URL}/rides/", json=data, headers={"Authorization": f"Bearer {token}"})
    return res.json()["id"]

def book_ride(token, ride_id):
    data = {"ride_id": ride_id, "seats_booked": 1}
    requests.post(f"{BASE_URL}/bookings/", json=data, headers={"Authorization": f"Bearer {token}"})

def main():
    print("Seeding Frontend Test Data...")
    d_token = get_token(DRIVER_DNI, DRIVER_PASS, DRIVER_ROLE)
    p_token = get_token(PASSENGER_DNI, PASSENGER_PASS, PASSENGER_ROLE)

    # 1. Ride SAFE (24 hours future)
    print("Creating Safe Ride (24h)...")
    id_safe = create_ride(d_token, "Ruta Segura >6h", 24)
    book_ride(p_token, id_safe)

    # 2. Ride DANGER (2 hours future)
    print("Creating Risky Ride (2h)...")
    id_danger = create_ride(d_token, "Ruta Penalizada <6h", 2)
    book_ride(p_token, id_danger)

    print("Data Seeded Successfully!")

if __name__ == "__main__":
    main()
