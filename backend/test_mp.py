
import os
import sys

sys.path.append(os.getcwd())

try:
    import mercadopago
    from app.config import settings
    print(f"✅ MercadoPago Import Successful")
    print(f"✅ SDK Location: {mercadopago.__file__}")
    print(f"✅ Token Configured: {settings.MP_ACCESS_TOKEN}")
    
    sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)
    print("✅ SDK Initialized")
    
    # Try a fake preference creation to see logic
    pref_data = {
         "items": [{"title": "Test", "quantity": 1, "unit_price": 5000, "currency_id": "ARS"}]
    }
    # This might fail with "Invalid Token" but should NOT crash the script
    try:
         sdk.preference().create(pref_data)
    except Exception as e:
         print(f"⚠️ Preference creation failed (Expected with Placeholder): {e}")

except Exception as e:
    print(f"❌ CRITICAL ERROR: {e}")
    import traceback
    traceback.print_exc()
