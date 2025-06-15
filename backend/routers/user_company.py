from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud import user_company as crud_user_company
from schemas.user_company import UserCompany, UserCompanyCreate

router = APIRouter(
    prefix="/user-company",
    tags=["UserCompany"]
)

@router.post("/", response_model=UserCompany)
def create_user_company(record: UserCompanyCreate, db: Session = Depends(get_db)):
    return crud_user_company.create_user_company(db, record)

@router.get("/", response_model=list[UserCompany])
def get_all_user_companies(db: Session = Depends(get_db)):
    return crud_user_company.get_all_user_companies(db)

@router.get("/{record_id}", response_model=UserCompany)
def get_user_company(record_id: int, db: Session = Depends(get_db)):
    record = crud_user_company.get_user_company(db, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record

@router.delete("/{record_id}")
def delete_user_company(record_id: int, db: Session = Depends(get_db)):
    success = crud_user_company.delete_user_company(db, record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"detail": "Record deleted successfully"}
