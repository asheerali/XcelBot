from sqlalchemy.orm import Session
from models.master_file import MasterFile
from schemas.master_file import MasterFileCreate
from typing import List, Optional
from sqlalchemy.orm.attributes import flag_modified

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

# def update_masterfile(db: Session, masterfile_id: int, file_data: dict):
#     """Update file_data for an existing masterfile record"""
#     db_obj = db.query(MasterFile).filter(MasterFile.id == masterfile_id).first()
#     if db_obj:
#         db_obj.file_data = file_data
#         db.commit()
#         db.refresh(db_obj)
#         return db_obj
#     return None



def update_masterfile(db: Session, masterfile_id: int, file_data: dict):
    """Update file_data for an existing masterfile record"""
    try:
        db_obj = db.query(MasterFile).filter(MasterFile.id == masterfile_id).first()
        if db_obj:
            print(f"Found masterfile object with ID: {masterfile_id}")
            print(f"Current file_data keys: {list(db_obj.file_data.keys()) if db_obj.file_data else 'None'}")
            
            # Update the file_data
            db_obj.file_data = file_data
            
            # Mark the object as dirty (important for JSON fields)
            from sqlalchemy.orm.attributes import flag_modified
            flag_modified(db_obj, "file_data")
            
            print(f"Updated file_data keys: {list(file_data.keys())}")
            
            # Commit the changes
            db.commit()
            print("Database commit successful")
            
            # Refresh the object to get the latest state
            db.refresh(db_obj)
            print("Object refresh successful")
            
            return db_obj
        else:
            print(f"No masterfile found with ID: {masterfile_id}")
            return None
            
    except Exception as e:
        print(f"Error in update_masterfile: {str(e)}")
        db.rollback()  # Rollback on error
        raise e

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