import sqlite3
import os
import sys
import bcrypt

# Adjust path to find the database in backend/yoviajo.db
# This script is in backend/scripts/seed_db.py
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

users_to_seed = [
    # Jorge Dual - Conductor
    {
        "dni": "11111111",
        "email": "test@dual.com",
        "name": "Jorge Dual",
        "password": "password123", # User said 12345678, wait, checking prompt.
        "role": "C"
    },
    # Jorge Dual - Pasajero
    {
        "dni": "11111111",
        "email": "test@dual.com",
        "name": "Jorge Dual",
        "password": "password123", # User said 12345678
        "role": "P"
    },
    # Maria Pasajero
    {
        "dni": "22222222",
        "email": "pasajero@test.com",
        "name": "Maria Pasajero",
        "password": "password123", # User said 12345678
        "role": "P"
    },
    # Pedro Conductor
    {
        "dni": "33333333",
        "email": "conductor@conductor.com",
        "name": "Pedro Conductor",
        "password": "password123", # User said 12345678
        "role": "C"
    }
]

# Override passwords with user request "12345678"
target_password = "12345678"
for u in users_to_seed:
    u["password"] = target_password

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Clear existing users
    print("Clearing existing users...", flush=True)
    cursor.execute("DELETE FROM users")
    
    # 2. Insert new users
    print("Seeding new users...", flush=True)
    for u in users_to_seed:
        hashed = get_password_hash(u["password"])
        cursor.execute(
            "INSERT INTO users (dni, email, name, hashed_password, role, is_active, cancellation_count, reputation_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (u["dni"], u["email"], u["name"], hashed, u["role"], 1, 0, 100)
        )
        print(f"Inserted: {u['name']} ({u['role']}) - {u['dni']}", flush=True)

    conn.commit()
    print("Database seeded successfully!", flush=True)
    conn.close()

except Exception as e:
    print(f"An error occurred: {e}", flush=True)
    sys.exit(1)
