
import requests

url = "https://yoviajo-backend.onrender.com/api/rides"
headers = {
    "Origin": "https://yoviajo-frontend.onrender.com",
    "Authorization": "Bearer INVALID_TOKEN_TO_FORCE_401"
}

try:
    print(f"Testing GET {url} with Origin: {headers['Origin']}")
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print("--- HEADERS ---")
    for k, v in response.headers.items():
        if 'access' in k.lower():
            print(f"{k}: {v}")
    print("----------------")
except Exception as e:
    print(f"Error: {e}")
