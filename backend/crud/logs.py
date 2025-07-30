# crud/logs.py
from sqlalchemy.orm import Session
from models.logs import Logs
from schemas.logs import LogsCreate
from typing import List, Optional
from sqlalchemy.orm.attributes import flag_modified

def create_logs(db: Session, obj_in: LogsCreate):
    """Create a new logs record"""
    # Convert Pydantic model to dict, created_at will be auto-set by SQLAlchemy default
    obj_data = obj_in.dict(exclude_unset=True)
    # Remove created_at if it's None to let SQLAlchemy handle the default
    if 'created_at' in obj_data and obj_data['created_at'] is None:
        del obj_data['created_at']
    
    db_obj = Logs(**obj_data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_logs(db: Session, logs_id: int):
    """Get a logs record by ID"""
    return db.query(Logs).filter(Logs.id == logs_id).first()

def get_all_logs(db: Session, skip: int = 0, limit: int = 100):
    """Get all logs records with pagination"""
    return db.query(Logs).offset(skip).limit(limit).all()

def get_logs_by_company(db: Session, company_id: int, skip: int = 0, limit: int = 100):
    """Get logs records by company ID with pagination"""
    return db.query(Logs).filter(Logs.company_id == company_id).offset(skip).limit(limit).all()

def get_logs_by_location(db: Session, location_id: int, skip: int = 0, limit: int = 100):
    """Get logs records by location ID with pagination"""
    return db.query(Logs).filter(Logs.location_id == location_id).offset(skip).limit(limit).all()

def get_logs_by_filename(db: Session, company_id: int, filename: str):
    """Get a logs record by company ID and filename"""
    return db.query(Logs).filter(
        Logs.company_id == company_id,
        Logs.filename == filename
    ).first()

def get_logs_by_filename_and_location(db: Session, company_id: int, location_id: int, filename: str):
    """Get a logs record by company ID, location ID, and filename"""
    return db.query(Logs).filter(
        Logs.company_id == company_id,
        Logs.location_id == location_id,
        Logs.filename == filename
    ).first()

def update_logs(db: Session, logs_id: int, file_data: dict):
    """Update file_data for an existing logs record"""
    try:
        db_obj = db.query(Logs).filter(Logs.id == logs_id).first()
        if db_obj:
            print(f"Found logs object with ID: {logs_id}")
            print(f"Current file_data keys: {list(db_obj.file_data.keys()) if db_obj.file_data else 'None'}")
            
            # Update the file_data
            db_obj.file_data = file_data
            
            # Mark the object as dirty (important for JSON fields)
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
            print(f"No logs found with ID: {logs_id}")
            return None
            
    except Exception as e:
        print(f"Error in update_logs: {str(e)}")
        db.rollback()  # Rollback on error
        raise e

def delete_logs(db: Session, logs_id: int):
    """Delete a logs record"""
    db_obj = db.query(Logs).filter(Logs.id == logs_id).first()
    if db_obj:
        db.delete(db_obj)
        db.commit()
        return True
    return False

def bulk_create_logs(db: Session, objects: List[LogsCreate]):
    """Bulk create multiple logs records"""
    db_objects = []
    for obj in objects:
        obj_data = obj.dict(exclude_unset=True)
        # Remove created_at if it's None to let SQLAlchemy handle the default
        if 'created_at' in obj_data and obj_data['created_at'] is None:
            del obj_data['created_at']
        db_objects.append(Logs(**obj_data))
    
    db.add_all(db_objects)
    db.commit()
    for obj in db_objects:
        db.refresh(obj)
    return db_objects