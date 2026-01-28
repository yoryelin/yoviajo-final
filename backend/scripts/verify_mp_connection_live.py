import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.payment_service import PaymentService

def verify_connection():
    print("--- Verifying Mercado Pago Live Connection ---")
    try:
        service = PaymentService()
        print("[OK] PaymentService initialized.")
        
        # We use a dummy reference. We expect a success response from MP (200 OK)
        # but with empty results, which our service handles by returning None.
        # If credentials are bad, this should throw an error.
        ref = "TEST_CONNECTION_VERIFICATION_12345"
        print(f"Testing search_payment_by_reference with ref='{ref}'...")
        
        result = service.search_payment_by_reference(ref)
        
        if result is None:
            print("[OK] Connection Successful! Method returned None (expected for non-existent payment).")
            print("This confirms the API Token is valid and the search endpoint is reachable.")
        else:
            print(f"[OK] Connection Successful! Found unexpected payment: {result}")
            
    except Exception as e:
        print(f"[FAIL] Connection Failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    verify_connection()
