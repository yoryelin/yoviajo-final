import requests
import json

BASE_URL = "http://127.0.0.1:8001/api/login"
DNI = "11111111"
PWD = "dummy" # The seed uses a fixed hash, real pwd validation might fail if I don't use the real one, but wait, seed uses "12345678"
REAL_PWD = "12345678"

def test_login(role=None):
    payload = {"dni": DNI, "password": REAL_PWD}
    if role:
        payload["role"] = role
        
    print(f"\n--- Testing Login with Role: {role} ---")
    try:
        res = requests.post(BASE_URL, json=payload, timeout=5)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            user = data.get('user', {})
            print(f"SUCCESS! Logged in as: {user.get('name')} ({user.get('role')})")
            print(f"User Unique ID: {user.get('id')}  <-- CRITICAL CHECK")
            return user.get('id')
        elif res.status_code == 300:
            print("Response: 300 Multiple Choices (Correct behavior for ambiguous login)")
            print("Options:", res.json().get('roles_available'))
        else:
            print(f"Failed: {res.text}")
    except Exception as e:
        print(f"Error: {e}")

# 1. Ambiguous Login
test_login(None)

# 2. Login as Conductor
id_c = test_login("C")

# 3. Login as Passenger
id_p = test_login("P")

print("\n--- CONCLUSION ---")
if id_c and id_p and id_c != id_p:
    print(f"✅ STRICT SEPARATION CONFIRMED: ID {id_c} != ID {id_p}")
else:
    print("❌ SEPARATION FAILED")
