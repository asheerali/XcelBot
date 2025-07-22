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

# def get_companies_with_locations(db: Session):
#     """
#     Get all companies with their associated locations in nested format.
#     Assumes you have Company and Location tables with proper relationships.
#     """
#     # Option 1: Using raw SQL (adjust table names as needed)
#     query = text("""
#         SELECT 
#             c.id as company_id,
#             c.name as company_name,
#             l.id as location_id,
#             l.name as location_name
#         FROM companies c
#         LEFT JOIN company_locations cl ON c.id = cl.company_id
#         LEFT JOIN locations l ON cl.location_id = l.id
#         ORDER BY c.id, l.id
#     """)
    
#     result = db.execute(query).fetchall()
    
#     # Group results by company
#     companies_dict = {}
#     for row in result:
#         company_id = row.company_id
#         if company_id not in companies_dict:
#             companies_dict[company_id] = {
#                 "company_id": company_id,
#                 "company_name": row.company_name,
#                 "locations": []
#             }
        
#         # Add location if it exists (handling LEFT JOIN nulls)
#         if row.location_id:
#             companies_dict[company_id]["locations"].append({
#                 "location_id": row.location_id,
#                 "location_name": row.location_name
#             })
    
#     return list(companies_dict.values())


from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.companies import Company
from models.locations import Store
from models.users import User
from models.user_company import UserCompany
from models.user_company_companylocation import UserCompanyCompanyLocation
from models.company_locations import CompanyLocation

def get_companies_with_locations(db: Session, current_user: User):
    """
    Return companies accessible by the current user, with associated locations.
    Similar access logic to get_company_overview.
    """
    user_role = current_user.role.name.lower() if current_user.role else None
    accessible_companies = []

    if user_role == "superuser":
        accessible_companies = db.query(Company).all()

    elif user_role == "admin":
        user_companies = db.query(UserCompany).filter(UserCompany.user_id == current_user.id).all()
        company_ids = [uc.company_id for uc in user_companies]
        if company_ids:
            accessible_companies = db.query(Company).filter(Company.id.in_(company_ids)).all()

    elif user_role in ["manager", "user"]:
        if current_user.company_id:
            accessible_companies = db.query(Company).filter(Company.id == current_user.company_id).all()
        else:
            accessible_companies = []

    else:
        raise HTTPException(status_code=403, detail="Access denied: Invalid user role")

    if not accessible_companies:
        return []

    response = []

    for company in accessible_companies:
        # Get locations for this company
        company_locations_query = db.query(Store).filter(Store.company_id == company.id)

        if user_role in ["manager", "user"]:
            user_assigned_locations = db.query(Store.id).join(
                CompanyLocation, Store.id == CompanyLocation.location_id
            ).join(
                UserCompanyCompanyLocation, CompanyLocation.id == UserCompanyCompanyLocation.company_location_id
            ).filter(
                UserCompanyCompanyLocation.user_id == current_user.id,
                Store.company_id == company.id
            ).all()

            assigned_location_ids = [loc_id[0] for loc_id in user_assigned_locations]

            if assigned_location_ids:
                company_locations = company_locations_query.filter(Store.id.in_(assigned_location_ids)).all()
            else:
                company_locations = []
        else:
            company_locations = company_locations_query.all()

        locations_payload = [
            {
                "location_id": loc.id,
                "location_name": loc.name
            }
            for loc in company_locations
        ]

        response.append({
            "company_id": company.id,
            "company_name": company.name,
            "locations": locations_payload
        })

    return response


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