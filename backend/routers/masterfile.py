from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.locations import Store
from models.companies import Company
from crud import master_file as masterfile_crud
from schemas import master_file as masterfile_schema
from database import get_db
import pandas as pd

router = APIRouter(
    prefix="/api/masterfile",
    tags=["Master Files"]
)


# @router.get("/details")
# def get_masterfile_details_alt(db: Session = Depends(get_db)):
#     """Get details of all masterfiles with company and location info (alternative approach)"""
    
#     try:
        
#         masterfiles = masterfile_crud.get_all_masterfiles(db)
        
#         if not masterfiles:
#             return {"message": "No masterfiles found", "data": []}
        
#         # Get all unique company and location IDs
#         company_ids = list(set(mf.company_id for mf in masterfiles if mf.company_id))
#         location_ids = list(set(mf.location_id for mf in masterfiles if mf.location_id))
        
#         # Fetch companies and locations in batch
#         companies = db.query(Company).filter(Company.id.in_(company_ids)).all()
#         locations = db.query(Store).filter(Store.id.in_(location_ids)).all()

#         # Create lookup dictionaries
#         company_lookup = {comp.id: comp.name for comp in companies}
#         location_lookup = {loc.id: loc.name for loc in locations}
        
#         details = []
#         for mf in masterfiles:
#             details.append({
#                 "id": mf.id,
#                 "company_id": mf.company_id,
#                 "company_name": company_lookup.get(mf.company_id, "Unknown"),
#                 "filename": mf.filename,
#                 "location_id": mf.location_id,
#                 "location_name": location_lookup.get(mf.location_id, "Unknown"),
#             })
        

#         return {"data": details}


#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error fetching masterfile details: {str(e)}")


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
    
    