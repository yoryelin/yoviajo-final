import sys
import os

# Add parent directory to path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    print("1. Testing Config Loading...")
    from app.config import settings
    print(f"   ✓ Config Loaded. Project: {settings.PROJECT_NAME}")
    print(f"   ✓ Secret Key Present: {bool(settings.SECRET_KEY)}")

    print("\n2. Testing Logger...")
    from app.core.logger import setup_logging, logger
    setup_logging()
    logger.info("This is a TEST INFO log with timestamp.")
    logger.warning("This is a TEST WARNING log.")
    print("   ✓ Logger verification complete (check output above for timestamps)")

except Exception as e:
    print(f"\n❌ Verification Failed: {e}")
    sys.exit(1)
