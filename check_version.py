import requests
import re

DOMAINS = [
    "https://yoviajo-frontend.onrender.com",
    "https://www.yoviajo.com.ar"
]

STRING_TO_FIND = "v2.1"

print(f"Checking for string: '{STRING_TO_FIND}'")

for domain in DOMAINS:
    print(f"\n--- Checking {domain} ---")
    try:
        # 1. Get Index HTML
        response = requests.get(domain, timeout=10)
        if response.status_code != 200:
            print(f"FAILED to fetch index: {response.status_code}")
            continue
            
        html_content = response.text
        
        # 2. Extract JS file path (Vite default: assets/index-*.js)
        # Regex to find src="/assets/index-....js"
        match = re.search(r'src="(/assets/index-[^"]+\.js)"', html_content)
        if not match:
            # Try without leading slash or other quote type
            match = re.search(r'src=["\'](/?assets/index-[^"\']+\.js)["\']', html_content)
            
        if match:
            js_path = match.group(1)
            # Ensure proper joining
            if js_path.startswith("/"):
                js_url = domain + js_path
            else:
                js_url = domain + "/" + js_path
                
            print(f"Found JS bundle: {js_url}")
            
            # 3. Fetch JS and search for string
            js_response = requests.get(js_url, timeout=10)
            if js_response.status_code == 200:
                if STRING_TO_FIND in js_response.text:
                    print(f"✅ SUCCESS: Found '{STRING_TO_FIND}' in {domain}")
                else:
                    print(f"❌ FAIL: String '{STRING_TO_FIND}' NOT FOUND in {domain}")
            else:
                print(f"Error fetching JS: {js_response.status_code}")
        else:
            print("Could not find JS bundle in HTML")
            # Fallback: check HTML itself just in case
            if STRING_TO_FIND in html_content:
                 print(f"✅ SUCCESS: Found '{STRING_TO_FIND}' in HTML (unusual)")
            else:
                 print("String not found in HTML either.")

    except Exception as e:
        print(f"Error checking {domain}: {e}")
