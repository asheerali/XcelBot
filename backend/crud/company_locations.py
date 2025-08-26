from sqlalchemy.orm import Session
from sqlalchemy import text
from models.company_locations import CompanyLocation
from models.companies import Company
from models.locations import Store
from models.users import User
from models.user_company import UserCompany
from models.user_company_companylocation import UserCompanyCompanyLocation
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



def get_companies_with_locations_auth(db: Session, current_user: User):
    """
    Get companies with their associated locations based on user access permissions.
    Access control:
    - Superuser: All companies and locations
    - Admin: Companies they're associated with and all locations for those companies
    - Manager/User: Their own company and only assigned locations
    """
    
    # Get user role name
    user_role = current_user.role.name.lower() if current_user.role else None
    
    # Determine which companies the user can access
    accessible_company_ids = []
    
    if user_role == "superuser":
        # Superuser can see all companies
        accessible_company_ids = [c.id for c in db.query(Company).all()]
        
    elif user_role == "admin":
        # Admin can see companies they are associated with
        user_companies = db.query(UserCompany).filter(UserCompany.user_id == current_user.id).all()
        accessible_company_ids = [uc.company_id for uc in user_companies]
        
    elif user_role in ["manager", "user"]:
        # Manager/User can only see their own company
        if current_user.company_id:
            accessible_company_ids = [current_user.company_id]
            
    else:
        # Unknown role or no role - return empty list
        return []
    
    if not accessible_company_ids:
        return []
    
    # Build the base query for accessible companies
    base_query = """
        SELECT 
            c.id as company_id,
            c.name as company_name,
            l.id as location_id,
            l.name as location_name
        FROM companies c
        LEFT JOIN company_locations cl ON c.id = cl.company_id
        LEFT JOIN locations l ON cl.location_id = l.id
        WHERE c.id IN ({company_ids})
    """.format(company_ids=','.join(map(str, accessible_company_ids)))
    
    # For manager/user roles, add location filtering
    if user_role in ["manager", "user"]:
        # Get user's assigned locations
        user_assigned_locations = db.query(Store.id).join(
            CompanyLocation, Store.id == CompanyLocation.location_id
        ).join(
            UserCompanyCompanyLocation, CompanyLocation.id == UserCompanyCompanyLocation.company_location_id
        ).filter(
            UserCompanyCompanyLocation.user_id == current_user.id,
            Store.company_id.in_(accessible_company_ids)
        ).all()
        
        assigned_location_ids = [loc_id[0] for loc_id in user_assigned_locations]
        
        if assigned_location_ids:
            base_query += " AND (l.id IN ({location_ids}) OR l.id IS NULL)".format(
                location_ids=','.join(map(str, assigned_location_ids))
            )
        else:
            # User has no assigned locations, only show companies without locations
            base_query += " AND l.id IS NULL"
    
    base_query += " ORDER BY c.id, l.id"
    
    query = text(base_query)
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