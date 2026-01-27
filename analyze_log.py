
import os

try:
    with open('frontend/build_log.txt', 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        print("--- BUILD LOG START ---")
        # Print lines containing "error" or "Error" or "Failed"
        lines = content.splitlines()
        error_lines = [line for line in lines if "error" in line.lower() or "failed" in line.lower() or "exception" in line.lower()]
        
        if error_lines:
            print(f"Found {len(error_lines)} error lines/hints:")
            for line in error_lines[:20]: # Print first 20 clues
                print(line)
            
            print("\n--- LAST 50 LINES ---")
            for line in lines[-50:]:
                print(line)
        else:
            print("No explicit 'error' keyword found. Printing last 50 lines:")
            for line in lines[-50:]:
                print(line)

except Exception as e:
    print(f"Error reading log: {e}")
