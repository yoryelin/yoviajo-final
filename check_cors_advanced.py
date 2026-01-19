
import requests

url = "https://yoviajo-backend.onrender.com/api/rides"
origin = "https://yoviajo-frontend.onrender.com"
headers = {
    "Origin": origin,
    "Access-Control-Request-Method": "GET",
    "Authorization": "Bearer INVALID_TOKEN_TO_FORCE_401"
}

print(f"--- TESTING OPTIONS {url} ---")
try:
    resp_opt = requests.options(url, headers=headers)
    print(f"OPTIONS Status: {resp_opt.status_code}")
    print("OPTIONS Headers:")
    for k, v in resp_opt.headers.items():
        if 'access' in k.lower():
            print(f"  {k}: {v}")
except Exception as e:
    print(f"OPTIONS Failed: {e}")

print(f"\n--- TESTING GET {url} (No Redirect Follow) ---")
try:
    # allow_redirects=False allows us to see the 307/301 if it exists
    resp_get = requests.get(url, headers=headers, allow_redirects=False)
    print(f"GET Status: {resp_get.status_code}")
    if resp_get.is_redirect:
        print(f"!! REDIRECT DETECTED !! Location: {resp_get.headers.get('Location')}")
    
    print("GET Headers:")
    for k, v in resp_get.headers.items():
        if 'access' in k.lower():
            print(f"  {k}: {v}")
except Exception as e:
    print(f"GET Failed: {e}")
