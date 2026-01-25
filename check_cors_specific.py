import requests

TARGET_ORIGIN = "https://yoviajo.com.ar"
URL = "https://api.yoviajo.com.ar"

print(f"Testing CORS for Origin: {TARGET_ORIGIN}")
headers = {"Origin": TARGET_ORIGIN}

try:
    resp = requests.get(URL, headers=headers, timeout=10)
    print(f"Status: {resp.status_code}")
    acao = resp.headers.get("access-control-allow-origin")
    print(f"Access-Control-Allow-Origin: {acao}")
    
    if acao == TARGET_ORIGIN:
        print("✅ SUCCESS: Specific origin allowed.")
    elif acao == "*":
        print("⚠️ WARNING: Still returning wildcard '*'. Deployment might be pending.")
    else:
        print(f"❌ FAIL: Unexpected header value: {acao}")

except Exception as e:
    print(f"Error: {e}")
