
import sys
import os
import mercadopago

# Add the backend directory to sys.path so we can import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.config import settings

def test_mp_preference_creation():
    print("--- Diagnostic: Mercado Pago Configuration ---")
    print(f"MP_ACCESS_TOKEN (first 10 chars): {settings.MP_ACCESS_TOKEN[:10]}...")
    
    if "PLACEHOLDER" in settings.MP_ACCESS_TOKEN:
        print("⚠️  WARNING: You are using the default PLACEHOLDER token.")
        print("    If this is happening on Render, THIS IS THE PROBLEM.")
        print("    You must set the MP_ACCESS_TOKEN environment variable in Render.")
    else:
        print("✅ Token does not look like a placeholder.")

    print("\n--- Attempting to create a Test Preference ---")
    try:
        sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)
        
        preference_data = {
            "items": [
                {
                    "id": "diagnostic_test_123",
                    "title": "Test Diagnostic Item",
                    "quantity": 1,
                    "unit_price": 100.0,
                    "currency_id": "ARS" 
                }
            ],
            "payer": {
                "email": "test_user_unique@test.com"
            },
            "back_urls": {
                "success": "https://www.google.com",
                "failure": "https://www.google.com",
                "pending": "https://www.google.com"
            },
            "auto_return": "approved"
        }
        
        preference_response = sdk.preference().create(preference_data)
        
        status = preference_response.get("status")
        response = preference_response.get("response", {})
        
        print(f"Response Status: {status}")
        
        if status in [200, 201]:
            print("✅ Preference created SUCCESSFULLY.")
            print(f"   Link: {response.get('init_point')}")
            print(f"   Sandbox Link: {response.get('sandbox_init_point')}")
            print("\nCONCLUSION: The token is VALID and can create preferences.")
            print("If you still get CPT01 errors in the app, it is likely the SELF-PAYMENT issue.")
            print("(Trying to pay with an account owned by the same credentials).")
        else:
            print("❌ Preference creation FAILED.")
            print(f"   Error: {response}")
            if status == 401 or status == 403:
                print("\nCONCLUSION: INVALID CREDENTIALS.")
                print("The token is wrong, expired, or blocked.")
            else:
                print("\nCONCLUSION: Generic API Error.")
                
    except Exception as e:
        print(f"❌ CRITICAL EXCEPTION: {e}")

if __name__ == "__main__":
    test_mp_preference_creation()
