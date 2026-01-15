import requests
import json

url = "http://127.0.0.1:8001/api/login"
payload = {
    "dni": "87654321",
    "password": "dummy",
    "role": "C"
}
headers = {"Content-Type": "application/json"}

print(f"Sending POST to {url} with payload {payload}")

try:
    response = requests.post(url, json=payload, timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"ERROR: {e}")
