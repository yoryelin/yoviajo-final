import requests
import sys

URLS = [
    "https://api.yoviajo.com.ar",
    "https://api.yoviajo.com.ar/docs",
    "https://yoviajo-backend.onrender.com",
    "https://yoviajo-backend.onrender.com/docs"
]

print("Starting connectivity check...")

for url in URLS:
    try:
        print(f"Checking {url}...")
        resp = requests.get(url, timeout=10)
        print(f"[{resp.status_code}] {url} - OK")
    except Exception as e:
        print(f"[ERROR] {url} - {str(e)}")
