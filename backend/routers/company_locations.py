from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud import company_locations as cl_crud
from schemas.company_locations import CompanyLocation, CompanyLocationCreate

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
