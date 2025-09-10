from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.companies import Company
from models.locations import Store
from models.users import User
from models.permissions import Permission
from models.user_company import UserCompany
from datetime import datetime
from models.user_company_companylocation import UserCompanyCompanyLocation
from models.company_locations import CompanyLocation
from dependencies.auth import get_current_active_user


router = APIRouter(
    prefix="/company-overview",
    tags=["Company Overview"]
)

@router.get("/")
def get_company_overview(db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_active_user)
                         ):
    print("Current User_id:", current_user.id)
    print("Current User Role:", current_user.role.name if current_user.role else "No Role")
    
    # Get user role name
    user_role = current_user.role.name.lower() if current_user.role else None
    
    # Determine which companies the user can access
    accessible_companies = []
    
    if user_role == "superuser":
        # Superuser can see all companies
        accessible_companies = db.query(Company).all()
        print("Superuser access: All companies")
        
    elif user_role == "admin":
        # Admin can see companies they are associated with
        user_companies = db.query(UserCompany).filter(UserCompany.user_id == current_user.id).all()
        company_ids = [uc.company_id for uc in user_companies]
        
        if company_ids:
            accessible_companies = db.query(Company).filter(Company.id.in_(company_ids)).all()
        
        print(f"Admin access: Companies {company_ids}")
        
    elif user_role in ["manager", "user"]:
        # Manager/User can only see their own company
        if current_user.company_id:
            accessible_companies = db.query(Company).filter(Company.id == current_user.company_id).all()
        
        print(f"Manager/User access: Company {current_user.company_id}")
        
    else:
        # Unknown role or no role - deny access
        raise HTTPException(status_code=403, detail="Access denied: Invalid user role")
    
    if not accessible_companies:
        return []
    
    response = []
    
    for company in accessible_companies:
        # Get users for this company
        company_users_query = db.query(User).filter(User.company_id == company.id)
        
        # Filter users based on current user's role
        if user_role == "superuser":
            # Superuser sees all users
            company_users = company_users_query.all()
        elif user_role == "admin":
            # Admin sees all users in their accessible companies
            company_users = company_users_query.all()
        elif user_role == "manager":
            # Manager sees users in their company, but might have additional restrictions
            company_users = company_users_query.all()
        elif user_role == "user":
            # Regular user only sees themselves
            company_users = company_users_query.filter(User.id == current_user.id).all()
        
        # Get locations for this company
        company_locations_query = db.query(Store).filter(Store.company_id == company.id)
        
        # Filter locations based on current user's role and assigned locations
        if user_role == "superuser":
            # Superuser sees all locations
            company_locations = company_locations_query.all()
        elif user_role == "admin":
            # Admin sees all locations in their accessible companies
            company_locations = company_locations_query.all()
        elif user_role in ["manager", "user"]:
            # Manager/User sees only their assigned locations
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
        
        # Get permissions map for users in this company
        permissions_map = {
            p.user_id: p for p in db.query(Permission).filter(Permission.company_id == company.id).all()
        }

        users_payload = []
        for user in company_users:
            user_permission = permissions_map.get(user.id)

            # Get assigned locations for the user
            user_location_entries = db.query(Store.id, Store.company_id, Store.name).join(
                CompanyLocation, Store.id == CompanyLocation.location_id
            ).join(
                UserCompanyCompanyLocation, CompanyLocation.id == UserCompanyCompanyLocation.company_location_id
            ).filter(
                UserCompanyCompanyLocation.user_id == user.id
            ).all()

            assigned_locations = [
                {
                    "location_id": loc_id,
                    "company_id": comp_id,
                    "location_name": loc_name
                }
                for loc_id, comp_id, loc_name in user_location_entries
            ]

            permissions_list = []
            if user_permission:
                if getattr(user_permission, "upload_excel", False): permissions_list.append("excel_upload")
                if getattr(user_permission, "d1", False): permissions_list.append("sales_split")
                if getattr(user_permission, "d2", False): permissions_list.append("product_mix")
                if getattr(user_permission, "d3", False): permissions_list.append("finance")
                if getattr(user_permission, "d4", False): permissions_list.append("sales_wide")
                if getattr(user_permission, "d5", False): permissions_list.append("orderiq")
                if getattr(user_permission, "d6", False): permissions_list.append("inventoryiq")
                if getattr(user_permission, "d7", False): permissions_list.append("order_flow")

            users_payload.append({
                "id": user.id,
                "name": f"{user.first_name} {user.last_name}".strip(),
                "email": user.email,
                "phone_number": user.phone_number or "",
                "role": user.role.name.capitalize() if user.role else "Unknown",
                "permissions": permissions_list,
                "assignedLocations": assigned_locations,
                "isActive": user.is_active if hasattr(user, "is_active") else True,
                "companyId": user.company_id,
                "createdAt": user.created_at or None,
                "isActive": user.isActive if hasattr(user, "isActive") else True
            })

        locations_payload = []
        for loc in company_locations:
            locations_payload.append({
                "id": loc.id,
                "name": loc.name,
                "city": loc.city or "",
                "state": loc.state or "",
                "postcode": loc.postcode or "",
                "address": loc.address or "",
                "phone": loc.phone or "",
                "email": loc.email or "",
                "companyId": loc.company_id,
                "isActive": True,
                "createdAt": loc.created_at or None,
                "updatedAt": loc.updated_at or None,
                "manager": None  # Optional enhancement: lookup from another model
            })

        response.append({
            "id": company.id,
            "name": company.name,
            "city": getattr(company, "city", company.state),
            "state": company.state,
            "postcode": company.postcode,
            "address": company.address,
            "phone": company.phone,
            "email": company.email,
            "website": company.website,
            "industry": getattr(company, "industry", "Unknown"),
            "isActive": True,
            "createdAt": company.created_at or None,
            "updatedAt": datetime.utcnow(),
            "locations": locations_payload,
            "users": users_payload
        })

    return response


@router.get("/dummy")
def get_company_overview(db: Session = Depends(get_db),
                        #  current_user: User = Depends(get_current_active_user)
                         ):
    # print("Current User_id:", current_user.id)
    # print("Current User Role:", current_user.role.name if current_user.role else "No Role")

    current_user = db.query(User).filter(User.id == 1)
    # Get user role name
    # user_role = current_user.role.name.lower() if current_user.role else None
    
    # Determine which companies the user can access
    user_role = "superuser"  # For testing purposes, set to superuser
    
    accessible_companies = []
    
    
    if user_role == "superuser":
        # Superuser can see all companies
        accessible_companies = db.query(Company).all()
        print("Superuser access: All companies")
        
    elif user_role == "admin":
        # Admin can see companies they are associated with
        user_companies = db.query(UserCompany).filter(UserCompany.user_id == current_user.id).all()
        company_ids = [uc.company_id for uc in user_companies]
        
        if company_ids:
            accessible_companies = db.query(Company).filter(Company.id.in_(company_ids)).all()
        
        print(f"Admin access: Companies {company_ids}")
        
    elif user_role in ["manager", "user"]:
        # Manager/User can only see their own company
        if current_user.company_id:
            accessible_companies = db.query(Company).filter(Company.id == current_user.company_id).all()
        
        print(f"Manager/User access: Company {current_user.company_id}")
        
    else:
        # Unknown role or no role - deny access
        raise HTTPException(status_code=403, detail="Access denied: Invalid user role")
    
    if not accessible_companies:
        return []
    
    response = []
    
    for company in accessible_companies:
        # Get users for this company
        company_users_query = db.query(User).filter(User.company_id == company.id)
        
        # Filter users based on current user's role
        if user_role == "superuser":
            # Superuser sees all users
            company_users = company_users_query.all()
        elif user_role == "admin":
            # Admin sees all users in their accessible companies
            company_users = company_users_query.all()
        elif user_role == "manager":
            # Manager sees users in their company, but might have additional restrictions
            company_users = company_users_query.all()
        elif user_role == "user":
            # Regular user only sees themselves
            company_users = company_users_query.filter(User.id == current_user.id).all()
        
        # Get locations for this company
        company_locations_query = db.query(Store).filter(Store.company_id == company.id)
        
        # Filter locations based on current user's role and assigned locations
        if user_role == "superuser":
            # Superuser sees all locations
            company_locations = company_locations_query.all()
        elif user_role == "admin":
            # Admin sees all locations in their accessible companies
            company_locations = company_locations_query.all()
        elif user_role in ["manager", "user"]:
            # Manager/User sees only their assigned locations
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
        
        # Get permissions map for users in this company
        permissions_map = {
            p.user_id: p for p in db.query(Permission).filter(Permission.company_id == company.id).all()
        }

        users_payload = []
        for user in company_users:
            user_permission = permissions_map.get(user.id)

            # Get assigned locations for the user
            user_location_entries = db.query(Store.id, Store.company_id, Store.name).join(
                CompanyLocation, Store.id == CompanyLocation.location_id
            ).join(
                UserCompanyCompanyLocation, CompanyLocation.id == UserCompanyCompanyLocation.company_location_id
            ).filter(
                UserCompanyCompanyLocation.user_id == user.id
            ).all()

            assigned_locations = [
                {
                    "location_id": loc_id,
                    "company_id": comp_id,
                    "location_name": loc_name
                }
                for loc_id, comp_id, loc_name in user_location_entries
            ]

            permissions_list = []
            if user_permission:
                if getattr(user_permission, "upload_excel", False): permissions_list.append("excel_upload")
                if getattr(user_permission, "d1", False): permissions_list.append("sales_split")
                if getattr(user_permission, "d2", False): permissions_list.append("product_mix")
                if getattr(user_permission, "d3", False): permissions_list.append("finance")
                if getattr(user_permission, "d4", False): permissions_list.append("sales_wide")
                if getattr(user_permission, "d5", False): permissions_list.append("orderiq")
                if getattr(user_permission, "d6", False): permissions_list.append("inventoryiq")
                if getattr(user_permission, "d7", False): permissions_list.append("order_flow")

            users_payload.append({
                "id": user.id,
                "name": f"{user.first_name} {user.last_name}".strip(),
                "email": user.email,
                "phone_number": user.phone_number or "",
                "role": user.role.name.capitalize() if user.role else "Unknown",
                "permissions": permissions_list,
                "assignedLocations": assigned_locations,
                "isActive": user.is_active if hasattr(user, "is_active") else True,
                "companyId": user.company_id,
                "createdAt": user.created_at or None,
                "isActive": user.isActive if hasattr(user, "isActive") else True
            })

        locations_payload = []
        for loc in company_locations:
            locations_payload.append({
                "id": loc.id,
                "name": loc.name,
                "city": loc.city or "",
                "state": loc.state or "",
                "postcode": loc.postcode or "",
                "address": loc.address or "",
                "phone": loc.phone or "",
                "email": loc.email or "",
                "companyId": loc.company_id,
                "isActive": True,
                "createdAt": loc.created_at or None,
                "updatedAt": loc.updated_at or None,
                "manager": None  # Optional enhancement: lookup from another model
            })

        response.append({
            "id": company.id,
            "name": company.name,
            "city": getattr(company, "city", company.state),
            "state": company.state,
            "postcode": company.postcode,
            "address": company.address,
            "phone": company.phone,
            "email": company.email,
            "website": company.website,
            "industry": getattr(company, "industry", "Unknown"),
            "isActive": True,
            "createdAt": company.created_at or None,
            "updatedAt": datetime.utcnow(),
            "locations": locations_payload,
            "users": users_payload
        })

    return response


@router.get("/user-details")
def get_user_details(db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_active_user)
                    ):
    print("Current User_id:", current_user.id)
    print("Current User Role:", current_user.role.name if current_user.role else "No Role")

    # No need for additional query - current_user is already loaded from dependency
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user role name
    user_role = current_user.role.name.lower() if current_user.role else None
    
    # Determine which users the current user can access
    accessible_users = []
    
    if user_role == "superuser":
        # Superuser can only see their own details
        accessible_users = [current_user]
        print("Superuser access: Own details only")
        
    elif user_role == "admin":
        # Admin can see users in companies they are associated with
        user_companies = db.query(UserCompany).filter(UserCompany.user_id == current_user.id).all()
        company_ids = [uc.company_id for uc in user_companies]
        
        if company_ids:
            accessible_users = db.query(User).filter(User.company_id.in_(company_ids)).all()
        else:
            accessible_users = [current_user]  # If no companies assigned, show only self
        
        print(f"Admin access: Users in companies {company_ids}")
        
    elif user_role in ["manager", "user"]:
        # Manager/User can only see themselves
        accessible_users = [current_user]
        print(f"Manager/User access: Own details only")
        
    else:
        # Unknown role or no role - deny access
        raise HTTPException(status_code=403, detail="Access denied: Invalid user role")
    
    if not accessible_users:
        return []
    
    # Get permissions for all accessible users
    user_ids = [user.id for user in accessible_users]
    permissions_map = {
        p.user_id: p for p in db.query(Permission).filter(Permission.user_id.in_(user_ids)).all()
    }

    # Get company information for all accessible users
    company_ids = list(set([user.company_id for user in accessible_users if user.company_id]))
    companies_map = {}
    if company_ids:
        companies = db.query(Company).filter(Company.id.in_(company_ids)).all()
        companies_map = {company.id: company for company in companies}

    users_payload = []
    for user in accessible_users:
        user_permission = permissions_map.get(user.id)

        # Get assigned locations for the user (if needed for display)
        user_location_entries = db.query(Store.id, Store.company_id, Store.name).join(
            CompanyLocation, Store.id == CompanyLocation.location_id
        ).join(
            UserCompanyCompanyLocation, CompanyLocation.id == UserCompanyCompanyLocation.company_location_id
        ).filter(
            UserCompanyCompanyLocation.user_id == user.id
        ).all()

        assigned_locations = [
            {
                "location_id": loc_id,
                "company_id": comp_id,
                "location_name": loc_name
            }
            for loc_id, comp_id, loc_name in user_location_entries
        ]

        # Build permissions list
        permissions_list = []
        if user_permission:
            if getattr(user_permission, "upload_excel", False): permissions_list.append("excel_upload")
            if getattr(user_permission, "d1", False): permissions_list.append("sales_split")
            if getattr(user_permission, "d2", False): permissions_list.append("product_mix")
            if getattr(user_permission, "d3", False): permissions_list.append("finance")
            if getattr(user_permission, "d4", False): permissions_list.append("sales_wide")
            if getattr(user_permission, "d5", False): permissions_list.append("orderiq")
            if getattr(user_permission, "d6", False): permissions_list.append("inventoryiq")
            if getattr(user_permission, "d7", False): permissions_list.append("order_flow")

        # Get company name
        company_name = None
        if user.company_id and user.company_id in companies_map:
            company_name = companies_map[user.company_id].name

        users_payload.append({
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}".strip(),
            "email": user.email,
            "phone_number": user.phone_number or "",
            "role": user.role.name.capitalize() if user.role else "Unknown",
            "permissions": permissions_list,
            "assignedLocations": assigned_locations,
            "isActive": user.isActive,
            "companyId": user.company_id,
            "companyName": company_name,
            "createdAt": user.created_at or None
        })

    return users_payload



@router.get("/user-details-dummy/{user_id}")
def get_user_details(user_id: int,
                    db: Session = Depends(get_db),
                    #  current_user: User = Depends(get_current_active_user)
                    ):
    # print("Current User_id:", current_user.id)
    # print("Current User Role:", current_user.role.name if current_user.role else "No Role")

    # Get the user from URL parameter instead of hardcoded value
    current_user = db.query(User).filter(User.id == user_id).first()
    
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user role name
    user_role = "superuser"  # For testing purposes, set to superuser
    # user_role = current_user.role.name.lower() if current_user.role else None
    
    # Determine which users the current user can access
    accessible_users = []
    
    if user_role == "superuser":
        # Superuser can only see their own details
        accessible_users = [current_user]
        print("Superuser access: Own details only")
        
    elif user_role == "admin":
        # Admin can see users in companies they are associated with
        user_companies = db.query(UserCompany).filter(UserCompany.user_id == current_user.id).all()
        company_ids = [uc.company_id for uc in user_companies]
        
        if company_ids:
            accessible_users = db.query(User).filter(User.company_id.in_(company_ids)).all()
        else:
            accessible_users = [current_user]  # If no companies assigned, show only self
        
        print(f"Admin access: Users in companies {company_ids}")
        
    elif user_role in ["manager", "user"]:
        # Manager/User can only see themselves
        accessible_users = [current_user]
        print(f"Manager/User access: Own details only")
        
    else:
        # Unknown role or no role - deny access
        raise HTTPException(status_code=403, detail="Access denied: Invalid user role")
    
    if not accessible_users:
        return []
    
    # Get permissions for all accessible users
    user_ids = [user.id for user in accessible_users]
    permissions_map = {
        p.user_id: p for p in db.query(Permission).filter(Permission.user_id.in_(user_ids)).all()
    }

    # Get company information for all accessible users
    company_ids = list(set([user.company_id for user in accessible_users if user.company_id]))
    companies_map = {}
    if company_ids:
        companies = db.query(Company).filter(Company.id.in_(company_ids)).all()
        companies_map = {company.id: company for company in companies}

    users_payload = []
    for user in accessible_users:
        user_permission = permissions_map.get(user.id)

        # Get assigned locations for the user (if needed for display)
        user_location_entries = db.query(Store.id, Store.company_id, Store.name).join(
            CompanyLocation, Store.id == CompanyLocation.location_id
        ).join(
            UserCompanyCompanyLocation, CompanyLocation.id == UserCompanyCompanyLocation.company_location_id
        ).filter(
            UserCompanyCompanyLocation.user_id == user.id
        ).all()

        assigned_locations = [
            {
                "location_id": loc_id,
                "company_id": comp_id,
                "location_name": loc_name
            }
            for loc_id, comp_id, loc_name in user_location_entries
        ]

        # Build permissions list
        permissions_list = []
        if user_permission:
            if getattr(user_permission, "upload_excel", False): permissions_list.append("excel_upload")
            if getattr(user_permission, "d1", False): permissions_list.append("sales_split")
            if getattr(user_permission, "d2", False): permissions_list.append("product_mix")
            if getattr(user_permission, "d3", False): permissions_list.append("finance")
            if getattr(user_permission, "d4", False): permissions_list.append("sales_wide")
            if getattr(user_permission, "d5", False): permissions_list.append("orderiq")
            if getattr(user_permission, "d6", False): permissions_list.append("inventoryiq")
            if getattr(user_permission, "d7", False): permissions_list.append("order_flow")

        # Get company name
        company_name = None
        if user.company_id and user.company_id in companies_map:
            company_name = companies_map[user.company_id].name

        users_payload.append({
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}".strip(),
            "email": user.email,
            "phone_number": user.phone_number or "",
            "role": user.role.name.capitalize() if user.role else "Unknown",
            "permissions": permissions_list,
            "assignedLocations": assigned_locations,
            "isActive": user.isActive,
            "companyId": user.company_id,
            "companyName": company_name,
            "createdAt": user.created_at or None
        })

    return users_payload


