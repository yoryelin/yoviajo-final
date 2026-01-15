import os
import time

DB_PATH = "yoviajo.db"

if os.path.exists(DB_PATH):
    print(f"File {DB_PATH} exists. Attempting to delete...")
    try:
        os.remove(DB_PATH)
        print("SUCCESS: File deleted.")
    except Exception as e:
        print(f"FAILED to delete file: {e}")
        # Try waiting and retrying, maybe lock is released slowly
        time.sleep(2)
        try:
            os.remove(DB_PATH)
            print("SUCCESS (Retry): File deleted.")
        except Exception as e:
            print(f"FAILED (Retry): {e}")
else:
    print(f"File {DB_PATH} does not exist.")
