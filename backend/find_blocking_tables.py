# find_all_blocking_tables.py
from database import get_db
from sqlalchemy import text

def find_all_company_references():
    """Find ALL tables that reference companies and their constraint status"""
    db = next(get_db())
    try:
        print("=== FINDING ALL TABLES THAT REFERENCE COMPANIES ===")
        
        # Get all tables
        tables = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")).fetchall()
        
        blocking_tables = []
        cascade_tables = []
        
        for table in tables:
            table_name = table[0]
            if table_name == 'companies':
                continue
                
            # Check foreign keys for this table
            fks = db.execute(text(f"PRAGMA foreign_key_list({table_name})")).fetchall()
            
            for fk in fks:
                if fk[2] == 'companies':  # References companies table
                    fk_info = {
                        'table': table_name,
                        'column': fk[3],
                        'references': f"companies.{fk[4]}",
                        'on_delete': fk[6],
                        'on_update': fk[5]
                    }
                    
                    if fk[6] == 'CASCADE':
                        cascade_tables.append(fk_info)
                    else:
                        blocking_tables.append(fk_info)
        
        print(f"\n✅ TABLES WITH CASCADE DELETE ({len(cascade_tables)}):")
        for table in cascade_tables:
            print(f"   {table['table']}.{table['column']} -> {table['references']}")
        
        print(f"\n❌ TABLES BLOCKING DELETION ({len(blocking_tables)}):")
        for table in blocking_tables:
            print(f"   {table['table']}.{table['column']} -> {table['references']} (ON DELETE: {table['on_delete']})")
        
        return blocking_tables
        
    finally:
        db.close()

def check_data_in_blocking_tables(company_id=6):
    """Check which blocking tables actually have data for the test company"""
    db = next(get_db())
    try:
        print(f"\n=== CHECKING DATA FOR COMPANY {company_id} ===")
        
        # Get all tables that reference companies
        blocking_tables = find_all_company_references()
        
        tables_with_data = []
        
        for table_info in blocking_tables:
            table_name = table_info['table']
            try:
                count = db.execute(
                    text(f"SELECT COUNT(*) FROM {table_name} WHERE company_id = :id"), 
                    {"id": company_id}
                ).fetchone()[0]
                
                if count > 0:
                    tables_with_data.append({'table': table_name, 'count': count})
                    print(f"   {table_name}: {count} records")
                
            except Exception as e:
                print(f"   {table_name}: Error checking - {e}")
        
        if tables_with_data:
            print(f"\n🔍 BLOCKING TABLES WITH DATA:")
            for item in tables_with_data:
                print(f"   {item['table']}: {item['count']} records")
        else:
            print(f"\n✅ No blocking tables have data for company {company_id}")
            
        return tables_with_data
        
    finally:
        db.close()

def get_remaining_table_schemas():
    """Get the CREATE statements for remaining tables that need CASCADE"""
    db = next(get_db())
    try:
        # Find tables that still need CASCADE
        blocking_tables = find_all_company_references()
        
        if not blocking_tables:
            print("✅ All tables have CASCADE constraints!")
            return
        
        print(f"\n=== SCHEMAS FOR REMAINING TABLES ===")
        
        for table_info in blocking_tables:
            table_name = table_info['table']
            result = db.execute(
                text(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}'")
            ).fetchone()
            
            if result:
                print(f"\n{table_name.upper()}:")
                print(result[0])
                print("-" * 50)
                
    finally:
        db.close()

if __name__ == "__main__":
    # Find all tables that reference companies
    blocking_tables = find_all_company_references()
    
    # Check which ones have data for our test company
    check_data_in_blocking_tables(6)
    
    # Show schemas for tables that still need fixing
    get_remaining_table_schemas()