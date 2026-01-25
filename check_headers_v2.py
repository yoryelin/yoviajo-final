import requests

try:
    print("Sending GET request...")
    resp = requests.get("https://api.yoviajo.com.ar", timeout=10)
    print(f"Status: {resp.status_code}")
    print("All Headers:")
    for k, v in resp.headers.items():
        print(f"{k}: {v}")
except Exception as e:
    print(f"Error: {e}")
