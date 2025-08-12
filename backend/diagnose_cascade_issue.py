# diagnose_cascade_issue.py
from database import get_db
from sqlalchemy import text

def diagnose_company_7():
    """Find out exactly what's preventing company 7 from being deleted"""
    db = next(get_db())
    try:
        company_id = 7
        
        print(f"=== DIAGNOSING COMPANY {company_id} DELETION ISSUE ===")
        
        # Check if foreign keys are enabled in this session
        fk_status = db.execute(text("PRAGMA foreign_keys")).fetchone()[0]
        print(f"Foreign keys enabled in session: {fk_status == 1}")
        
        # Enable foreign keys if not enabled
        if fk_status != 1:
            print("Enabling foreign keys...")
            db.execute(text("PRAGMA foreign_keys = ON"))
            db.commit()
        
        # Check all tables for references to this company
        print(f"\n=== DATA REFERENCING COMPANY {company_id} ===")
        
        # Get all tables
        tables = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")).fetchall()
        
        problematic_tables = []
        
        for table in tables:
            table_name = table[0]
            if table_name == 'companies':
                continue
            
            try:
                # Check if this table has a company_id column
                columns = db.execute(text(f"PRAGMA table_info({table_name})")).fetchall()
                has_company_id = any(col[1] == 'company_id' for col in columns)
                
                if has_company_id:
                    # Check if there's data for this company
                    count = db.execute(text(f'SELECT COUNT(*) FROM "{table_name}" WHERE company_id = :id'), {"id": company_id}).fetchone()[0]
                    
                    if count > 0:
                        # Check the foreign key constraint for this table
                        fks = db.execute(text(f"PRAGMA foreign_key_list({table_name})")).fetchall()
                        fk_action = "UNKNOWN"
                        for fk in fks:
                            if fk[2] == 'companies':  # References companies table
                                fk_action = fk[6]  # ON DELETE action
                        
                        status = "✅ CASCADE" if fk_action == "CASCADE" else f"❌ {fk_action}"
                        print(f"   {table_name}: {count} records, FK: {status}")
                        
                        if fk_action != "CASCADE":
                            problematic_tables.append(table_name)
                
            except Exception as e:
                print(f"   {table_name}: Error checking - {e}")
        
        if problematic_tables:
            print(f"\n❌ PROBLEMATIC TABLES (not CASCADE): {problematic_tables}")
        else:
            print(f"\n✅ All tables with data have CASCADE constraints")
        
        # Check for circular references or complex constraints
        print(f"\n=== CHECKING FOR COMPLEX CONSTRAINTS ===")
        
        # Check if any tables reference locations that belong to this company
        try:
            # Find locations belonging to this company
            location_ids = db.execute(text("SELECT id FROM locations WHERE company_id = :id"), {"id": company_id}).fetchall()
            
            if location_ids:
                location_ids_list = [str(loc[0]) for loc in location_ids]
                print(f"Company {company_id} has locations: {location_ids_list}")
                
                # Check what references these locations
                for table in tables:
                    table_name = table[0]
                    if table_name in ['companies', 'locations']:
                        continue
                    
                    try:
                        columns = db.execute(text(f"PRAGMA table_info({table_name})")).fetchall()
                        has_location_id = any(col[1] == 'location_id' for col in columns)
                        
                        if has_location_id:
                            for location_id in location_ids_list:
                                count = db.execute(text(f'SELECT COUNT(*) FROM "{table_name}" WHERE location_id = :id'), {"id": location_id}).fetchone()[0]
                                if count > 0:
                                    print(f"   {table_name}: {count} records reference location {location_id}")
                    except Exception as e:
                        pass
        except Exception as e:
            print(f"Error checking location references: {e}")
        
        # Try a manual step-by-step deletion to see where it fails
        print(f"\n=== ATTEMPTING MANUAL STEP-BY-STEP DELETION ===")
        
        try:
            # Try deleting just the company (should fail and show us the exact constraint)
            db.execute(text("DELETE FROM companies WHERE id = :id"), {"id": company_id})
            print("✅ Company deletion succeeded!")
            db.rollback()  # Don't actually commit
        except Exception as e:
            print(f"❌ Company deletion failed: {e}")
            db.rollback()
            
            # Try to get more detailed error info
            try:
                # Check foreign key violations
                violations = db.execute(text("PRAGMA foreign_key_check")).fetchall()
                if violations:
                    print(f"Foreign key violations found:")
                    for violation in violations:
                        print(f"   {violation}")
                else:
                    print("No foreign key violations found in current state")
            except Exception as e2:
                print(f"Could not check foreign key violations: {e2}")
        
    finally:
        db.close()

def test_foreign_key_behavior():
    """Test foreign key behavior with a simple example"""
    db = next(get_db())
    try:
        print("\n=== TESTING FOREIGN KEY BEHAVIOR ===")
        
        # Enable foreign keys
        db.execute(text("PRAGMA foreign_keys = ON"))
        db.commit()
        
        # Create a simple test
        db.execute(text("""
            CREATE TEMPORARY TABLE test_parent (
                id INTEGER PRIMARY KEY,
                name TEXT
            )
        """))
        
        db.execute(text("""
            CREATE TEMPORARY TABLE test_child (
                id INTEGER PRIMARY KEY,
                parent_id INTEGER,
                name TEXT,
                FOREIGN KEY(parent_id) REFERENCES test_parent(id) ON DELETE CASCADE
            )
        """))
        
        # Insert test data
        db.execute(text("INSERT INTO test_parent (id, name) VALUES (999, 'Test Parent')"))
        db.execute(text("INSERT INTO test_child (parent_id, name) VALUES (999, 'Test Child')"))
        db.commit()
        
        # Check data exists
        parent_count = db.execute(text("SELECT COUNT(*) FROM test_parent WHERE id = 999")).fetchone()[0]
        child_count = db.execute(text("SELECT COUNT(*) FROM test_child WHERE parent_id = 999")).fetchone()[0]
        print(f"Before deletion: parent={parent_count}, child={child_count}")
        
        # Test cascade delete
        db.execute(text("DELETE FROM test_parent WHERE id = 999"))
        db.commit()
        
        # Check data after deletion
        parent_count = db.execute(text("SELECT COUNT(*) FROM test_parent WHERE id = 999")).fetchone()[0]
        child_count = db.execute(text("SELECT COUNT(*) FROM test_child WHERE parent_id = 999")).fetchone()[0]
        print(f"After deletion: parent={parent_count}, child={child_count}")
        
        if parent_count == 0 and child_count == 0:
            print("✅ Basic CASCADE delete is working")
        else:
            print("❌ Basic CASCADE delete is NOT working")
            
    except Exception as e:
        print(f"Foreign key test error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    diagnose_company_7()
    test_foreign_key_behavior()