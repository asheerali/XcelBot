# # # test_cascade_delete.py
# # from database import get_db
# # from models.companies import Company
# # from models.mails import Mail
# # # Add this line if CompanyLocation exists:
# # from models.company_locations import CompanyLocation  # or wherever it's defined
# # from sqlalchemy.orm import Session

# # def test_cascade_delete():
# #     db = next(get_db())
# #     try:
# #         # Find a company that has mails
# #         company_with_mails = db.query(Company).join(Mail).first()
        
# #         if not company_with_mails:
# #             print("No company with mails found for testing")
# #             return
            
# #         company_id = company_with_mails.id
# #         company_name = company_with_mails.name
        
# #         # Count mails before deletion
# #         mail_count_before = db.query(Mail).filter(Mail.company_id == company_id).count()
# #         print(f"Company '{company_name}' (ID: {company_id}) has {mail_count_before} mails")
        
# #         # Delete the company
# #         print(f"Deleting company '{company_name}'...")
# #         db.delete(company_with_mails)
# #         db.commit()
        
# #         # Count mails after deletion
# #         mail_count_after = db.query(Mail).filter(Mail.company_id == company_id).count()
# #         print(f"Mails remaining for company ID {company_id}: {mail_count_after}")
        
# #         if mail_count_after == 0:
# #             print("✅ Cascade delete working correctly!")
# #         else:
# #             print("❌ Cascade delete not working - mails still exist")
            
# #     except Exception as e:
# #         print(f"Error: {e}")
# #         db.rollback()
# #     finally:
# #         db.close()

# # if __name__ == "__main__":
# #     test_cascade_delete()
    
    
#     # test_simple_cascade.py
# from database import get_db
# from sqlalchemy import text

# def test_simple_cascade():
#     db = next(get_db())
#     try:
#         # Create a test company with only mails and company_locations
#         print("Creating test company...")
#         result = db.execute(text("""
#             INSERT INTO companies (name, address, state, postcode, phone, email) 
#             VALUES ('Test Delete Co', '123 Test St', 'Test State', '12345', '555-0123', 'test@test.com')
#         """))
#         db.commit()
        
#         # Get the new company ID
#         company_id = result.lastrowid
#         print(f"Created company with ID: {company_id}")
        
#         # Add a test mail
#         db.execute(text("""
#             INSERT INTO mails (receiver_name, receiver_email, receiving_time, company_id)
#             VALUES ('Test User', 'user@test.com', '09:00:00', :company_id)
#         """), {"company_id": company_id})
        
#         # Add a test company_location
#         db.execute(text("""
#             INSERT INTO company_locations (company_id, location_id)
#             VALUES (:company_id, 1)
#         """), {"company_id": company_id})
        
#         db.commit()
        
#         # Verify data exists
#         mail_count = db.execute(text("SELECT COUNT(*) FROM mails WHERE company_id = :id"), {"id": company_id}).fetchone()[0]
#         loc_count = db.execute(text("SELECT COUNT(*) FROM company_locations WHERE company_id = :id"), {"id": company_id}).fetchone()[0]
#         print(f"Created: {mail_count} mails, {loc_count} company_locations")
        
#         # Now try to delete the company
#         print(f"Deleting company {company_id}...")
#         db.execute(text("DELETE FROM companies WHERE id = :id"), {"id": company_id})
#         db.commit()
        
#         # Check if cascade worked
#         mail_count_after = db.execute(text("SELECT COUNT(*) FROM mails WHERE company_id = :id"), {"id": company_id}).fetchone()[0]
#         loc_count_after = db.execute(text("SELECT COUNT(*) FROM company_locations WHERE company_id = :id"), {"id": company_id}).fetchone()[0]
        
#         print(f"After deletion: {mail_count_after} mails, {loc_count_after} company_locations")
        
#         if mail_count_after == 0 and loc_count_after == 0:
#             print("✅ CASCADE DELETE working for mails and company_locations!")
#         else:
#             print("❌ CASCADE DELETE not working properly")
            
#     except Exception as e:
#         print(f"Error: {e}")
#         db.rollback()
#     finally:
#         db.close()

# if __name__ == "__main__":
#     test_simple_cascade()

# test_cascade_delete_fixed.py
from database import get_db
from sqlalchemy import text

def test_cascade_delete_comprehensive():
    db = next(get_db())
    try:
        print("=== COMPREHENSIVE CASCADE DELETE TEST ===")
        
        # Step 1: Create a test company
        print("1. Creating test company...")
        result = db.execute(text("""
            INSERT INTO companies (name, address, state, postcode, phone, email) 
            VALUES ('Cascade Test Co', '123 Test St', 'Test State', '12345', '555-0123', 'cascade@test.com')
        """))
        db.commit()
        
        company_id = result.lastrowid
        print(f"   ✅ Created company with ID: {company_id}")
        
        # Step 2: Create a test location for this company
        print("2. Creating test location...")
        result = db.execute(text("""
            INSERT INTO locations (name, city, state, postcode, address, phone, email, company_id)
            VALUES ('Test Store', 'Test City', 'Test State', '12345', '123 Store St', '555-0124', 'store@test.com', :company_id)
        """), {"company_id": company_id})
        db.commit()
        
        location_id = result.lastrowid
        print(f"   ✅ Created location with ID: {location_id}")
        
        # Step 3: Add test data to various tables
        print("3. Adding test data to multiple tables...")
        
        # Add mail
        db.execute(text("""
            INSERT INTO mails (receiver_name, receiver_email, receiving_time, company_id)
            VALUES ('Test User', 'user@test.com', '09:00:00', :company_id)
        """), {"company_id": company_id})
        
        # Add company_location (using the location we just created)
        db.execute(text("""
            INSERT INTO company_locations (company_id, location_id)
            VALUES (:company_id, :location_id)
        """), {"company_id": company_id, "location_id": location_id})
        
        # Add some other test data
        db.execute(text("""
            INSERT INTO budget (company_id, Store, Date, Net_Sales)
            VALUES (:company_id, 'Test Store', '2025-01-01', 1000.00)
        """), {"company_id": company_id})
        
        # Add log entry
        db.execute(text("""
            INSERT INTO logs (company_id, location_id, filename, file_data)
            VALUES (:company_id, :location_id, 'test.log', '{}')
        """), {"company_id": company_id, "location_id": location_id})
        
        db.commit()
        print("   ✅ Added test data to multiple tables")
        
        # Step 4: Verify data exists before deletion
        print("4. Verifying test data exists...")
        counts = {}
        
        tables_to_check = [
            'mails', 'company_locations', 'locations', 'budget', 'logs'
        ]
        
        for table in tables_to_check:
            try:
                count = db.execute(text(f"SELECT COUNT(*) FROM {table} WHERE company_id = :id"), 
                                 {"id": company_id}).fetchone()[0]
                counts[table] = count
                print(f"   {table}: {count} records")
            except Exception as e:
                print(f"   {table}: Error checking - {e}")
        
        # Step 5: Delete the company and test cascade
        print(f"5. Deleting company {company_id} to test CASCADE...")
        try:
            db.execute(text("DELETE FROM companies WHERE id = :id"), {"id": company_id})
            db.commit()
            print("   ✅ Company deleted successfully!")
        except Exception as e:
            print(f"   ❌ Error deleting company: {e}")
            db.rollback()
            return
        
        # Step 6: Verify cascade delete worked
        print("6. Verifying CASCADE delete worked...")
        all_cascade_worked = True
        
        for table in tables_to_check:
            try:
                count_after = db.execute(text(f"SELECT COUNT(*) FROM {table} WHERE company_id = :id"), 
                                       {"id": company_id}).fetchone()[0]
                
                if count_after == 0:
                    print(f"   ✅ {table}: {counts.get(table, 0)} → 0 (CASCADE worked)")
                else:
                    print(f"   ❌ {table}: {counts.get(table, 0)} → {count_after} (CASCADE failed)")
                    all_cascade_worked = False
            except Exception as e:
                print(f"   {table}: Error checking after deletion - {e}")
        
        # Summary
        print("\n=== RESULT ===")
        if all_cascade_worked:
            print("🎉 CASCADE DELETE IS WORKING CORRECTLY!")
            print("All related records were automatically deleted when the company was deleted.")
        else:
            print("❌ CASCADE DELETE HAS ISSUES")
            print("Some related records were not automatically deleted.")
            
    except Exception as e:
        print(f"Overall error: {e}")
        db.rollback()
    finally:
        db.close()

def test_simple_existing_company():
    """Test with an existing company that has data"""
    db = next(get_db())
    try:
        print("\n=== TESTING WITH EXISTING COMPANY ===")
        
        # Find an existing company with some data
        result = db.execute(text("""
            SELECT c.id, c.name, 
                   COUNT(DISTINCT m.id) as mail_count,
                   COUNT(DISTINCT cl.id) as company_location_count
            FROM companies c
            LEFT JOIN mails m ON c.id = m.company_id
            LEFT JOIN company_locations cl ON c.id = cl.company_id
            GROUP BY c.id, c.name
            HAVING mail_count > 0 OR company_location_count > 0
            LIMIT 1
        """)).fetchone()
        
        if not result:
            print("No existing company with data found for testing.")
            return
            
        company_id, company_name, mail_count, location_count = result
        print(f"Testing with company: '{company_name}' (ID: {company_id})")
        print(f"Current data: {mail_count} mails, {location_count} company_locations")
        
        # Ask for confirmation before deleting real data
        confirm = input(f"⚠️  Delete company '{company_name}' and all its data? (type 'YES'): ")
        if confirm != 'YES':
            print("Test cancelled.")
            return
        
        # Delete and test cascade
        print(f"Deleting company {company_id}...")
        db.execute(text("DELETE FROM companies WHERE id = :id"), {"id": company_id})
        db.commit()
        
        # Check if data was cascade deleted
        remaining_mails = db.execute(text("SELECT COUNT(*) FROM mails WHERE company_id = :id"), 
                                   {"id": company_id}).fetchone()[0]
        remaining_locations = db.execute(text("SELECT COUNT(*) FROM company_locations WHERE company_id = :id"), 
                                       {"id": company_id}).fetchone()[0]
        
        print(f"After deletion:")
        print(f"  Mails remaining: {remaining_mails}")
        print(f"  Company locations remaining: {remaining_locations}")
        
        if remaining_mails == 0 and remaining_locations == 0:
            print("✅ CASCADE DELETE WORKING with existing data!")
        else:
            print("❌ CASCADE DELETE not working properly")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Run the comprehensive test first
    test_cascade_delete_comprehensive()
    
    # Optionally test with existing data
    # test_simple_existing_company()