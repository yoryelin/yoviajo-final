import sqlite3
import os
import sys
import bcrypt
import datetime
from datetime import timedelta

# Adjust path to find the database in backend/yoviajo.db
current_dir = os.path.dirname(os.path.abspath(__file__))
# db is in backend/, so up one level: backend/scripts -> backend
db_path = os.path.join(os.path.dirname(current_dir), 'yoviajo.db')

print(f"Connecting to database at: {db_path}", flush=True)

if not os.path.exists(db_path):
    print("Error: Database file not found!", flush=True)
    sys.exit(1)

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def seed_database():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 1. Clear existing data (Order matters because of FKs)
        print("Clearing existing data...", flush=True)
        cursor.execute("DELETE FROM bookings")
        cursor.execute("DELETE FROM requests")
        cursor.execute("DELETE FROM rides")
        cursor.execute("DELETE FROM users") # 'users' table
        
        # 2. SEED USERS
        print("Seeding Users...", flush=True)
        users = [
             {
                "dni": "11111111", "email": "test@conductor.com", "name": "Jorge Conductor", "role": "C",
                "car_model": "Fiat Cronos", "car_plate": "AC 123 DC", "phone": "5493511111111"
            },
            {
                "dni": "22222222", "email": "pasajero@test.com", "name": "Maria Pasajero", "role": "P",
                "car_model": None, "car_plate": None, "phone": "5493512222222"
            },
            {
                "dni": "33333333", "email": "conductor@conductor.com", "name": "Pedro Conductor", "role": "C",
                "car_model": "Toyota Etios", "car_plate": "AA 999 ZZ", "phone": "5493513333333"
            },
            {
                "dni": "00000000", "email": "admin@yoviajo.com.ar", "name": "Super Admin", "role": "admin",
                "car_model": None, "car_plate": None, "phone": "0000000000"
            }
        ]
        
        target_password = "password123" # Standard Dev Password
        hashed = get_password_hash(target_password)
        
        user_ids = {}
        
        for u in users:
            cursor.execute("""
                INSERT INTO users (dni, email, name, hashed_password, role, is_active, cancellation_count, reputation_score, phone, car_model, car_plate, verification_status)
                VALUES (?, ?, ?, ?, ?, 1, 0, 100, ?, ?, ?, 'verified')
            """, (u["dni"], u["email"], u["name"], hashed, u["role"], u["phone"], u["car_model"], u["car_plate"]))
            
            # Get ID
            cursor.execute("SELECT id FROM users WHERE dni = ?", (u["dni"],))
            user_ids[u["email"]] = cursor.fetchone()[0]
            print(f"Created User: {u['name']}")

        # 3. SEED RIDES
        print("Seeding Rides...", flush=True)
        
        today = datetime.datetime.now()
        tomorrow = today + timedelta(days=1)
        next_week = today + timedelta(days=7)
        
        rides = [
            {
                "driver_id": user_ids["test@conductor.com"],
                "origin": "Cordoba", "destination": "Villa Carlos Paz",
                "departure_time": tomorrow.replace(hour=9, minute=0).isoformat(),
                "price": 5000, "seats": 4, "available": 4,
                "lat_orig": -31.4201, "lng_orig": -64.1888, "lat_dest": -31.4201, "lng_dest": -64.4993
            },
            {
                "driver_id": user_ids["conductor@conductor.com"],
                "origin": "Buenos Aires", "destination": "Rosario",
                "departure_time": next_week.replace(hour=14, minute=0).isoformat(),
                "price": 15000, "seats": 3, "available": 3,
                "lat_orig": -34.6037, "lng_orig": -58.3816, "lat_dest": -32.9442, "lng_dest": -60.6505
            }
        ]
        
        for r in rides:
            cursor.execute("""
                INSERT INTO rides (driver_id, origin, destination, departure_time, price, available_seats, status, women_only, allow_pets, allow_smoking, origin_lat, origin_lng, destination_lat, destination_lng)
                VALUES (?, ?, ?, ?, ?, ?, 'active', 0, 0, 0, ?, ?, ?, ?)
            """, (r["driver_id"], r["origin"], r["destination"], r["departure_time"], r["price"], r["available"], r["lat_orig"], r["lng_orig"], r["lat_dest"], r["lng_dest"]))
        
        print(f"Seeded {len(rides)} rides.")
        
        # 4. SEED BOOKINGS (Optional)
        # Add a booking for Maria in Jorge's ride? Maybe later.

        conn.commit()
        print("Database seeded successfully!", flush=True)
        conn.close()

    except Exception as e:
        print(f"An error occurred: {e}", flush=True)
        # sys.exit(1) # Don't exit error, just print

if __name__ == "__main__":
    seed_database()
