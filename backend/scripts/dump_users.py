import sqlite3
import os
import sys

# Adjust path to find the database in backend/yoviajo.db
# This script is in backend/scripts/dump_users.py
# So db is at ../yoviajo.db
current_dir = os.path.dirname(os.path.abspath(__file__))
# current_dir is backend/scripts
# db is in backend/, so up one level: backend/scripts -> backend
db_path = os.path.join(os.path.dirname(current_dir), 'yoviajo.db')

print(f"Connecting to database at: {db_path}", flush=True)

if not os.path.exists(db_path):
    print("Error: Database file not found!", flush=True)
    sys.exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
    if not cursor.fetchone():
        print("Error: Table 'users' does not exist.", flush=True)
        conn.close()
        sys.exit(1)

    cursor.execute('SELECT id, name, email, role, dni FROM users')
    rows = cursor.fetchall()
    
    print("\nREGISTERED USERS:", flush=True)
    print("="*60, flush=True)
    print(f"{'ID':<4} | {'Name':<20} | {'Email':<25} | {'Role':<10} | {'DNI':<10}", flush=True)
    print("-" * 75, flush=True)
    
    for r in rows:
        # Handle None values
        uid = r[0]
        name = r[1] if r[1] else "N/A"
        email = r[2] if r[2] else "N/A"
        role = r[3] if r[3] else "N/A"
        dni = r[4] if r[4] else "N/A"
        print(f"{uid:<4} | {name:<20} | {email:<25} | {role:<10} | {dni:<10}", flush=True)
        
    print("="*60, flush=True)
    conn.close()

except Exception as e:
    print(f"An error occurred: {e}", flush=True)
