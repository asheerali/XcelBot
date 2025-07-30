from sqlalchemy.orm import Session
from sqlalchemy import text
from models.company_locations import CompanyLocation
from schemas.company_locations import CompanyLocationCreate

def create_company_location(db: Session, data: CompanyLocationCreate):
    entry = CompanyLocation(**data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def get_company_location(db: Session, record_id: int):
    return db.query(CompanyLocation).filter(CompanyLocation.id == record_id).first()

def get_company_locations(db: Session):
    return db.query(CompanyLocation).all()

def get_companies_with_locations(db: Session):
    """
    Get all companies with their associated locations in nested format.
    Assumes you have Company and Location tables with proper relationships.
    """
    # Option 1: Using raw SQL (adjust table names as needed)
    query = text("""
        SELECT 
            c.id as company_id,
            c.name as company_name,
            l.id as location_id,
            l.name as location_name
        FROM companies c
        LEFT JOIN company_locations cl ON c.id = cl.company_id
        LEFT JOIN locations l ON cl.location_id = l.id
        ORDER BY c.id, l.id
    """)
    
    result = db.execute(query).fetchall()
    
    # Group results by company
    companies_dict = {}
    for row in result:
        company_id = row.company_id
        if company_id not in companies_dict:
            companies_dict[company_id] = {
                "company_id": company_id,
                "company_name": row.company_name,
                "locations": []
            }
        
        # Add location if it exists (handling LEFT JOIN nulls)
        if row.location_id:
            companies_dict[company_id]["locations"].append({
                "location_id": row.location_id,
                "location_name": row.location_name
            })
    
    return list(companies_dict.values())


def get_locations_from_company(db: Session, company_id: int):
    """
    Get all companies with their associated locations in nested format.
    Assumes you have Company and Location tables with proper relationships.
    """
    # Option 1: Using raw SQL (adjust table names as needed)
    query = text("""
        SELECT 
            c.id as company_id,
            c.name as company_name,
            l.id as location_id,
            l.name as location_name
        FROM companies c
        LEFT JOIN company_locations cl ON c.id = cl.company_id
        LEFT JOIN locations l ON cl.location_id = l.id
        ORDER BY c.id, l.id
    """)
    
    result = db.execute(query).fetchall()
    
    # Group results by company
    companies_dict = {}
    for row in result:
        company_id = row.company_id
        if company_id not in companies_dict:
            companies_dict[company_id] = {
                "company_id": company_id,
                "company_name": row.company_name,
                "locations": []
            }
        
        # Add location if it exists (handling LEFT JOIN nulls)
        if row.location_id:
            companies_dict[company_id]["locations"].append({
                "location_id": row.location_id,
                "location_name": row.location_name
            })
    
    return list(companies_dict.values())

def delete_company_location(db: Session, record_id: int):
    entry = get_company_location(db, record_id)
    if not entry:
        return False
    db.delete(entry)
    db.commit()
    return True