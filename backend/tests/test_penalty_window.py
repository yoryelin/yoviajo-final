
import sys
import os
from datetime import datetime, timedelta

# Add backend to path to import app.utils
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.utils import is_within_penalty_window

def test_penalty_window():
    print("Testing is_within_penalty_window...", flush=True)
    
    now = datetime.now()
    
    # Case 1: Departure in 7 hours (Should match False)
    dep_7h = now + timedelta(hours=7)
    assert is_within_penalty_window(dep_7h) == False, "Failed > 6h check"
    print("✅ > 6h Check Passed")
    
    # Case 2: Departure in 5 hours (Should match True)
    dep_5h = now + timedelta(hours=5)
    assert is_within_penalty_window(dep_5h) == True, "Failed < 6h check"
    print("✅ < 6h Check Passed")
    
    # Case 3: Departure in past (Should match True - treated as penalty/impossible)
    dep_past = now - timedelta(hours=1)
    assert is_within_penalty_window(dep_past) == True, "Failed Past check"
    print("✅ Past Check Passed")

    print("\nALL TESTS PASSED", flush=True)

if __name__ == "__main__":
    test_penalty_window()
