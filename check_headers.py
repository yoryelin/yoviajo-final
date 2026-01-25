import requests

try:
    resp = requests.get("https://api.yoviajo.com.ar", timeout=10)
    print(f"Status: {resp.status_code}")
    print("Headers:")
    for k, v in resp.headers.items():
        if "access-control" in k.lower():
            print(f"{k}: {v}")
except Exception as e:
    print(f"Error: {e}")
