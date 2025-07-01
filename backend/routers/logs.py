# routers/logs.py
import datetime
import traceback
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.locations import Store
from models.companies import Company
from crud import logs as logs_crud
from schemas import logs as logs_schema
from database import get_db
import pandas as pd
from crud.locations import get_store
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter(
    prefix="/api/logs",
    tags=["Logs"]
)

class UpdateLogsRequest(BaseModel):
    company_id: int
    location_id: int
    filename: str
    row_data: Dict[str, Any]

@router.get("/details")
def get_logs_details_alt(db: Session = Depends(get_db)):
    """Get details of all logs with company and location info"""
    try:
        logs = logs_crud.get_all_logs(db)
        
        if not logs:
            return {"message": "Database is empty", "data": []}
        
        # Get all unique company and location IDs
        company_ids = list(set(log.company_id for log in logs if log.company_id))
        location_ids = list(set(log.location_id for log in logs if log.location_id))
        
        # Fetch companies and locations in batch
        companies = db.query(Company).filter(Company.id.in_(company_ids)).all()
        locations = db.query(Store).filter(Store.id.in_(location_ids)).all()

        # Create lookup dictionaries
        company_lookup = {comp.id: comp.name for comp in companies}
        location_lookup = {loc.id: loc.name for loc in locations}
        
        details = []
        for log in logs:
            # Format datetime for display
            readable_date = log.created_at.strftime('%Y-%m-%d %H:%M:%S') if log.created_at else "Unknown"
            
            details.append({
                "id": log.id,
                "company_id": log.company_id,
                "company_name": company_lookup.get(log.company_id, "Unknown"),
                "filename": log.filename,
                "location_id": log.location_id,
                "location_name": location_lookup.get(log.location_id, "Unknown"),
                "created_at": log.created_at.isoformat() if log.created_at else None,
                "created_at_readable": readable_date,
                "file_data": log.file_data,
            })

        return {"message": "Logs details fetched successfully", "data": details}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching logs details: {str(e)}")

@router.get("/details/{company_id}/{location_id}/{filename}")
def get_logs_details(
    company_id: int, 
    location_id: int, 
    filename: str, 
    db: Session = Depends(get_db)
):
    """Get logs details by company ID, location ID, and filename"""
    
    # Get the logs
    logs = logs_crud.get_logs_by_filename_and_location(db, company_id, location_id, filename)
    
    if not logs:
        return {"message": "Logs not found", "data": []}
    
    # Check if file_data exists and has data
    if not logs.file_data or 'data' not in logs.file_data or not logs.file_data['data']:
        return {"message": "No data found in this logs", "data": []}
    
    # Convert file_data to DataFrame
    df = pd.DataFrame(logs.file_data['data'])
    
    columns_dict = {f"column{i}": col for i, col in enumerate(df.columns)}    
    
    # Create a copy of DataFrame with renamed columns
    df_copy = df.copy()
    df_copy.columns = [f"column{i}" for i in range(len(df.columns))]    
    
    # Check if DataFrame is empty
    if df.empty:
        return {"message": "Empty dataset found in logs", "data": []}
    
    data = {
        "totalColumns": len(df.columns),
        "columns": columns_dict,
        "dataframe": df_copy.to_dict(orient='records'),
        "created_at": logs.created_at.isoformat() if logs.created_at else None,
        "created_at_readable": logs.created_at.strftime('%Y-%m-%d %H:%M:%S') if logs.created_at else "Unknown",
    }
    
    return {"data": data}

@router.put("/updatelocation/{company_id}/{location_id}/{filename}/{new_location_id}", response_model=logs_schema.Logs)
def update_logs_location(
    company_id: int,
    location_id: int,  # current location_id to find the record
    filename: str,
    new_location_id: int,  # new location_id to update to
    db: Session = Depends(get_db)
):
    """Update a logs location by company ID, location ID, and filename"""
    
    # First, find the existing logs
    logs = logs_crud.get_logs_by_filename_and_location(db, company_id, location_id, filename)
    if not logs:
        raise HTTPException(status_code=404, detail="Logs not found")
    
    # Validate that the new location belongs to the specified company
    new_location = get_store(db, new_location_id)
    if not new_location:
        raise HTTPException(status_code=404, detail="New location not found")
    
    if new_location.company_id != company_id:
        raise HTTPException(
            status_code=400, 
            detail="New location does not belong to the specified company"
        )
    
    # Update the location_id to the new value
    logs.location_id = new_location_id
    db.commit()
    db.refresh(logs)
    return logs

@router.post("/updatefile")
def update_logs_file(
    request: UpdateLogsRequest,
    db: Session = Depends(get_db)
):
    """Update a logs file row"""
    
    print("Received request to update logs:", request)
    try:
        # First, find the existing logs
        logs = logs_crud.get_logs_by_filename_and_location(
            db, request.company_id, request.location_id, request.filename
        )
        if not logs:
            raise HTTPException(status_code=404, detail="Logs not found")

        print("Found logs, processing update...")
        
        # Convert stored data back to DataFrame
        df = pd.DataFrame(logs.file_data['data'])
        print("Current DataFrame shape:", df.shape)
        print("DataFrame columns:", df.columns.tolist())
        
        # Get row data from the request
        row_data = request.row_data
        print("Row data to match:", row_data)
        
        # Create boolean mask for matching rows using all columns except price-related ones
        mask = pd.Series([True] * len(df))
        exclude_columns = ["Current Price","Previous Price"]
        
        for col in row_data.keys():
            if col not in exclude_columns and col in df.columns:
                mask = mask & (df[col] == row_data[col])
        
        # Find matching rows
        matching_rows = df[mask]
        
        if matching_rows.empty:
            print("No matching rows found")
            return {"status": "error", "message": "No matching rows found"}
        
        print(f"Found {len(matching_rows)} matching row(s)")
        
        # Update the matching rows
        if 'Current Price' in df.columns:
            df.loc[mask, 'Previous Price'] = df.loc[mask, 'Current Price']
            df.loc[mask, 'Current Price'] = row_data['Current Price']
        
        print("Updated rows:")
        print(df[mask][['Category', 'Products', 'Current Price', 'Previous Price']])

        # Convert DataFrame back to JSON format for database storage
        df_json = df.to_dict('records')
        
        # Handle any datetime/timestamp conversions and NaN values
        for record in df_json:
            for key, value in record.items():
                if pd.isna(value):
                    record[key] = None
                elif isinstance(value, (pd.Timestamp, datetime.datetime, datetime.date)):
                    record[key] = value.isoformat() if value else None
                elif isinstance(value, (int, float)) and pd.isna(value):
                    record[key] = None
        
        # Update the file_data structure
        updated_file_data = {
            "upload_date": logs.file_data.get('upload_date'),
            "updated_at": datetime.datetime.now().isoformat(),
            "user_id": logs.file_data.get('user_id'),
            "location_id": logs.file_data.get('location_id'),
            "location_name": logs.file_data.get('location_name'),
            "total_rows": len(df),
            "columns": df.columns.tolist(),
            "data": df_json
        }
        
        # Update the database record
        updated_logs = logs_crud.update_logs(
            db, logs.id, updated_file_data
        )
        
        if updated_logs:
            print("Successfully updated logs in database")
            return {
                "status": "success", 
                "message": f"Updated {len(matching_rows)} row(s)",
                "updated_rows": len(matching_rows),
                "updated_at": updated_file_data['updated_at'],
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to update database")
        
    except Exception as e:
        print(f"Error in update_logs_file: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error updating logs: {str(e)}")

@router.post("/", response_model=logs_schema.Logs)
def create_logs(logs: logs_schema.LogsCreate, db: Session = Depends(get_db)):
    """Create a new logs record"""
    return logs_crud.create_logs(db, logs)

@router.get("/", response_model=list[logs_schema.Logs])
def get_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all logs with pagination"""
    logs = logs_crud.get_all_logs(db, skip, limit)
    print("i am here in logs printing the logs db " , logs)
    
    # Print the actual data
    for log in logs:
        print(f"ID: {log.id}")
        print(f"Company ID: {log.company_id}")
        print(f"Filename: {log.filename}")
        df_construction = pd.DataFrame(log.file_data['data'])
        print(f"DataFrame Construction: {df_construction}")
        print("---")
    return logs

@router.get("/{logs_id}", response_model=logs_schema.Logs)
def get_logs_by_id(logs_id: int, db: Session = Depends(get_db)):
    """Get a specific logs by ID"""
    logs = logs_crud.get_logs(db, logs_id)
    print("i am here in logs printing the logs file" , logs)
    if not logs:
        raise HTTPException(status_code=404, detail="Logs not found")
    return logs

@router.get("/{logs_id}/items")
def get_logs_items(logs_id: int, db: Session = Depends(get_db)):
    """Get JSON data from a logs as dict"""
    logs = logs_crud.get_logs(db, logs_id)
    if not logs:
        raise HTTPException(status_code=404, detail="Logs not found")
    return logs.file_data

@router.get("/company/{company_id}", response_model=list[logs_schema.Logs])
def get_company_logs(
    company_id: int, 
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all logs for a company"""
    return logs_crud.get_logs_by_company(db, company_id, skip, limit)

@router.get("/location/{location_id}", response_model=list[logs_schema.Logs])
def get_location_logs(
    location_id: int, 
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all logs for a location"""
    return logs_crud.get_logs_by_location(db, location_id, skip, limit)

@router.get("/company/{company_id}/filename/{filename}", response_model=logs_schema.Logs)
def get_logs_by_filename(
    company_id: int,
    filename: str,
    db: Session = Depends(get_db)
):
    """Get a logs by company ID and filename"""
    logs = logs_crud.get_logs_by_filename(db, company_id, filename)
    if not logs:
        raise HTTPException(status_code=404, detail="Logs not found")
    return logs

@router.put("/{logs_id}", response_model=logs_schema.Logs)
def update_logs(logs_id: int, file_data: dict, db: Session = Depends(get_db)):
    """Update file_data for an existing logs"""
    updated = logs_crud.update_logs(db, logs_id, file_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Logs not found")
    return updated

@router.delete("/{logs_id}")
def delete_logs(logs_id: int, db: Session = Depends(get_db)):
    """Delete a logs record"""
    success = logs_crud.delete_logs(db, logs_id)
    if not success:
        raise HTTPException(status_code=404, detail="Logs not found")
    return {"detail": "Logs deleted successfully"}

@router.post("/bulk", response_model=list[logs_schema.Logs])
def bulk_create_logs(logs: list[logs_schema.LogsCreate], db: Session = Depends(get_db)):
    """Bulk create multiple logs records"""
    return logs_crud.bulk_create_logs(db, logs)

@router.get("/dataframe")
def get_logs_as_dataframe(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all logs data as DataFrame format"""
    logs = logs_crud.get_all_logs(db, skip, limit)
    
    if not logs:
        return {"message": "No logs found", "data": []}
    
    # Combine all logs data into a single DataFrame
    all_data = []
    for log in logs:
        file_data = log.file_data
        if 'data' in file_data and file_data['data']:
            # Add metadata columns to each row
            for row in file_data['data']:
                row_with_metadata = row.copy()
                row_with_metadata['logs_id'] = log.id
                row_with_metadata['filename'] = log.filename
                row_with_metadata['company_id'] = log.company_id
                row_with_metadata['location_id'] = log.location_id
                row_with_metadata['created_at'] = log.created_at.isoformat() if log.created_at else None
                row_with_metadata['created_at_readable'] = log.created_at.strftime('%Y-%m-%d %H:%M:%S') if log.created_at else "Unknown"
                all_data.append(row_with_metadata)
    
    if not all_data:
        return {"message": "No data found in logs", "data": []}
    
    # Create DataFrame
    df = pd.DataFrame(all_data)
    
    # Print DataFrame info
    print("DataFrame Shape:", df.shape)
    print("DataFrame Columns:", df.columns.tolist())
    print("DataFrame Head:")
    print(df.head())
    print("DataFrame Info:")
    print(df.info())
    
    # Return DataFrame as JSON
    return {
        "shape": df.shape,
        "columns": df.columns.tolist(),
        "data": df.to_dict('records'),
        "info": {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "dtypes": df.dtypes.astype(str).to_dict()
        }
    }

@router.get("/{logs_id}/dataframe")
def get_single_logs_as_dataframe(logs_id: int, db: Session = Depends(get_db)):
    """Get a specific logs data as DataFrame format"""
    logs = logs_crud.get_logs(db, logs_id)
    if not logs:
        raise HTTPException(status_code=404, detail="Logs not found")
    
    file_data = logs.file_data
    if 'data' not in file_data or not file_data['data']:
        return {"message": "No data found in this logs", "data": []}
    
    # Create DataFrame from the data
    df = pd.DataFrame(file_data['data'])
    
    # Print DataFrame info
    print(f"Logs {logs_id} DataFrame Shape:", df.shape)
    print("DataFrame Columns:", df.columns.tolist())
    print("DataFrame Head:")
    print(df.head())
    
    return {
        "logs_id": logs_id,
        "filename": logs.filename,
        "created_at": logs.created_at.isoformat() if logs.created_at else None,
        "created_at_readable": logs.created_at.strftime('%Y-%m-%d %H:%M:%S') if logs.created_at else "Unknown",
        "shape": df.shape,
        "columns": df.columns.tolist(),
        "data": df.to_dict('records'),
        "info": {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "original_columns": file_data.get('columns', [])
        }
    }