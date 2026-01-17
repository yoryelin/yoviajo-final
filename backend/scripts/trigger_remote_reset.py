
import urllib.request
import sys

URL = "https://yoviajo-backend.onrender.com/api/debug/reset-database-force"
SECRET = "VIAJANDOSOMOSFELICES"

try:
    full_url = f"{URL}?secret_key={SECRET}"
    print(f"POSTing to {full_url}...")
    
    req = urllib.request.Request(full_url, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status Code: {response.status}")
            print(f"Response Body: {response.read().decode('utf-8')}")
            print("✅ SUCCESS")
            sys.exit(0)
    except urllib.error.HTTPError as e:
        print(f"❌ FAILED. Status Code: {e.code}")
        print(f"Reason: {e.reason}")
        print(f"Body: {e.read().decode('utf-8')}")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"❌ CONNECTION ERROR: {e.reason}")
        sys.exit(1)

except Exception as e:
    print(f"❌ ERROR: {e}")
    sys.exit(1)
