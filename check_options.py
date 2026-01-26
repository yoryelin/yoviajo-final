import requests

URL = "https://api.yoviajo.com.ar/api/login"
ORIGIN = "https://yoviajo.com.ar"

print(f"Testing OPTIONS preflight for: {URL}")
headers = {
    "Origin": ORIGIN,
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "content-type"
}

try:
    resp = requests.options(URL, headers=headers, timeout=10)
    print(f"Status: {resp.status_code}")
    print("Headers:")
    for k, v in resp.headers.items():
        if "access-control" in k.lower():
            print(f"{k}: {v}")
            
    if resp.status_code == 200 and "access-control-allow-origin" in resp.headers:
             print("✅ Preflight OK")
    else:
             print("❌ Preflight FAILED")

except Exception as e:
    print(f"Error: {e}")
