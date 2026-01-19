
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

        except Exception as e:
            logger.error(f"Migration Error: {e}")
