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



# crud/master_file.py - Add this new function
def get_masterfile_by_company_and_location(db: Session, company_id: int, location_id: int):
    """Get a masterfile record by company ID and location ID"""
    return db.query(MasterFile).filter(
        MasterFile.company_id == company_id,
        MasterFile.location_id == location_id
    ).all()


# Update existing functions to include location_id
def get_masterfile_by_location(db: Session, location_id: int, skip: int = 0, limit: int = 100):
    """Get masterfile records by location ID with pagination"""
    return db.query(MasterFile).filter(MasterFile.location_id == location_id).offset(skip).limit(limit).all()



# Add these new functions to crud/master_file.py:

from sqlalchemy import and_, func
from models.companies import Company
from typing import Dict, Any, List, Optional
from datetime import datetime

# ============================================================================
# DELETION FUNCTIONS
# ============================================================================


def delete_masterfiles_by_location_and_company(db: Session, location_id: int, company_id: int, filename: Optional[str] = None) -> Dict[str, Any]:
    """Delete master file records for a specific location, company, and optionally filename"""
    
    # Build the query with required filters
    query = db.query(MasterFile).filter(
        and_(
            MasterFile.location_id == location_id,
            MasterFile.company_id == company_id
        )
    )
    
    # Add filename filter if provided
    if filename:
        query = query.filter(MasterFile.filename == filename)
    
    # Get the records that will be deleted for logging/response
    records_to_delete = query.all()
    deleted_count = len(records_to_delete)
    
    # Log what's being deleted (optional - remove in production)
    if deleted_count > 0:
        print(f"Deleting {deleted_count} master file records:")
        for record in records_to_delete:
            print(f"  - ID: {record.id}, Location: {record.location_id}, Company: {record.company_id}, File: {record.filename}")
    
    # Perform the deletion
    query.delete(synchronize_session=False)
    db.commit()
    
    return {
        "deleted_count": deleted_count,
        "company_id": company_id,
        "location_id": location_id,
        "filename": filename
    }
    
    
# ============================================================================
# ANALYTICS AND LISTING FUNCTIONS
# ============================================================================

def get_uploaded_masterfiles_list(db: Session, company_id: Optional[int] = None, location_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Get list of all uploaded master files with basic metadata"""
    
    # Build base query with JSON extraction for metadata
    query = db.query(
        MasterFile.id,
        MasterFile.filename,
        MasterFile.location_id,
        MasterFile.company_id,
        Company.name.label('company_name'),
        # Extract metadata from file_data JSON field
        func.json_extract(MasterFile.file_data, '$.total_rows').label('total_rows'),
        func.json_extract(MasterFile.file_data, '$.location_name').label('location_name'),
        func.json_extract(MasterFile.file_data, '$.upload_date').label('upload_date'),
        func.json_extract(MasterFile.file_data, '$.updated_at').label('updated_at'),
        func.json_extract(MasterFile.file_data, '$.user_id').label('user_id')
    ).join(Company, MasterFile.company_id == Company.id) \
     .filter(MasterFile.filename.isnot(None))

    # Apply filters
    if company_id:
        query = query.filter(MasterFile.company_id == company_id)
    
    if location_id:
        query = query.filter(MasterFile.location_id == location_id)

    # Order by upload_date from JSON data (most recent first)
    query = query.order_by(func.json_extract(MasterFile.file_data, '$.upload_date').desc())

    results = []
    for row in query.all():
        results.append({
            "id": row.id,
            "filename": row.filename,
            "location_id": row.location_id,
            "location_name": row.location_name,
            "company_name": row.company_name,
            "company_id": row.company_id,
            "total_rows": int(row.total_rows) if row.total_rows else 0,
            "user_id": int(row.user_id) if row.user_id else None,
            "upload_date": row.upload_date,
            # "updated_at": row.updated_at
            "updated_at": row.updated_at if row.updated_at else "-"
        })
    
    return results


def get_uploaded_masterfiles_list_with_locations(db: Session, company_id: Optional[int] = None, location_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Get list of all uploaded master files with location breakdown"""
    
    query = db.query(
        MasterFile.id,
        MasterFile.filename,
        MasterFile.location_id,
        MasterFile.company_id,
        Company.name.label('company_name'),
        # Extract metadata from file_data JSON field
        func.json_extract(MasterFile.file_data, '$.total_rows').label('total_rows'),
        func.json_extract(MasterFile.file_data, '$.location_name').label('location_name'),
        func.json_extract(MasterFile.file_data, '$.upload_date').label('upload_date'),
        func.json_extract(MasterFile.file_data, '$.updated_at').label('updated_at'),
        func.json_extract(MasterFile.file_data, '$.user_id').label('user_id')
    ).join(Company, MasterFile.company_id == Company.id) \
     .filter(MasterFile.filename.isnot(None))

    if company_id:
        query = query.filter(MasterFile.company_id == company_id)
    
    if location_id:
        query = query.filter(MasterFile.location_id == location_id)

    query = query.order_by(MasterFile.filename, MasterFile.location_id)

    # Group results by filename and company
    files_dict = {}
    for row in query.all():
        file_key = f"{row.filename}_{row.company_id}"
        
        if file_key not in files_dict:
            files_dict[file_key] = {
                "filename": row.filename,
                "company_name": row.company_name,
                "company_id": row.company_id,
                "total_files": 0,
                "total_rows": 0,
                "earliest_upload": None,
                "latest_update": None,
                "locations": []
            }
        
        # Update file totals
        files_dict[file_key]["total_files"] += 1
        files_dict[file_key]["total_rows"] += int(row.total_rows or 0)
        
        # Update date ranges using dates from JSON
        upload_date = row.upload_date
        update_date = row.updated_at or row.upload_date
        
        if files_dict[file_key]["earliest_upload"] is None or (upload_date and upload_date < files_dict[file_key]["earliest_upload"]):
            files_dict[file_key]["earliest_upload"] = upload_date
        if files_dict[file_key]["latest_update"] is None or (update_date and update_date > files_dict[file_key]["latest_update"]):
            files_dict[file_key]["latest_update"] = update_date
        
        # Add location details
        files_dict[file_key]["locations"].append({
            "id": row.id,
            "location_id": row.location_id,
            "location_name": row.location_name,
            "total_rows": int(row.total_rows or 0),
            "user_id": int(row.user_id) if row.user_id else None,
            "upload_date": row.upload_date,
            # "updated_at": row.updated_at
            "updated_at": row.updated_at if row.updated_at else "-"
        })

    # Convert to list
    results = []
    for file_data in files_dict.values():
        # Sort locations by total_rows (descending)
        file_data["locations"].sort(key=lambda x: x["total_rows"], reverse=True)
        
        results.append(file_data)

    # Sort by latest_update descending
    results.sort(key=lambda x: x["latest_update"] or "", reverse=True)
    
    return results


def get_masterfile_locations_list(db: Session, company_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Get list of all locations with master file counts"""
    
    # Base query with location analytics using JSON dates
    query = db.query(
        MasterFile.location_id,
        Company.name.label('company_name'),
        MasterFile.company_id,
        func.count(MasterFile.id).label('file_count'),
        func.count(func.distinct(MasterFile.filename)).label('unique_filename_count'),
        # Get earliest and latest dates from JSON data
        func.min(func.json_extract(MasterFile.file_data, '$.upload_date')).label('earliest_upload'),
        func.max(func.json_extract(MasterFile.file_data, '$.updated_at')).label('latest_update'),
        # Get a sample location name from the JSON data
        func.json_extract(func.max(MasterFile.file_data), '$.location_name').label('location_name')
    ).join(Company, MasterFile.company_id == Company.id) \
     .filter(MasterFile.location_id.isnot(None))
    
    if company_id:
        query = query.filter(MasterFile.company_id == company_id)
    
    query = query.group_by(
        MasterFile.location_id,
        MasterFile.company_id,
        Company.name
    ).order_by(MasterFile.location_id)
    
    results = []
    for row in query.all():
        results.append({
            "location_id": row.location_id,
            "location_name": row.location_name,
            "company_name": row.company_name,
            "company_id": row.company_id,
            "file_count": row.file_count,
            "unique_filename_count": row.unique_filename_count,
            "earliest_upload": row.earliest_upload,
            "latest_update": row.latest_update
        })
    
    return results


def get_masterfile_companies_list(db: Session, location_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Get list of all companies with master file counts"""
    query = db.query(
        MasterFile.company_id,
        Company.name.label('company_name'),
        func.count(MasterFile.id).label('file_count'),
        func.count(func.distinct(MasterFile.filename)).label('unique_filename_count'),
        func.count(func.distinct(MasterFile.location_id)).label('location_count'),
        # Get earliest and latest dates from JSON data
        func.min(func.json_extract(MasterFile.file_data, '$.upload_date')).label('earliest_upload'),
        func.max(func.json_extract(MasterFile.file_data, '$.updated_at')).label('latest_update')
    ).join(Company, MasterFile.company_id == Company.id)
    
    if location_id:
        query = query.filter(MasterFile.location_id == location_id)
    
    query = query.group_by(
        MasterFile.company_id,
        Company.name
    ).order_by(Company.name)
    
    results = []
    for row in query.all():
        results.append({
            "company_id": row.company_id,
            "company_name": row.company_name,
            "file_count": row.file_count,
            "unique_filename_count": row.unique_filename_count,
            "location_count": row.location_count,
            "earliest_upload": row.earliest_upload,
            "latest_update": row.latest_update
        })
    
    return results

