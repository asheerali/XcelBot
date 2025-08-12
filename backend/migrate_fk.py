# migrate_foreign_keys.py
import sqlite3
import shutil
from database import DATABASE_URL
from datetime import datetime

def migrate_foreign_keys_preserve_data():
    """
    Updates foreign key constraints to CASCADE without losing data
    """
    
    # Extract database path
    db_path = DATABASE_URL.replace("sqlite:///", "")
    backup_path = f"{db_path}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    print(f"Database: {db_path}")
    print(f"Backup: {backup_path}")
    
    try:
        # Step 1: Create backup
        print("1. Creating backup...")
        shutil.copy2(db_path, backup_path)
        print(f"   ✅ Backup created: {backup_path}")
        
        # Step 2: Connect to database
        conn = sqlite3.connect(db_path)
        conn.execute("PRAGMA foreign_keys = OFF")  # Disable temporarily for migration
        
        # Step 3: Define tables that need CASCADE update
        tables_to_update = {
            'locations': {
                'create_sql': '''
                CREATE TABLE locations_new (
                    id INTEGER NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    city VARCHAR(100) NOT NULL,
                    state VARCHAR(100) NOT NULL,
                    postcode VARCHAR(20) NOT NULL,
                    address VARCHAR(255) NOT NULL,
                    phone VARCHAR(20) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    company_id INTEGER NOT NULL,
                    created_at DATETIME,
                    updated_at DATETIME,
                    PRIMARY KEY (id),
                    FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE
                )''',
                'columns': 'id, name, city, state, postcode, address, phone, email, company_id, created_at, updated_at'
            },
            
            'budget': {
                'create_sql': '''
                CREATE TABLE budget_new (
                    id INTEGER NOT NULL,
                    company_id INTEGER NOT NULL,
                    file_name VARCHAR(255),
                    dashboard INTEGER,
                    Store VARCHAR(100),
                    Date VARCHAR(50),
                    Week INTEGER,
                    Month VARCHAR(20),
                    Quarter INTEGER,
                    Year INTEGER,
                    Helper_1 VARCHAR(100),
                    Helper VARCHAR(100),
                    Helper_2 VARCHAR(100),
                    Helper_4 VARCHAR(100),
                    Sales_Pct_Contribution FLOAT,
                    Catering_Sales FLOAT,
                    In_House_Sales FLOAT,
                    Weekly_Plus_Minus FLOAT,
                    Net_Sales_1 FLOAT,
                    Net_Sales FLOAT,
                    Orders FLOAT,
                    Food_Cost FLOAT,
                    Johns FLOAT,
                    Terra FLOAT,
                    Metro FLOAT,
                    Victory FLOAT,
                    Central_Kitchen FLOAT,
                    Other INTEGER,
                    LPMH FLOAT,
                    SPMH FLOAT,
                    LB_Hours FLOAT,
                    Labor_Cost FLOAT,
                    Labor_Pct_Cost FLOAT,
                    Prime_Cost FLOAT,
                    Prime_Pct_Cost FLOAT,
                    Rent FLOAT,
                    Opex_Cost INTEGER,
                    TTL_Expense FLOAT,
                    Net_Income FLOAT,
                    Net_Pct_Income FLOAT,
                    PRIMARY KEY (id),
                    FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE
                )''',
                'columns': 'id, company_id, file_name, dashboard, Store, Date, Week, Month, Quarter, Year, Helper_1, Helper, Helper_2, Helper_4, Sales_Pct_Contribution, Catering_Sales, In_House_Sales, Weekly_Plus_Minus, Net_Sales_1, Net_Sales, Orders, Food_Cost, Johns, Terra, Metro, Victory, Central_Kitchen, Other, LPMH, SPMH, LB_Hours, Labor_Cost, Labor_Pct_Cost, Prime_Cost, Prime_Pct_Cost, Rent, Opex_Cost, TTL_Expense, Net_Income, Net_Pct_Income'
            },
            
            'logs': {
                'create_sql': '''
                CREATE TABLE logs_new (
                    id INTEGER NOT NULL,
                    company_id INTEGER NOT NULL,
                    location_id INTEGER NOT NULL,
                    filename VARCHAR(255) NOT NULL,
                    created_at DATETIME,
                    file_data JSON NOT NULL,
                    PRIMARY KEY (id),
                    FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE,
                    FOREIGN KEY(location_id) REFERENCES locations (id)
                )''',
                'columns': 'id, company_id, location_id, filename, created_at, file_data'
            },
            
            'users': {
                'create_sql': '''
                CREATE TABLE users_new (
                    id INTEGER NOT NULL,
                    first_name VARCHAR(100) NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    phone_number VARCHAR(20),
                    role VARCHAR(50) NOT NULL,
                    isActive BOOLEAN NOT NULL DEFAULT 1,
                    created_at DATETIME,
                    updated_at DATETIME,
                    company_id INTEGER,
                    PRIMARY KEY (id),
                    FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE,
                    UNIQUE (email)
                )''',
                'columns': 'id, first_name, last_name, email, password_hash, phone_number, role, isActive, created_at, updated_at, company_id'
            }
        }
        
        # Step 4: Update each table
        for table_name, table_info in tables_to_update.items():
            print(f"3. Updating {table_name} table...")
            
            try:
                # Check if table exists and has data
                cursor = conn.execute(f"SELECT COUNT(*) FROM {table_name}")
                row_count = cursor.fetchone()[0]
                print(f"   Found {row_count} rows in {table_name}")
                
                # Create new table with CASCADE constraint
                conn.execute(table_info['create_sql'])
                
                # Copy data from old table to new table
                if row_count > 0:
                    conn.execute(f'''
                        INSERT INTO {table_name}_new ({table_info['columns']})
                        SELECT {table_info['columns']} FROM {table_name}
                    ''')
                    print(f"   Copied {row_count} rows to {table_name}_new")
                
                # Drop old table and rename new table
                conn.execute(f"DROP TABLE {table_name}")
                conn.execute(f"ALTER TABLE {table_name}_new RENAME TO {table_name}")
                
                print(f"   ✅ {table_name} updated with CASCADE constraint")
                
            except Exception as e:
                print(f"   ❌ Error updating {table_name}: {e}")
                raise e
        
        # Step 5: Re-enable foreign keys and commit
        conn.execute("PRAGMA foreign_keys = ON")
        conn.commit()
        conn.close()
        
        print(f"\n🎉 MIGRATION COMPLETED SUCCESSFULLY!")
        print(f"✅ All foreign key constraints now have CASCADE delete")
        print(f"✅ All your data has been preserved")
        print(f"📁 Backup available at: {backup_path}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ MIGRATION FAILED: {e}")
        
        # Restore from backup
        try:
            print("Restoring from backup...")
            shutil.copy2(backup_path, db_path)
            print("✅ Database restored from backup")
        except Exception as restore_error:
            print(f"❌ Failed to restore backup: {restore_error}")
        
        return False

def verify_migration():
    """Verify that the migration worked"""
    from database import get_db
    from sqlalchemy import text
    
    print("\n=== VERIFYING MIGRATION ===")
    
    db = next(get_db())
    try:
        tables_to_check = ['locations', 'budget', 'logs', 'users', 'mails']
        
        for table in tables_to_check:
            fks = db.execute(text(f"PRAGMA foreign_key_list({table})")).fetchall()
            for fk in fks:
                if fk[2] == 'companies':  # References companies table
                    status = "✅ CASCADE" if fk[6] == 'CASCADE' else "❌ NO ACTION"
                    print(f"{table}: {status}")
                    
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 FOREIGN KEY CASCADE MIGRATION")
    print("This will update your database to add CASCADE delete constraints")
    print("while preserving all your existing data.")
    print()
    
    confirm = input("Proceed with migration? (type 'YES'): ")
    if confirm == 'YES':
        success = migrate_foreign_keys_preserve_data()
        if success:
            verify_migration()
    else:
        print("Migration cancelled.")