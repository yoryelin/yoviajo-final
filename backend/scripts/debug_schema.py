from datetime import date
try:
    from app.schemas.user import UserCreate
    print("Import Success")
except ImportError as e:
    print(f"Import Failed: {e}")
    # Try adjusting path if running as script
    import sys
    import os
    sys.path.append(os.getcwd())
    from backend.app.schemas.user import UserCreate

try:
    print("Testing Underage User...")
    today = date.today()
    birth_minor = today.replace(year=today.year - 15)
    
    user = UserCreate(
        dni="111", email="test@test.com", password="password", name="Test",
        role="P", phone="123", birth_date=birth_minor, address="street"
    )
    print("❌ VALIDATION FAILED: User created successfully (Should have raised ValueError)")
    print(user)
except ValueError as e:
    print(f"✅ VALIDATION SUCCESS: Caught ValueError: {e}")
except Exception as e:
    print(f"❌ VALIDATION ERROR: Caught unexpected exception: {e}")
