from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.companies import Company
from models.locations import Store
from models.users import User
from models.permissions import Permission
from models.user_company import UserCompany
from datetime import datetime

router = APIRouter(
    prefix="/company-overview",
    tags=["Company Overview"]
)

@router.get("/")
def get_company_overview(db: Session = Depends(get_db)):
    companies = db.query(Company).all()
    response = []

    for company in companies:
        company_users = db.query(User).filter(User.company_id == company.id).all()
        company_locations = db.query(Store).filter(Store.company_id == company.id).all()
        user_company_map = db.query(UserCompany).filter(UserCompany.company_id == company.id).all()
        permissions_map = {
            p.user_id: p for p in db.query(Permission).filter(Permission.company_id == company.id).all()
        }

        users_payload = []
        for user in company_users:
            user_permission = permissions_map.get(user.id)

            # Assigned locations based on mapping
            assigned_locations = [
                f"{str(company.id)}-{location.id}" for location in company_locations
                if user.id in [uc.user_id for uc in user_company_map if uc.company_id == company.id]
            ]

            permissions_list = []
            if user_permission:
                if getattr(user_permission, "upload_excel", False): permissions_list.append("excel_upload")
                if getattr(user_permission, "d1", False): permissions_list.append("sales_split")
                if getattr(user_permission, "d2", False): permissions_list.append("product_mix")
                if getattr(user_permission, "d3", False): permissions_list.append("finance")
                if getattr(user_permission, "d4", False): permissions_list.append("sales_wide")
                if getattr(user_permission, "d5", False): permissions_list.append("user_management")
                if getattr(user_permission, "d6", False): permissions_list.append("location_management")
                if getattr(user_permission, "d7", False): permissions_list.append("reporting")

            users_payload.append({
                "id": user.id,
                "name": f"{user.first_name} {user.last_name}".strip(),
                "email": user.email,
                "role": user.role.name.capitalize() if user.role else "Unknown",
                "permissions": permissions_list,
                "assignedLocations": assigned_locations,
                "isActive": user.is_active if hasattr(user, "is_active") else True,
                "companyId": user.company_id,
                "createdAt": user.created_at or None,
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
            "city": getattr(company, "city", company.state),  # fallback
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
