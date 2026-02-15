import os
import json
import datetime
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker

def clean_row_data(row_dict):
    """
    Helper to serialize non-JSON types (like datetime) to string.
    """
    clean_data = {}
    for key, value in row_dict.items():
        if isinstance(value, (datetime.datetime, datetime.date)):
            clean_data[key] = value.isoformat()
        else:
            clean_data[key] = value
    return clean_data

def backup_database(db_url):
    """
    Connects to the database, introspects tables, and dumps content to JSON.
    """
    # Create a timestamped directory for the backup
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = os.path.join(os.getcwd(), "backups", f"backup_{timestamp}")
    os.makedirs(backup_dir, exist_ok=True)
    
    print(f"📁 Creating backup in: {backup_dir}")
    
    try:
        engine = create_engine(db_url)
        inspector = inspect(engine)
        
        # Get all table names
        table_names = inspector.get_table_names()
        
        if not table_names:
            print("⚠️ No tables found in the database.")
            return

        with engine.connect() as connection:
            for table in table_names:
                print(f"   Processing table: {table}...", end="", flush=True)
                
                # Query all data from the table
                # We use text() for a raw SQL query equivalent
                query = text(f"SELECT * FROM {table}")
                result = connection.execute(query)
                
                # Convert rows to list of dicts
                # result.keys() gives column names
                columns = result.keys()
                rows = [dict(zip(columns, row)) for row in result.fetchall()]
                
                # Clean data for JSON serialization
                cleaned_rows = [clean_row_data(row) for row in rows]
                
                # Write to JSON file
                file_path = os.path.join(backup_dir, f"{table}.json")
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(cleaned_rows, f, indent=2, ensure_ascii=False)
                
                print(f" ✅ ({len(rows)} records)")
                
        print(f"\n✨ Backup completed successfully! Saved to {backup_dir}")

    except Exception as e:
        print(f"\n❌ Error during backup: {e}")

if __name__ == "__main__":
    print("=== YoViajo Database Backup Utility ===")
    print("Este script guardará una copia de seguridad de tu base de datos en archivos JSON locales.\n")
    
    # 1. Ask for DB URL
    print("Por favor, ingresa la 'External Database URL' de tu panel de Render.")
    print("Formato esperado: postgres://usuario:password@host.render.com/basedatos")
    print("(O presiona Enter para usar la base de datos local SQLite por defecto para probar)")
    
    db_url_input = input("\nDatabase URL: ").strip()
    
    if not db_url_input:
        print("ℹ️ Usando base de datos local (fallback)...")
        # Adjust path if script is run from project root or scripts folder
        if os.path.exists("yoviajo.db"):
            db_url_input = "sqlite:///yoviajo.db"
        elif os.path.exists("../yoviajo.db"):
             db_url_input = "sqlite:///../yoviajo.db"
        else:
             print("❌ No se encontró yoviajo.db localmente. Por favor proporciona una URL válida.")
             exit(1)
            
    # Fix for Render URLs that start with 'postgres://' (SQLAlchemy needs 'postgresql://')
    if db_url_input.startswith("postgres://"):
        db_url_input = db_url_input.replace("postgres://", "postgresql://", 1)
        
    backup_database(db_url_input)
