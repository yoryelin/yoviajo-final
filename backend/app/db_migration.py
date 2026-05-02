
from sqlalchemy import text
from app.database import engine
from app.core.logger import logger

def run_migrations():
    """
    Checks for missing columns in existing tables and adds them via ALTER TABLE.
    This is a poor-man's migration system for the MVP.
    """
    logger.info("🛠️ Running Auto-Migrations...")
    
    with engine.connect() as connection:
        try:
            # 1. Check 'bookings' table for 'payment_status'
            # Note: Postgres vs SQLite syntax differs slightly for checking columns, 
            # but usually selecting from information_schema is safest for Postgres.
            # However, for simplicity and cross-compat, we try to Select header.
            
            # Strategy: Try to select the column. If it fails, add it.
            try:
                connection.execute(text("SELECT payment_status FROM bookings LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'payment_status' missing in 'bookings'. Adding it...")
                try:
                    # Rollback previous transaction if it failed
                    try:
                        connection.rollback()
                    except:
                        pass
                    
                    # Add Column
                    # Postgres syntax: ALTER TABLE bookings ADD COLUMN payment_status VARCHAR DEFAULT 'unpaid'
                    # SQLite syntax: Same
                    connection.execute(text("ALTER TABLE bookings ADD COLUMN payment_status VARCHAR DEFAULT 'unpaid'"))
                    connection.commit()
                    logger.info("✅ Added 'payment_status' column.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'payment_status': {e}")
            
            # 2. Check 'fee_amount'
            try:
                connection.execute(text("SELECT fee_amount FROM bookings LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'fee_amount' missing in 'bookings'. Adding it...")
                try:
                    try:
                        connection.rollback()
                    except:
                        pass
                    connection.execute(text("ALTER TABLE bookings ADD COLUMN fee_amount FLOAT DEFAULT 5000.0"))
                    connection.commit()
                    logger.info("✅ Added 'fee_amount' column.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'fee_amount': {e}")
            
            # 3. Check 'driver_phone' in 'bookings' (Contact Lock)
            try:
                connection.execute(text("SELECT driver_phone FROM bookings LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'driver_phone' missing in 'bookings'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE bookings ADD COLUMN driver_phone VARCHAR DEFAULT NULL"))
                    connection.commit()
                    logger.info("✅ Added 'driver_phone' column.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'driver_phone': {e}")

            # 4. Check 'passenger_phone' in 'bookings' (Contact Lock)
            try:
                connection.execute(text("SELECT passenger_phone FROM bookings LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'passenger_phone' missing in 'bookings'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE bookings ADD COLUMN passenger_phone VARCHAR DEFAULT NULL"))
                    connection.commit()
                    logger.info("✅ Added 'passenger_phone' column.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'passenger_phone': {e}")

            # 5. Check 'payment_init_point' in 'bookings' (MP Integration)
            try:
                connection.execute(text("SELECT payment_init_point FROM bookings LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'payment_init_point' missing in 'bookings'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE bookings ADD COLUMN payment_init_point VARCHAR DEFAULT NULL"))
                    connection.commit()
                    logger.info("✅ Added 'payment_init_point' column.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'payment_init_point': {e}")

            # 6. Check 'payment_id' in 'bookings' (MP Integration)
            try:
                connection.execute(text("SELECT payment_id FROM bookings LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'payment_id' missing in 'bookings'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE bookings ADD COLUMN payment_id VARCHAR DEFAULT NULL"))
                    connection.commit()
                    logger.info("✅ Added 'payment_id' column.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'payment_id': {e}")

            # 7. Check 'phone' in 'users' (Identity)
            try:
                connection.execute(text("SELECT phone FROM users LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'phone' missing in 'users'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR DEFAULT NULL"))
                    connection.commit()
                    logger.info("✅ Added 'phone' column to users.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'phone' to users: {e}")

            # 8. Check 'profile_picture' in 'users' (Cloudinary)
            try:
                connection.execute(text("SELECT profile_picture FROM users LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'profile_picture' missing in 'users'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE users ADD COLUMN profile_picture VARCHAR DEFAULT NULL"))
                    connection.commit()
                    logger.info("✅ Added 'profile_picture' column to users.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'profile_picture' to users: {e}")

            # 9. Check 'verification_document' in 'users' (Trust & Safety)
            try:
                connection.execute(text("SELECT verification_document FROM users LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'verification_document' missing in 'users'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE users ADD COLUMN verification_document VARCHAR DEFAULT NULL"))
                    connection.commit()
                    logger.info("✅ Added 'verification_document' column to users.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'verification_document' to users: {e}")

            # 10. Check 'verification_status' in 'users' (Trust & Safety)
            try:
                connection.execute(text("SELECT verification_status FROM users LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'verification_status' missing in 'users'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE users ADD COLUMN verification_status VARCHAR DEFAULT 'unverified'"))
                    connection.commit()
                    logger.info("✅ Added 'verification_status' column to users.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'verification_status' to users: {e}")

            # 11. Check 'driver_license' in 'users' (Trust & Safety)
            try:
                connection.execute(text("SELECT driver_license FROM users LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'driver_license' missing in 'users'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE users ADD COLUMN driver_license VARCHAR DEFAULT NULL"))
                    connection.commit()
                    logger.info("✅ Added 'driver_license' column to users.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'driver_license' to users: {e}")

            # 12. Check 'gender' in 'users'
            try:
                connection.execute(text("SELECT gender FROM users LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'gender' missing in 'users'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE users ADD COLUMN gender VARCHAR DEFAULT 'O'"))
                    connection.commit()
                    logger.info("✅ Added 'gender' column to users.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'gender' to users: {e}")

            # 13. Check 'is_verified' in 'users'
            try:
                connection.execute(text("SELECT is_verified FROM users LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'is_verified' missing in 'users'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE"))
                    connection.commit()
                    logger.info("✅ Added 'is_verified' column to users.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'is_verified' to users: {e}")

            # 14. Check 'car_color' in 'users'
            try:
                connection.execute(text("SELECT car_color FROM users LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'car_color' missing in 'users'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE users ADD COLUMN car_color VARCHAR DEFAULT NULL"))
                    connection.commit()
                    logger.info("✅ Added 'car_color' column to users.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'car_color' to users: {e}")

            # 15. Check 'phone_verified' in 'users'
            try:
                connection.execute(text("SELECT phone_verified FROM users LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'phone_verified' missing in 'users'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE"))
                    connection.commit()
                    logger.info("✅ Added 'phone_verified' column to users.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'phone_verified' to users: {e}")

            # 16. Check 'email_verified' in 'users'
            try:
                connection.execute(text("SELECT email_verified FROM users LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'email_verified' missing in 'users'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE"))
                    connection.commit()
                    logger.info("✅ Added 'email_verified' column to users.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'email_verified' to users: {e}")

            # 17. Check 'birth_date' in 'users'
            try:
                connection.execute(text("SELECT birth_date FROM users LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'birth_date' missing in 'users'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE users ADD COLUMN birth_date DATE DEFAULT NULL"))
                    connection.commit()
                    logger.info("✅ Added 'birth_date' column to users.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'birth_date' to users: {e}")

            # 18. Check 'address' in 'users'
            try:
                connection.execute(text("SELECT address FROM users LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'address' missing in 'users'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE users ADD COLUMN address VARCHAR DEFAULT NULL"))
                    connection.commit()
                    logger.info("✅ Added 'address' column to users.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'address' to users: {e}")

            # 19. Check 'fuel_liters_total' in 'rides'
            try:
                connection.execute(text("SELECT fuel_liters_total FROM rides LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'fuel_liters_total' missing in 'rides'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE rides ADD COLUMN fuel_liters_total FLOAT DEFAULT 0.0"))
                    connection.commit()
                    logger.info("✅ Added 'fuel_liters_total' column to rides.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'fuel_liters_total' to rides: {e}")

            # 20. Check 'price_per_seat_liters' in 'rides'
            try:
                connection.execute(text("SELECT price_per_seat_liters FROM rides LIMIT 1"))
            except Exception:
                logger.warning("⚠️ Column 'price_per_seat_liters' missing in 'rides'. Adding it...")
                try:
                    try: connection.rollback()
                    except: pass
                    connection.execute(text("ALTER TABLE rides ADD COLUMN price_per_seat_liters FLOAT DEFAULT 0.0"))
                    connection.commit()
                    logger.info("✅ Added 'price_per_seat_liters' column to rides.")
                except Exception as e:
                    logger.error(f"❌ Failed to add 'price_per_seat_liters' to rides: {e}")

            # 21. DATA FIX: Ensure 'juan pablo' is a Driver (C)
            try:
                connection.execute(text("UPDATE users SET role = 'C' WHERE lower(name) LIKE '%juan pablo%' AND role != 'C'"))
                connection.commit()
            except: pass
            
            # 13. DATA FIX: Promote 'jorge melgarejo' (DNI 18507564) to ADMIN
            try:
                # Update by DNI for precision, fallback to name
                connection.execute(text("UPDATE users SET role = 'admin' WHERE dni = '18507564'"))
                connection.execute(text("UPDATE users SET role = 'admin' WHERE lower(name) LIKE '%jorge melgarejo%' AND role != 'admin'"))
                connection.commit()
                logger.info("✅ Data Fix: Promoted 'jorge melgarejo' to ADMIN.")
            except Exception as e:
                logger.error(f"❌ Failed to promote jorge to admin: {e}")

        except Exception as e:
            logger.error(f"Migration Error: {e}")
