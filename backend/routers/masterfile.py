from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from schemas.master_file import MasterFileCreate, MasterFile
from crud import master_file as masterfile_crud
from database import get_db
from dependencies.auth import get_current_active_user
from models.users import User
import base64
import json
from typing import List

router = APIRouter(
    prefix="/api/masterfile",
    tags=["Master Files"]
)

@router.post("/", response_model=MasterFile)
def create_masterfile_record(
    file_data: MasterFileCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new masterfile record"""
    try:
        return masterfile_crud.create_masterfile(db, file_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating masterfile record: {str(e)}")

@router.get("/company/{company_id}", response_model=List[MasterFile])
def get_company_masterfiles(
    company_id: int, 
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all masterfiles for a company"""
    return masterfile_crud.get_masterfile_by_company(db, company_id, skip, limit)

@router.get("/{masterfile_id}", response_model=MasterFile)
def get_masterfile_by_id(
    masterfile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific masterfile by ID"""
    masterfile = masterfile_crud.get_masterfile(db, masterfile_id)
    if not masterfile:
        raise HTTPException(status_code=404, detail="Masterfile not found")
    return masterfile

@router.get("/company/{company_id}/filename/{filename}", response_model=MasterFile)
def get_masterfile_by_filename(
    company_id: int,
    filename: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a masterfile by company ID and filename"""
    masterfile = masterfile_crud.get_masterfile_by_filename(db, company_id, filename)
    if not masterfile:
        raise HTTPException(status_code=404, detail="Masterfile not found")
    return masterfile

@router.put("/{masterfile_id}", response_model=MasterFile)
def update_masterfile_data(
    masterfile_id: int,
    file_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update file_data for an existing masterfile"""
    masterfile = masterfile_crud.update_masterfile(db, masterfile_id, file_data)
    if not masterfile:
        raise HTTPException(status_code=404, detail="Masterfile not found")
    return masterfile

@router.delete("/{masterfile_id}")
def delete_masterfile_record(
    masterfile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a masterfile record"""
    masterfile = masterfile_crud.delete_masterfile(db, masterfile_id)
    if not masterfile:
        raise HTTPException(status_code=404, detail="Masterfile not found")
    return {"message": "Masterfile deleted successfully"}

@router.post("/bulk", response_model=List[MasterFile])
def bulk_create_masterfiles(
    masterfiles: List[MasterFileCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Bulk create multiple masterfile records"""
    try:
        return masterfile_crud.bulk_create_masterfile(db, masterfiles)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating masterfile records: {str(e)}")