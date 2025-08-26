from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud import company_locations as cl_crud
from schemas.company_locations import CompanyLocation, CompanyLocationCreate, CompanyWithLocations
from models.users import User
from dependencies.auth import get_current_active_user

router = APIRouter(
    prefix="/company-locations",
    tags=["CompanyLocations"]
)

@router.post("/", response_model=CompanyLocation)
def create_company_location(data: CompanyLocationCreate, db: Session = Depends(get_db)):
    return cl_crud.create_company_location(db, data)

@router.get("/", response_model=list[CompanyLocation])
def get_all_company_locations(db: Session = Depends(get_db)):
    return cl_crud.get_company_locations(db)

@router.get("/all", response_model=list[CompanyWithLocations])
def get_companies_with_locations(db: Session = Depends(get_db)):
    """Get all companies with their associated locations in nested format"""
    return cl_crud.get_companies_with_locations(db)



# @router.get("/all", response_model=list[CompanyWithLocations])
# def get_companies_with_locations(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_active_user)
# ):
#     """
#     Get companies with their associated locations in nested format.
#     Access control applied based on user role:
#     - Superuser: All companies and locations
#     - Admin: Companies they're associated with and all locations for those companies  
#     - Manager/User: Their own company and only assigned locations
#     """
#     return cl_crud.get_companies_with_locations(db, current_user)


@router.get("/{record_id}", response_model=CompanyLocation)
def get_company_location(record_id: int, db: Session = Depends(get_db)):
    entry = cl_crud.get_company_location(db, record_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Company-Location mapping not found")
    return entry

@router.delete("/{record_id}")
def delete_company_location(record_id: int, db: Session = Depends(get_db)):
    success = cl_crud.delete_company_location(db, record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Company-Location mapping not found")
    return {"detail": "Mapping deleted successfully"}