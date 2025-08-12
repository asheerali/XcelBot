# fix_broken_references.py
from database import get_db
from sqlalchemy import text
import sqlite3
import shutil
from database import DATABASE_URL
from datetime import datetime

def fix_broken_foreign_keys():
    """Fix all broken foreign key references in the database"""
    
    db_path = DATABASE_URL.replace("sqlite:///", "")
    backup_path = f"{db_path}.backup_fix_fk.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    print("=== FIXING BROKEN FOREIGN KEY REFERENCES ===")
    print(f"Creating backup: {backup_path}")
    
    # Create backup
    shutil.copy2(db_path, backup_path)
    
    db = next(get_db())
    try:
        # Temporarily disable foreign keys
        db.execute(text("PRAGMA foreign_keys = OFF"))
        db.commit()
        
        print("\n1. Cleaning up broken references...")
        
        # Fix permissions table - remove records referencing non-existent users
        print("   Fixing permissions table...")
        result = db.execute(text("""
            DELETE FROM permissions 
            WHERE user_id NOT IN (SELECT id FROM users WHERE id IS NOT NULL)
        """))
        print(f"      Deleted {result.rowcount} permissions with invalid user references")
        
        # Fix storeorders table - remove records referencing non-existent locations
        print("   Fixing storeorders table...")
        result = db.execute(text("""
            DELETE FROM storeorders 
            WHERE location_id NOT IN (SELECT id FROM locations WHERE id IS NOT NULL)
        """))
        print(f"      Deleted {result.rowcount} storeorders with invalid location references")
        
        # Fix masterfile table - remove records referencing non-existent locations
        print("   Fixing masterfile table...")
        result = db.execute(text("""
            DELETE FROM masterfile 
            WHERE location_id NOT IN (SELECT id FROM locations WHERE id IS NOT NULL)
        """))
        print(f"      Deleted {result.rowcount} masterfile records with invalid location references")
        
        # Fix logs table - remove records referencing non-existent locations
        print("   Fixing logs table...")
        result = db.execute(text("""
            DELETE FROM logs 
            WHERE location_id NOT IN (SELECT id FROM locations WHERE id IS NOT NULL)
        """))
        print(f"      Deleted {result.rowcount} logs with invalid location references")
        
        # Fix company_locations table - remove records referencing non-existent locations
        print("   Fixing company_locations table...")
        result = db.execute(text("""
            DELETE FROM company_locations 
            WHERE location_id NOT IN (SELECT id FROM locations WHERE id IS NOT NULL)
        """))
        print(f"      Deleted {result.rowcount} company_locations with invalid location references")
        
        # Fix user_company table - remove records referencing non-existent users
        print("   Fixing user_company table...")
        result = db.execute(text("""
            DELETE FROM user_company 
            WHERE user_id NOT IN (SELECT id FROM users WHERE id IS NOT NULL)
        """))
        print(f"      Deleted {result.rowcount} user_company records with invalid user references")
        
        # Check for the mysterious user_company_companylocation table
        try:
            tables = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='user_company_companylocation'")).fetchall()
            if tables:
                print("   Found mysterious 'user_company_companylocation' table...")
                result = db.execute(text("DROP TABLE user_company_companylocation"))
                print("      Dropped user_company_companylocation table")
        except Exception as e:
            print(f"   Could not handle user_company_companylocation: {e}")
        
        db.commit()
        
        print("\n2. Re-enabling foreign keys...")
        db.execute(text("PRAGMA foreign_keys = ON"))
        db.commit()
        
        print("\n3. Checking for remaining violations...")
        violations = db.execute(text("PRAGMA foreign_key_check")).fetchall()
        
        if violations:
            print("   ❌ Still have foreign key violations:")
            for violation in violations:
                print(f"      {violation}")
        else:
            print("   ✅ All foreign key violations fixed!")
        
        return len(violations) == 0
        
    except Exception as e:
        print(f"Error fixing foreign keys: {e}")
        db.rollback()
        
        # Restore from backup
        print("Restoring from backup...")
        shutil.copy2(backup_path, db_path)
        return False
        
    finally:
        db.close()

def test_cascade_after_fix():
    """Test cascade delete after fixing broken references"""
    db = next(get_db())
    try:
        print("\n=== TESTING CASCADE DELETE AFTER FIX ===")
        
        company_id = 7
        
        # Check if company 7 still exists
        company_exists = db.execute(text("SELECT COUNT(*) FROM companies WHERE id = :id"), {"id": company_id}).fetchone()[0]
        
        if company_exists == 0:
            print(f"Company {company_id} no longer exists - creating new test company...")
            
            # Create new test company and data
            result = db.execute(text("""
                INSERT INTO companies (name, address, state, postcode, phone, email) 
                VALUES ('Fixed Test Co', '123 Fixed St', 'Test State', '12345', '555-8888', 'fixed@test.com')
            """))
            db.commit()
            company_id = result.lastrowid
            
            # Add test data
            db.execute(text("""
                INSERT INTO mails (receiver_name, receiver_email, receiving_time, company_id)
                VALUES ('Fixed Test', 'fixed@test.com', '11:00:00', :company_id)
            """), {"company_id": company_id})
            
            db.execute(text("""
                INSERT INTO budget (company_id, Store, Date, Net_Sales)
                VALUES (:company_id, 'Fixed Store', '2025-01-01', 750.00)
            """), {"company_id": company_id})
            
            db.commit()
            print(f"   Created new test company with ID: {company_id}")
        
        # Count data before deletion
        tables_to_check = ['mails', 'company_locations', 'locations', 'budget', 'logs']
        counts_before = {}
        
        for table in tables_to_check:
            try:
                count = db.execute(text(f'SELECT COUNT(*) FROM "{table}" WHERE company_id = :id'), {"id": company_id}).fetchone()[0]
                counts_before[table] = count
                if count > 0:
                    print(f"   {table}: {count} records")
            except:
                counts_before[table] = 0
        
        # Try to delete the company
        print(f"\nAttempting to delete company {company_id}...")
        try:
            db.execute(text("DELETE FROM companies WHERE id = :id"), {"id": company_id})
            db.commit()
            print("   ✅ Company deleted successfully!")
            
            # Check cascade results
            print("\nChecking cascade results...")
            all_cascaded = True
            for table in tables_to_check:
                try:
                    count = db.execute(text(f'SELECT COUNT(*) FROM "{table}" WHERE company_id = :id'), {"id": company_id}).fetchone()[0]
                    status = "✅ CASCADED" if count == 0 else "❌ NOT CASCADED"
                    print(f"   {table}: {counts_before[table]} → {count} {status}")
                    if count > 0:
                        all_cascaded = False
                except Exception as e:
                    print(f"   {table}: Error checking - {e}")
            
            if all_cascaded:
                print("\n🎉 CASCADE DELETE IS NOW WORKING PERFECTLY!")
            else:
                print("\n❌ Some records were not cascaded")
                
        except Exception as e:
            print(f"   ❌ Still failed to delete company: {e}")
            db.rollback()
            
    except Exception as e:
        print(f"Test error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    success = fix_broken_foreign_keys()
    if success:
        test_cascade_after_fix()
    else:
        print("❌ Could not fix broken foreign keys")