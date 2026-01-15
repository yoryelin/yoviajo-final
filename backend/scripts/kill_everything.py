import os
import subprocess

def kill_python_processes():
    print("Attempting to kill all python.exe processes...")
    try:
        # Initial try with taskkill
        subprocess.run(["taskkill", "/F", "/IM", "python.exe"], check=False)
        print("Taskkill command sent.")
    except Exception as e:
        print(f"Taskkill failed: {e}")

if __name__ == "__main__":
    kill_python_processes()
