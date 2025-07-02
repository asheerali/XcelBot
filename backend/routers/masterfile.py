import datetime
import traceback
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.locations import Store
from models.companies import Company
from crud import master_file as masterfile_crud
from schemas import master_file as masterfile_schema
from database import get_db
import pandas as pd
from crud.locations import get_store  # Add this import at the top with your other imports


from pydantic import BaseModel
from typing import Dict, Any

class UpdateMasterFileRequest(BaseModel):
    company_id: int
    location_id: int
    filename: str
    
    row_data: Dict[str, Any]

router = APIRouter(
    prefix="/api/masterfile",
    tags=["Master Files"]
)


@router.get("/details")
def get_masterfile_details_alt(db: Session = Depends(get_db)):
    """Get details of all masterfiles with company and location info (alternative approach)"""
    try:
        masterfiles = masterfile_crud.get_all_masterfiles(db)
        
        if not masterfiles:
            return {"message": "Database is empty", "data": []}
        
        # Get all unique company and location IDs
        company_ids = list(set(mf.company_id for mf in masterfiles if mf.company_id))
        location_ids = list(set(mf.location_id for mf in masterfiles if mf.location_id))
        
        # Fetch companies and locations in batch
        companies = db.query(Company).filter(Company.id.in_(company_ids)).all()
        locations = db.query(Store).filter(Store.id.in_(location_ids)).all()

        # Create lookup dictionaries
        company_lookup = {comp.id: comp.name for comp in companies}
        location_lookup = {loc.id: loc.name for loc in locations}
        
        details = []
        for mf in masterfiles:
            details.append({
                "id": mf.id,
                "company_id": mf.company_id,
                "company_name": company_lookup.get(mf.company_id, "Unknown"),
                "filename": mf.filename,
                "location_id": mf.location_id,
                "location_name": location_lookup.get(mf.location_id, "Unknown"),
            })

        return {"message": "Masterfile details fetched successfully", "data": details}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching masterfile details: {str(e)}")



@router.get("/details/{company_id}/{location_id}/{filename}")
def get_masterfile_details(
    company_id: int, 
    location_id: int, 
    filename: str, 
    db: Session = Depends(get_db)
):
    """Get masterfile details by company ID, location ID, and filename"""
    
    # Get the masterfile
    masterfile = masterfile_crud.get_masterfile_by_filename_and_location(db, company_id, location_id, filename)
    
    if not masterfile:
        return {"message": "Masterfile not found", "data": []}
    
    # Check if file_data exists and has data
    if not masterfile.file_data or 'data' not in masterfile.file_data or not masterfile.file_data['data']:
        return {"message": "No data found in this masterfile", "data": []}
    
    # Convert file_data to DataFrame
    df = pd.DataFrame(masterfile.file_data['data'])
    
    # print("i am here in masterfile printing the dataframe","\n" ,df.head())
    # df.columns = df.columns.str.strip()  # Strip whitespace from column names
    columns_dict = {f"column{i}": col for i, col in enumerate(df.columns)}    
    
    # Create a copy of DataFrame with renamed columns
    df_copy = df.copy()
    df_copy.columns = [f"column{i}" for i in range(len(df.columns))]    
    # Check if DataFrame is empty
    if df.empty:
        return {"message": "Empty dataset found in masterfile", "data": []}
    
    data = {
        "totalColumns": len(df.columns),
        "columns": columns_dict,
        "dataframe": df_copy.to_dict(orient='records'),
    }
    
    return {"data": data}        
        


@router.put("/updatelocation/{company_id}/{location_id}/{filename}/{new_location_id}", response_model=masterfile_schema.MasterFile)
def update_masterfile(
    company_id: int,
    location_id: int,  # current location_id to find the record
    filename: str,
    new_location_id: int,  # new location_id to update to
    db: Session = Depends(get_db)
):
    """Update a masterfile by company ID, location ID, and filename"""
    
    # First, find the existing masterfile
    masterfile = masterfile_crud.get_masterfile_by_filename_and_location(db, company_id, location_id, filename)
    if not masterfile:
        raise HTTPException(status_code=404, detail="Masterfile not found")
    
    # Validate that the new location belongs to the specified company
    new_location = get_store(db, new_location_id)  # Using your existing function
    if not new_location:
        raise HTTPException(status_code=404, detail="New location not found")
    
    if new_location.company_id != company_id:
        raise HTTPException(
            status_code=400, 
            detail="New location does not belong to the specified company"
        )
    
    # Update the location_id to the new value
    masterfile.location_id = new_location_id
    db.commit()
    db.refresh(masterfile)
    return masterfile



@router.post("/updatefile")
def update_masterfile(
    request: UpdateMasterFileRequest,
    db: Session = Depends(get_db)
):
    """Update a masterfile row"""
    
    print("Received request to update masterfile:", request)
    try:
        # First, find the existing masterfile
        masterfile = masterfile_crud.get_masterfile_by_filename_and_location(
            db, request.company_id, request.location_id, request.filename
        )
        if not masterfile:
            raise HTTPException(status_code=404, detail="Masterfile not found")

        print("Found masterfile, processing update...")
        
        # Convert stored data back to DataFrame
        df = pd.DataFrame(masterfile.file_data['data'])
        print("Current DataFrame shape:", df.shape)
        print("DataFrame columns:", df.columns.tolist())
        
        # Get row data from the request
        row_data = request.row_data  # This is the data you're already getting
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
        # Set Previous Price to the current Current Price before updating
        if 'Current Price' in df.columns:
            df.loc[mask, 'Previous Price'] = df.loc[mask, 'Current Price']
            # Update Current Price to the new value
            df.loc[mask, 'Current Price'] = row_data['Current Price']
        
        
        print("Updated rows:")
        print(df[mask][['Category', 'Products', 'Current Price', 'Previous Price']])

        print("df after the update...", df.head())
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
            "upload_date": masterfile.file_data.get('upload_date'),  # Keep original upload date
            "updated_at": datetime.datetime.now().isoformat(),  # Add last updated timestamp
            "user_id": masterfile.file_data.get('user_id'),
            "location_id": masterfile.file_data.get('location_id'),
            "location_name": masterfile.file_data.get('location_name'),
            "total_rows": len(df),
            "columns": df.columns.tolist(),
            "data": df_json
        }
        
        # Update the database record
        updated_masterfile = masterfile_crud.update_masterfile(
            db, masterfile.id, updated_file_data
        )
        
        if updated_masterfile:
            print("Successfully updated masterfile in database")
            
            # Save the row data to logs table
            try:
                # Import logs crud at the top of the file
                from crud import logs as logs_crud
                from schemas.logs import LogsCreate
                
                change_delta = row_data["Current Price"] - row_data["Previous Price"]
                # Create log entry with the updated row data
                log_data = {
                    "action": "update_price",
                    "timestamp": datetime.datetime.now().isoformat(),
                    "user_id": masterfile.file_data.get('user_id'),
                    "original_data": row_data,  # The whole row data from request
                    "updated_rows_count": len(matching_rows),
                    "masterfile_id": masterfile.id,
                    "changes": {
                        "previous_price": row_data['Previous Price'],
                        "new_price": row_data['Current Price'],
                        "change_percent": (change_delta / row_data["Previous Price"] * 100) if row_data["Previous Price"] != 0 else 0,
                        "change_delta": change_delta,
                        "change_p_n": "positive" if change_delta > 0 else "negative" if change_delta < 0 else "no_change"
                    }
                    
                }
                
                # Create logs entry
                logs_create = LogsCreate(
                    company_id=request.company_id,
                    location_id=request.location_id,
                    filename=request.filename,
                    file_data=log_data
                    # created_at will be auto-set by the schema default
                )
                
                # Save to logs table
                created_log = logs_crud.create_logs(db, logs_create)
                print(f"Successfully created log entry with ID: {created_log.id}")
                
            except Exception as log_error:
                print(f"Error creating log entry: {str(log_error)}")
                # Don't fail the main operation if logging fails
                
            return {
                "status": "success", 
                "message": f"Updated {len(matching_rows)} row(s)",
                "updated_rows": len(matching_rows),
                "updated_at": updated_file_data['updated_at'],
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to update database")
        
    except Exception as e:
        print(f"Error in update_masterfile: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error updating masterfile: {str(e)}")


@router.get("/availableitems/{company_id}/{location_id}")
def get_masterfile_details(
    company_id: int, 
    location_id: int, 
    db: Session = Depends(get_db)
): 
    """Get masterfile details by company ID, location ID, and filename with merged data"""
    
    # Get the masterfile
    masterfile = masterfile_crud.get_masterfile_by_company_and_location(db, company_id, location_id)
    print("i am here in masterfile printing the masterfile", masterfile)
    
    if not masterfile:
        return {"message": "Masterfile not found", "data": []}
    
    # Process and merge data from all files
    merged_data = []
    seen_products = {}  # Track products by Category + Products combination
    
    for file_entry in masterfile:
        # Access attributes directly from SQLAlchemy model
        if not hasattr(file_entry, 'file_data') or not file_entry.file_data or 'data' not in file_entry.file_data:
            continue
            
        file_data = file_entry.file_data['data']
        upload_date = file_entry.file_data.get('upload_date', '')
        updated_at = file_entry.file_data.get('updated_at', upload_date)
        filename = getattr(file_entry, 'filename', 'unknown')
        
        for item in file_data:
            # Create a unique key based on Category and Products
            product_key = f"{item.get('Category', '')}-{item.get('Products', '')}"
            
            # If this product hasn't been seen before, add it
            if product_key not in seen_products:
                item_copy = item.copy()
                item_copy['_source_file'] = filename
                item_copy['_upload_date'] = upload_date
                item_copy['_updated_at'] = updated_at
                seen_products[product_key] = len(merged_data)
                merged_data.append(item_copy)
            else:
                # Product already exists, check if this version is more recent
                existing_index = seen_products[product_key]
                existing_item = merged_data[existing_index]
                
                # Compare dates to keep the most recent version
                existing_date = existing_item.get('_updated_at', existing_item.get('_upload_date', ''))
                current_date = updated_at
                
                if current_date > existing_date:
                    # Update with newer data
                    item_copy = item.copy()
                    item_copy['_source_file'] = filename
                    item_copy['_upload_date'] = upload_date
                    item_copy['_updated_at'] = updated_at
                    merged_data[existing_index] = item_copy
    
    # Convert merged data to DataFrame for consistency with your existing code
    if not merged_data:
        return {"message": "No data found in masterfiles", "data": []}
    
    df = pd.DataFrame(merged_data)
    
    # Remove internal tracking columns before returning
    columns_to_remove = ['_source_file', '_upload_date', '_updated_at']
    df_clean = df.drop(columns=[col for col in columns_to_remove if col in df.columns])
    
    # Create columns mapping
    columns_dict = {f"column{i}": col for i, col in enumerate(df_clean.columns)}
    
    # Create a copy with renamed columns for consistency
    df_copy = df_clean.copy()
    df_copy.columns = [f"column{i}" for i in range(len(df_clean.columns))]
    
    data = {
        "totalColumns": len(df_clean.columns),
        "totalRows": len(df_clean),
        "columns": columns_dict,
        "dataframe": df_copy.to_dict(orient='records'),
        "summary": {
            "unique_products": len(merged_data),
            "files_processed": len(masterfile)
        }
    }
    
    return {"data": data}


# now i want to make an endpoint names as orderitems in which i will get the request and i will print it and send the request in the response 
@router.post("/orderitems") 
def get_order_items(request: dict, db: Session = Depends(get_db)):
    """Get order items from masterfile"""
    print("Received request in orderitems endpoint:", request)
    
    # Here you can process the request as needed
    # For now, just return the request back in the response
    return {"received_request": request}

@router.post("/", response_model=masterfile_schema.MasterFile)
def create_masterfile(masterfile: masterfile_schema.MasterFileCreate, db: Session = Depends(get_db)):
    """Create a new masterfile record"""
    return masterfile_crud.create_masterfile(db, masterfile)

@router.get("/", response_model=list[masterfile_schema.MasterFile])
def get_masterfiles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all masterfiles with pagination"""
    master_file = masterfile_crud.get_all_masterfiles(db, skip, limit)
    print("i am here in masterfile printing the master db " , master_file)
        # Print the actual data
    for mf in master_file:
        # columns = mf.file_data['columns']
        print(f"ID: {mf.id}")
        print(f"Company ID: {mf.company_id}")
        print(f"Filename: {mf.filename}")
        # print(f"File Data: {mf.file_data}")
        # print(f"File Data Columns:  {mf.file_data['columns']}")
        # print(f"File Data data: {mf.file_data['data']}")
        df_construction = pd.DataFrame(mf.file_data['data'])
        print(f"DataFrame Construction: {df_construction}")
        print("---")
    return master_file

@router.get("/{masterfile_id}", response_model=masterfile_schema.MasterFile)
def get_masterfile(masterfile_id: int, db: Session = Depends(get_db)):
    """Get a specific masterfile by ID"""
    masterfile = masterfile_crud.get_masterfile(db, masterfile_id)
    print("i am here in masterfile printing the master file" , masterfile)
    if not masterfile:
        raise HTTPException(status_code=404, detail="Masterfile not found")
    return masterfile

@router.get("/{masterfile_id}/items")
def get_masterfile_items(masterfile_id: int, db: Session = Depends(get_db)):
    """Get JSON data from a masterfile as dict"""
    masterfile = masterfile_crud.get_masterfile(db, masterfile_id)
    if not masterfile:
        raise HTTPException(status_code=404, detail="Masterfile not found")
    return masterfile.file_data

@router.get("/company/{company_id}", response_model=list[masterfile_schema.MasterFile])
def get_company_masterfiles(
    company_id: int, 
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all masterfiles for a company"""
    return masterfile_crud.get_masterfile_by_company(db, company_id, skip, limit)

@router.get("/company/{company_id}/filename/{filename}", response_model=masterfile_schema.MasterFile)
def get_masterfile_by_filename(
    company_id: int,
    filename: str,
    db: Session = Depends(get_db)
):
    """Get a masterfile by company ID and filename"""
    masterfile = masterfile_crud.get_masterfile_by_filename(db, company_id, filename)
    if not masterfile:
        raise HTTPException(status_code=404, detail="Masterfile not found")
    return masterfile

@router.put("/{masterfile_id}", response_model=masterfile_schema.MasterFile)
def update_masterfile(masterfile_id: int, file_data: dict, db: Session = Depends(get_db)):
    """Update file_data for an existing masterfile"""
    updated = masterfile_crud.update_masterfile(db, masterfile_id, file_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Masterfile not found")
    return updated

@router.delete("/{masterfile_id}")
def delete_masterfile(masterfile_id: int, db: Session = Depends(get_db)):
    """Delete a masterfile record"""
    success = masterfile_crud.delete_masterfile(db, masterfile_id)
    if not success:
        raise HTTPException(status_code=404, detail="Masterfile not found")
    return {"detail": "Masterfile deleted successfully"}

@router.post("/bulk", response_model=list[masterfile_schema.MasterFile])
def bulk_create_masterfiles(masterfiles: list[masterfile_schema.MasterFileCreate], db: Session = Depends(get_db)):
    """Bulk create multiple masterfile records"""
    return masterfile_crud.bulk_create_masterfile(db, masterfiles)

@router.get("/dataframe")
def get_masterfiles_as_dataframe(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all masterfiles data as DataFrame format"""
    masterfiles = masterfile_crud.get_all_masterfiles(db, skip, limit)
    
    if not masterfiles:
        return {"message": "No masterfiles found", "data": []}
    
    # Combine all masterfile data into a single DataFrame
    all_data = []
    for masterfile in masterfiles:
        file_data = masterfile.file_data
        if 'data' in file_data and file_data['data']:
            # Add metadata columns to each row
            for row in file_data['data']:
                row_with_metadata = row.copy()
                row_with_metadata['masterfile_id'] = masterfile.id
                row_with_metadata['filename'] = masterfile.filename
                row_with_metadata['company_id'] = masterfile.company_id
                all_data.append(row_with_metadata)
    
    if not all_data:
        return {"message": "No data found in masterfiles", "data": []}
    
    # Create DataFrame
    df = pd.DataFrame(all_data)
    
    # Print DataFrame info (this will show in your FastAPI logs)
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

@router.get("/{masterfile_id}/dataframe")
def get_single_masterfile_as_dataframe(masterfile_id: int, db: Session = Depends(get_db)):
    """Get a specific masterfile data as DataFrame format"""
    masterfile = masterfile_crud.get_masterfile(db, masterfile_id)
    if not masterfile:
        raise HTTPException(status_code=404, detail="Masterfile not found")
    
    file_data = masterfile.file_data
    if 'data' not in file_data or not file_data['data']:
        return {"message": "No data found in this masterfile", "data": []}
    
    # Create DataFrame from the data
    df = pd.DataFrame(file_data['data'])
    
    # Print DataFrame info
    print(f"Masterfile {masterfile_id} DataFrame Shape:", df.shape)
    print("DataFrame Columns:", df.columns.tolist())
    print("DataFrame Head:")
    print(df.head())
    
    return {
        "masterfile_id": masterfile_id,
        "filename": masterfile.filename,
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

@router.get("/specific/dataframe")
def get_specific_masterfile_dataframe(db: Session = Depends(get_db)):
    """Get DataFrame from specific masterfile (company_id=1, filename=master_file.xlsx)"""
    
    # Query for specific masterfile
    masterfile = masterfile_crud.get_masterfile_by_filename(db, company_id=1, filename="master_file.xlsx")
    
    if not masterfile:
        raise HTTPException(status_code=404, detail="Masterfile not found for company_id=1 and filename=master_file.xlsx")
    
    # Extract file_data
    file_data = masterfile.file_data
    
    if 'data' not in file_data or not file_data['data']:
        return {"message": "No data found in this masterfile", "data": []}
    
    # Create DataFrame from the data array
    df = pd.DataFrame(file_data['data'])
    
    # Print comprehensive DataFrame info to console
    print("=" * 60)
    print(f"MASTERFILE DATAFRAME ANALYSIS")
    print("=" * 60)
    print(f"Masterfile ID: {masterfile.id}")
    print(f"Company ID: {masterfile.company_id}")
    print(f"Filename: {masterfile.filename}")
    print(f"Original Filename: {file_data.get('original_filename', 'N/A')}")
    print(f"Upload Date: {file_data.get('upload_date', 'N/A')}")
    print(f"Total Rows in File: {file_data.get('total_rows', 'N/A')}")
    print("-" * 60)
    print(f"DataFrame Shape: {df.shape}")
    print(f"DataFrame Columns: {df.columns.tolist()}")
    print("-" * 60)
    print("DataFrame Head (first 5 rows):")
    print(df.head())
    print("-" * 60)
    print("DataFrame Info:")
    print(df.info())
    print("-" * 60)
    print("DataFrame Description (numerical columns):")
    print(df.describe())
    print("-" * 60)
    print("Value Counts for Category:")
    print(df['Category'].value_counts())
    print("=" * 60)
    
    # Return comprehensive data
    return {
        "masterfile_info": {
            "id": masterfile.id,
            "company_id": masterfile.company_id,
            "filename": masterfile.filename,
            "original_filename": file_data.get('original_filename'),
            "upload_date": file_data.get('upload_date'),
            "total_rows_in_file": file_data.get('total_rows')
        },
        "dataframe_info": {
            "shape": df.shape,
            "columns": df.columns.tolist(),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "total_rows": len(df),
            "total_columns": len(df.columns)
        },
        "data": df.to_dict('records'),
        "statistics": {
            "category_counts": df['Category'].value_counts().to_dict(),
            "numerical_stats": df.describe().to_dict() if len(df.select_dtypes(include=['number']).columns) > 0 else {}
        }
    }
    
    