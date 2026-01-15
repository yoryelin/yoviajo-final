import bcrypt

password = "secret_password"
print("Testing bcrypt...")

try:
    # Hash a password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    print(f"Hashed: {hashed}")

    # Verify
    check = bcrypt.checkpw(password.encode('utf-8'), hashed)
    print(f"Check result: {check}")
    
    # Verify a known hash from DB (if format is compatible)
    # $2b$12$jdG...
    # Note: DB hashes are strings, bcrypt needs bytes
    
    print("Bcrypt test SUCCESS")
except Exception as e:
    print(f"Bcrypt test FAILED: {e}")
