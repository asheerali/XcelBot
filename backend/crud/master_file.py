from sqlalchemy.orm import Session
from models.master_file import MasterFile
from schemas.master_file import MasterFileCreate
from typing import List, Optional

def create_masterfile(db: Session, obj_in: MasterFileCreate):
    """Create a new masterfile record"""
    db_obj = MasterFile(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_masterfile(db: Session, masterfile_id: int):
    """Get a masterfile record by ID"""
    return db.query(MasterFile).filter(MasterFile.id == masterfile_id).first()

def get_all_masterfiles(db: Session, skip: int = 0, limit: int = 100):
    """Get all masterfile records with pagination"""
    return db.query(MasterFile).offset(skip).limit(limit).all()

def get_masterfile_by_company(db: Session, company_id: int, skip: int = 0, limit: int = 100):
    """Get masterfile records by company ID with pagination"""
    return db.query(MasterFile).filter(MasterFile.company_id == company_id).offset(skip).limit(limit).all()

def get_masterfile_by_filename(db: Session, company_id: int, filename: str):
    """Get a masterfile record by company ID and filename"""
    return db.query(MasterFile).filter(
        MasterFile.company_id == company_id,
        MasterFile.filename == filename
    ).first()

def update_masterfile(db: Session, masterfile_id: int, file_data: dict):
    """Update file_data for an existing masterfile record"""
    db_obj = db.query(MasterFile).filter(MasterFile.id == masterfile_id).first()
    if db_obj:
        db_obj.file_data = file_data
        db.commit()
        db.refresh(db_obj)
        return db_obj
    return None

def delete_masterfile(db: Session, masterfile_id: int):
    """Delete a masterfile record"""
    db_obj = db.query(MasterFile).filter(MasterFile.id == masterfile_id).first()
    if db_obj:
        db.delete(db_obj)
        db.commit()
        return True
    return False

def bulk_create_masterfile(db: Session, objects: List[MasterFileCreate]):
    """Bulk create multiple masterfile records"""
    db_objects = [MasterFile(**obj.dict()) for obj in objects]
    db.add_all(db_objects)
    db.commit()
    for obj in db_objects:
        db.refresh(obj)
    return db_objects



# crud/master_file.py - Add this new function
def get_masterfile_by_filename_and_location(db: Session, company_id: int, location_id: int, filename: str):
    """Get a masterfile record by company ID, location ID, and filename"""
    return db.query(MasterFile).filter(
        MasterFile.company_id == company_id,
        MasterFile.location_id == location_id,
        MasterFile.filename == filename
    ).first()

# Update existing functions to include location_id
def get_masterfile_by_location(db: Session, location_id: int, skip: int = 0, limit: int = 100):
    """Get masterfile records by location ID with pagination"""
    return db.query(MasterFile).filter(MasterFile.location_id == location_id).offset(skip).limit(limit).all()