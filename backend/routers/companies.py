# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from crud import companies as company_crud
# from schemas import companies as company_schema
# from database import get_db

# router = APIRouter(
#     prefix="/companies",
#     tags=["Companies"],
# )

# @router.post("/", response_model=company_schema.Company)
# def create_company(company: company_schema.CompanyCreate, db: Session = Depends(get_db)):
#     return company_crud.create_company(db, company)

# @router.get("/", response_model=list[company_schema.Company])
# def get_companies(db: Session = Depends(get_db)):
#     return company_crud.get_companies(db)

# @router.get("/{company_id}", response_model=company_schema.Company)
# def get_company(company_id: int, db: Session = Depends(get_db)):  # CHANGED
#     company = company_crud.get_company(db, company_id)
#     if not company:
#         raise HTTPException(status_code=404, detail="Company not found")
#     return company

# @router.put("/{company_id}", response_model=company_schema.Company)
# def update_company(company_id: int, company: company_schema.CompanyCreate, db: Session = Depends(get_db)):  # CHANGED
#     updated = company_crud.update_company(db, company_id, company)
#     if not updated:
#         raise HTTPException(status_code=404, detail="Company not found")
#     return updated

# @router.delete("/{company_id}")
# def delete_company(company_id: int, db: Session = Depends(get_db)):  # CHANGED
#     success = company_crud.delete_company(db, company_id)
#     if not success:
#         raise HTTPException(status_code=404, detail="Company not found")
#     return {"detail": "Company deleted successfully"}



# 4. ENHANCED ROUTER (routers/companies.py)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from crud import companies as company_crud
from schemas import companies as company_schema
from database import get_db
import traceback

router = APIRouter(
    prefix="/companies",
    tags=["Companies"],
)

@router.post("/", response_model=company_schema.Company)
def create_company(company: company_schema.CompanyCreate, db: Session = Depends(get_db)):
    try:
        print("Received company creation request:", company.model_dump())
        
        # Validate required fields
        if not company.name or not company.name.strip():
            raise HTTPException(status_code=400, detail="Company name is required")
        if not company.address or not company.address.strip():
            raise HTTPException(status_code=400, detail="Company address is required")
        if not company.state or not company.state.strip():
            raise HTTPException(status_code=400, detail="Company state is required")
        if not company.postcode or not company.postcode.strip():
            raise HTTPException(status_code=400, detail="Company postcode is required")
        if not company.phone_number or not company.phone_number.strip():
            raise HTTPException(status_code=400, detail="Company phone number is required")
        
        created_company = company_crud.create_company(db, company)
        print("Company created successfully with ID:", created_company.id)
        return created_company
        
    except HTTPException:
        raise
    except Exception as e:
        print("Unexpected error creating company:", str(e))
        print("Traceback:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to create company: {str(e)}")

@router.get("/", response_model=list[company_schema.Company])
def get_companies(db: Session = Depends(get_db)):
    try:
        return company_crud.get_companies(db)
    except Exception as e:
        print("Error getting companies:", str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch companies")

@router.get("/{company_id}", response_model=company_schema.Company)
def get_company(company_id: int, db: Session = Depends(get_db)):
    try:
        company = company_crud.get_company(db, company_id)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        return company
    except HTTPException:
        raise
    except Exception as e:
        print("Error getting company:", str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch company")

@router.put("/{company_id}", response_model=company_schema.Company)
def update_company(company_id: int, company: company_schema.CompanyCreate, db: Session = Depends(get_db)):
    try:
        updated = company_crud.update_company(db, company_id, company)
        if not updated:
            raise HTTPException(status_code=404, detail="Company not found")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        print("Error updating company:", str(e))
        raise HTTPException(status_code=500, detail="Failed to update company")

@router.delete("/{company_id}")
def delete_company(company_id: int, db: Session = Depends(get_db)):
    try:
        success = company_crud.delete_company(db, company_id)
        if not success:
            raise HTTPException(status_code=404, detail="Company not found")
        return {"detail": "Company deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print("Error deleting company:", str(e))
        raise HTTPException(status_code=500, detail="Failed to delete company")