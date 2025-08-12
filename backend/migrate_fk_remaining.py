# migrate_remaining_tables.py
import sqlite3
import shutil
from database import DATABASE_URL
from datetime import datetime

def migrate_remaining_tables():
    """
    Updates the remaining 9 tables to have CASCADE delete constraints
    """
    
    # Extract database path
    db_path = DATABASE_URL.replace("sqlite:///", "")
    backup_path = f"{db_path}.backup_remaining.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
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
        
        # Step 3: Define remaining tables that need CASCADE update
        remaining_tables = {
            'sales_pmix': {
                'create_sql': '''
                CREATE TABLE sales_pmix_new (
                    id INTEGER NOT NULL,
                    company_id INTEGER NOT NULL,
                    file_name VARCHAR(255),
                    dashboard INTEGER,
                    "Location" VARCHAR(100),
                    "Order_Id" BIGINT,
                    "Order_number" INTEGER,
                    "Sent_Date" DATETIME,
                    "Order_Date" VARCHAR(50),
                    "Check_Id" INTEGER,
                    "Server" VARCHAR(100),
                    "Table" VARCHAR(50),
                    "Dining_Area" VARCHAR(100),
                    "Service" VARCHAR(100),
                    "Dining_Option" VARCHAR(100),
                    "Item_Selection_Id" INTEGER,
                    "Item_Id" INTEGER,
                    "Master_Id" INTEGER,
                    "SKU" VARCHAR(100),
                    "PLU" VARCHAR(100),
                    "Menu_Item" VARCHAR(255),
                    "Menu_Subgroups" VARCHAR(200),
                    "Menu_Group" VARCHAR(200),
                    "Menu" VARCHAR(200),
                    "Sales_Category" VARCHAR(100),
                    "Gross_Price" FLOAT,
                    "Discount" INTEGER,
                    "Net_Price" FLOAT,
                    "Qty" INTEGER,
                    "Avg_Price" FLOAT,
                    "Tax" FLOAT,
                    "Void" BOOLEAN,
                    "Deferred" BOOLEAN,
                    "Tax_Exempt" BOOLEAN,
                    "Tax_Inclusion_Option" VARCHAR(100),
                    "Dining_Option_Tax" VARCHAR(100),
                    "Tab_Name" VARCHAR(100),
                    "Date" VARCHAR(50),
                    "Time" VARCHAR(50),
                    "Day" VARCHAR(20),
                    "Week" INTEGER,
                    "Month" VARCHAR(20),
                    "Quarter" INTEGER,
                    "Year" INTEGER,
                    "Category" VARCHAR(100),
                    PRIMARY KEY (id),
                    FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE
                )'''
            },
            
            'financials_company_wide': {
                'create_sql': '''
                CREATE TABLE financials_company_wide_new (
                    id INTEGER NOT NULL,
                    company_id INTEGER NOT NULL,
                    file_name VARCHAR(255),
                    dashboard INTEGER,
                    "Store" VARCHAR(100),
                    "Ly_Date" DATETIME,
                    "Date" VARCHAR(50),
                    "Day" VARCHAR(20),
                    "Week" INTEGER,
                    "Month" VARCHAR(20),
                    "Quarter" INTEGER,
                    "Year" INTEGER,
                    "Helper_1" VARCHAR(100),
                    "Helper_2" VARCHAR(100),
                    "Helper_3" VARCHAR(100),
                    "Helper_4" VARCHAR(100),
                    "Tw_Sales" FLOAT,
                    "Lw_Sales" FLOAT,
                    "Ly_Sales" FLOAT,
                    "Tw_Orders" FLOAT,
                    "Lw_Orders" FLOAT,
                    "Ly_Orders" FLOAT,
                    "Tw_Avg_Tckt" FLOAT,
                    "Lw_Avg_Tckt" FLOAT,
                    "Ly_Avg_Tckt" FLOAT,
                    "Tw_Labor_Hrs" FLOAT,
                    "Lw_Labor_Hrs" FLOAT,
                    "Tw_Reg_Pay" FLOAT,
                    "Lw_Reg_Pay" FLOAT,
                    "Tw_SPMH" FLOAT,
                    "Lw_SPMH" FLOAT,
                    "Tw_LPMH" FLOAT,
                    "Lw_LPMH" FLOAT,
                    "Tw_COGS" FLOAT,
                    "TW_Johns" FLOAT,
                    "TW_Terra" FLOAT,
                    "TW_Metro" FLOAT,
                    "TW_Victory" FLOAT,
                    "TW_Central_Kitchen" FLOAT,
                    "TW_Other" FLOAT,
                    "Unnamed_36" FLOAT,
                    "Unnamed_37" FLOAT,
                    "Unnamed_38" FLOAT,
                    "Unnamed_39" FLOAT,
                    "Lw_COGS" FLOAT,
                    "LW_Johns" FLOAT,
                    "LW_Terra" FLOAT,
                    "LW_Metro" FLOAT,
                    "LW_Victory" FLOAT,
                    "LW_Central_Kitchen" FLOAT,
                    "LW_Other" FLOAT,
                    PRIMARY KEY (id),
                    FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE
                )'''
            },
            
            'uploaded_files': {
                'create_sql': '''
                CREATE TABLE uploaded_files_new (
                    id INTEGER NOT NULL,
                    file_name VARCHAR(255) NOT NULL,
                    dashboard_name VARCHAR(100) NOT NULL,
                    uploader_id INTEGER NOT NULL,
                    company_id INTEGER,
                    uploaded_at DATETIME,
                    PRIMARY KEY (id),
                    FOREIGN KEY(uploader_id) REFERENCES users (id),
                    FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE
                )'''
            },
            
            'masterfile': {
                'create_sql': '''
                CREATE TABLE masterfile_new (
                    id INTEGER NOT NULL,
                    company_id INTEGER NOT NULL,
                    location_id INTEGER NOT NULL,
                    filename VARCHAR(255) NOT NULL,
                    file_data JSON NOT NULL,
                    PRIMARY KEY (id),
                    FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE,
                    FOREIGN KEY(location_id) REFERENCES locations (id)
                )'''
            },
            
            'permissions': {
                'create_sql': '''
                CREATE TABLE permissions_new (
                    id INTEGER NOT NULL,
                    company_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    upload_excel BOOLEAN,
                    d1 BOOLEAN,
                    d2 BOOLEAN,
                    d3 BOOLEAN,
                    d4 BOOLEAN,
                    d5 BOOLEAN,
                    d6 BOOLEAN,
                    d7 BOOLEAN,
                    PRIMARY KEY (id),
                    FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE,
                    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
                )'''
            },
            
            'user_company': {
                'create_sql': '''
                CREATE TABLE user_company_new (
                    id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    company_id INTEGER NOT NULL,
                    PRIMARY KEY (id),
                    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE,
                    FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE
                )'''
            },
            
            'subscriptions': {
                'create_sql': '''
                CREATE TABLE subscriptions_new (
                    id INTEGER NOT NULL,
                    user_id INTEGER,
                    company_id INTEGER,
                    plan_name VARCHAR(100),
                    payment_provider VARCHAR(100),
                    provider_subscription_id VARCHAR(255),
                    status VARCHAR(8),
                    trial_end DATETIME,
                    current_period_start DATETIME,
                    current_period_end DATETIME,
                    cancel_at_period_end BOOLEAN,
                    created_at DATETIME,
                    updated_at DATETIME,
                    PRIMARY KEY (id),
                    FOREIGN KEY(user_id) REFERENCES users (id),
                    FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE
                )'''
            },
            
            'storeorders': {
                'create_sql': '''
                CREATE TABLE storeorders_new (
                    id INTEGER NOT NULL,
                    company_id INTEGER NOT NULL,
                    location_id INTEGER NOT NULL,
                    created_at DATETIME,
                    updated_at DATETIME,
                    items_ordered JSON NOT NULL,
                    prev_items_ordered JSON,
                    PRIMARY KEY (id),
                    FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE,
                    FOREIGN KEY(location_id) REFERENCES locations (id)
                )'''
            },
            
            'payments': {
                'create_sql': '''
                CREATE TABLE payments_new (
                    id INTEGER NOT NULL,
                    user_id INTEGER,
                    company_id INTEGER,
                    subscription_id INTEGER,
                    payment_provider VARCHAR(100),
                    provider_payment_id VARCHAR(255),
                    amount DECIMAL(10, 2),
                    currency VARCHAR(10),
                    status VARCHAR(8),
                    payment_date DATETIME,
                    invoice_url VARCHAR(255),
                    description TEXT,
                    created_at DATETIME,
                    updated_at DATETIME,
                    PRIMARY KEY (id),
                    FOREIGN KEY(user_id) REFERENCES users (id),
                    FOREIGN KEY(company_id) REFERENCES companies (id) ON DELETE CASCADE,
                    FOREIGN KEY(subscription_id) REFERENCES subscriptions (id)
                )'''
            }
        }
        
        # Step 4: Update each table
        for table_name, table_info in remaining_tables.items():
            print(f"3. Updating {table_name} table...")
            
            try:
                # Check if table exists and has data
                cursor = conn.execute(f"SELECT COUNT(*) FROM {table_name}")
                row_count = cursor.fetchone()[0]
                print(f"   Found {row_count} rows in {table_name}")
                
                # Create new table with CASCADE constraint
                conn.execute(table_info['create_sql'])
                
                # Copy data from old table to new table if any exists
                if row_count > 0:
                    # Get column names from the old table
                    cursor = conn.execute(f"PRAGMA table_info({table_name})")
                    columns = [row[1] for row in cursor.fetchall()]
                    # Always quote column names to handle reserved words
                    columns_str = ', '.join([f'"{col}"' for col in columns])
                    
                    conn.execute(f'''
                        INSERT INTO {table_name}_new ({columns_str})
                        SELECT {columns_str} FROM {table_name}
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
        
        print(f"\n🎉 FINAL MIGRATION COMPLETED SUCCESSFULLY!")
        print(f"✅ ALL foreign key constraints now have CASCADE delete")
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

def verify_final_migration():
    """Verify that ALL tables now have CASCADE"""
    from database import get_db
    from sqlalchemy import text
    
    print("\n=== FINAL VERIFICATION ===")
    
    db = next(get_db())
    try:
        # Get all tables that reference companies
        tables = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")).fetchall()
        
        cascade_count = 0
        no_action_count = 0
        
        for table in tables:
            table_name = table[0]
            if table_name == 'companies':
                continue
                
            fks = db.execute(text(f"PRAGMA foreign_key_list({table_name})")).fetchall()
            for fk in fks:
                if fk[2] == 'companies':  # References companies table
                    if fk[6] == 'CASCADE':
                        cascade_count += 1
                        print(f"✅ {table_name}: CASCADE")
                    else:
                        no_action_count += 1
                        print(f"❌ {table_name}: {fk[6]}")
        
        print(f"\nSUMMARY:")
        print(f"✅ Tables with CASCADE: {cascade_count}")
        print(f"❌ Tables without CASCADE: {no_action_count}")
        
        if no_action_count == 0:
            print(f"\n🎉 ALL TABLES NOW HAVE CASCADE DELETE!")
        else:
            print(f"\n⚠️  {no_action_count} tables still need fixing")
                    
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 FINAL CASCADE MIGRATION")
    print("This will update the remaining 9 tables to have CASCADE delete constraints")
    print("while preserving all your existing data.")
    print()
    
    confirm = input("Proceed with final migration? (type 'YES'): ")
    if confirm == 'YES':
        success = migrate_remaining_tables()
        if success:
            verify_final_migration()
    else:
        print("Migration cancelled.")