# check_current_constraints.py
from database import get_db
from sqlalchemy import text

def check_current_constraints():
    db = next(get_db())
    try:
        print("=== CURRENT FOREIGN KEY CONSTRAINTS ===")
        
        # Check a few key tables to see if CASCADE was applied
        tables_to_check = ['mails', 'locations', 'budget', 'logs', 'users']
        
        for table in tables_to_check:
            print(f"\n{table.upper()} table:")
            fks = db.execute(text(f"PRAGMA foreign_key_list({table})")).fetchall()
            for fk in fks:
                if fk[2] == 'companies':  # References companies table
                    print(f"  company_id -> companies.id")
                    print(f"  On Delete: {fk[6]}")
                    print(f"  On Update: {fk[5]}")
        
        # Check the table creation SQL to see actual constraints
        print(f"\n=== ACTUAL TABLE DEFINITIONS ===")
        for table in ['mails', 'locations']:
            result = db.execute(text(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table}'")).fetchone()
            if result:
                print(f"\n{table.upper()}:")
                print(result[0])
                
    finally:
        db.close()

if __name__ == "__main__":
    check_current_constraints()