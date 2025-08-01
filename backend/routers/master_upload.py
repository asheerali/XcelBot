from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from schemas.master_file import MasterFileCreate
from crud import master_file as masterfile_crud
from database import get_db
from dependencies.auth import get_current_active_user
from models.users import User
from models_pydantic import ExcelUploadRequest, DualDashboardResponse
import base64
import json
import io
import pandas as pd
import datetime
import traceback

router = APIRouter(
    prefix="/api",
    tags=["master_upload"],
)

# @router.post("/master/upload")
# async def master_upload(
#     request: ExcelUploadRequest = Body(...),
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_active_user),
# ):
#     """
#     Upload and process master file data, saving it to the database
#     """
#     try:
#         print(f"Received file upload: {request.fileName}", "request", request)
#         print("printing the checking")
        
#         # Validate required fields
#         if not request.company_id:
#             raise HTTPException(status_code=400, detail="Company ID is required")
        
#         if not request.fileName:
#             raise HTTPException(status_code=400, detail="File name is required")
        
#         if not request.fileContent:
#             raise HTTPException(status_code=400, detail="File content is required")
        
#         # Decode base64 file content
#         try:
#             # content = base64.b64encode(b"test content").decode('utf-8')
#             # file_content = base64.b64decode(content)
#             file_content = base64.b64decode(request.fileContent)
#             print("Successfully decoded base64 file content")
#         except Exception as e:
#             print(f"Error decoding base64 content: {str(e)}")
#             raise HTTPException(status_code=400, detail="Invalid base64 file content")
        
#         # Process the Excel file to extract data
#         try:
#             excel_data = io.BytesIO(file_content)
            
#             # Read Excel file - you might want to handle multiple sheets
#             df = pd.read_excel(excel_data, sheet_name=0)  # Read first sheet
            
#             # Fill the "Previous Price" column with a dash ('-')
#             df['Previous Price'] = '-'
#             print(f"Successfully read Excel file with {len(df)} rows and {len(df.columns)} columns")
#             print("printing the df head")
#             print(df.head())
#             print("--------------------------------------------------")
#             # Convert DataFrame to JSON format
#             # Handle datetime objects and other non-serializable types
#             df_json = df.to_dict('records')
#             # df_reconstructed = pd.DataFrame(df_json)
#             # print(f"Reconstructed DataFrame printing: {df_reconstructed.head()}")

#             # Convert any datetime objects to strings
#             for record in df_json:
#                 for key, value in record.items():
#                     if pd.isna(value):
#                         record[key] = None
#                     elif isinstance(value, (pd.Timestamp, datetime.datetime, datetime.date)):
#                         record[key] = value.isoformat() if value else None
#                     elif isinstance(value, (int, float)) and pd.isna(value):
#                         record[key] = None
            
#             # Prepare file data for database storage
#             file_data = {
#                 # "original_filename": request.fileName,
#                 "upload_date": datetime.datetime.now().isoformat(),
#                 "user_id": current_user.id,
#                 # "location": request.location,
#                 # "dashboard": request.dashboard,
#                 "total_rows": len(df),
#                 "columns": df.columns.tolist(),
#                 "data": df_json
#             }
            
#         except Exception as e:
#             print(f"Error processing Excel file: {str(e)}")
#             print(traceback.format_exc())
#             raise HTTPException(status_code=400, detail=f"Error processing Excel file: {str(e)}")
        
#         # Check if file with same name already exists for this company
#         existing_file = masterfile_crud.get_masterfile_by_filename(
#             db, request.company_id, request.fileName
#         )
        
#         if existing_file:
#             # Update existing file
#             print(f"Updating existing file: {request.fileName}")
#             updated_file = masterfile_crud.update_masterfile(
#                 db, existing_file.id, file_data
#             )
#             saved_file = updated_file
#         else:
#             # Create new file record
#             print(f"Creating new file record: {request.fileName}")
#             masterfile_create = MasterFileCreate(
#                 company_id=request.company_id,
#                 filename=request.fileName,
#                 file_data=file_data
#             )
#             saved_file = masterfile_crud.create_masterfile(db, masterfile_create)
        
#         print(f"Successfully saved file to database with ID: {saved_file.id}")
        
#         # Prepare response data
#         column_names = df.columns.tolist()
#         columns_data = df_json[:10]  # Return first 10 rows as preview
        
#         master_response = {
#             "columnNames": column_names,
#             "columnsData": columns_data,
#             "fileName": request.fileName,
#             "company_id": request.company_id,
#             "userId": current_user.id,
#             "data": f"File uploaded successfully. {len(df)} rows processed and saved to database.",
#             "file_id": saved_file.id,
#             "total_rows": len(df),
#             "preview_rows": len(columns_data)
#         }
        
#         print("--------------------------------------------------")
#         print("i am here in master_upload, returning response")
#         print(master_response)
#         print("--------------------------------------------------")

#         return master_response
        
#     except HTTPException:
#         # Re-raise HTTP exceptions without modification
#         raise
#     except Exception as e:
#         print(f"Unexpected error in master_upload: {str(e)}")
#         print(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Your updated master_upload endpoint
@router.post("/master/upload")
async def master_upload(
    request: ExcelUploadRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Upload and process master file data, saving it to the database
    """
    try:
        print(f"Received file upload: {request.fileName}", "request", request)
        
        # Validate required fields
        if not request.company_id:
            raise HTTPException(status_code=400, detail="Company ID is required")
        
        if not request.location_id:
            raise HTTPException(status_code=400, detail="Location ID is required")
        
        if not request.fileName:
            raise HTTPException(status_code=400, detail="File name is required")
        
        if not request.fileContent:
            raise HTTPException(status_code=400, detail="File content is required")
        
        # NEW: Validate that location exists and belongs to company
        from crud.locations import get_store  # Import your location CRUD
        location = get_store(db, request.location_id)
        if not location:
            raise HTTPException(status_code=400, detail="Location not found")
        
        if location.company_id != request.company_id:
            raise HTTPException(
                status_code=400, 
                detail="Location does not belong to the specified company"
            )
        
        # Decode base64 file content
        try:
            file_content = base64.b64decode(request.fileContent)
            print("Successfully decoded base64 file content")
        except Exception as e:
            print(f"Error decoding base64 content: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid base64 file content")
        
        # Process the Excel file to extract data
        try:
            excel_data = io.BytesIO(file_content)
            df = pd.read_excel(excel_data, sheet_name=0)
            df.columns = df.columns.str.strip() 
            df['Previous Price'] = '-'
            print(f"Successfully read Excel file with {len(df)} rows and {len(df.columns)} columns")
            
            df_json = df.to_dict('records')
            
            # Convert any datetime objects to strings
            for record in df_json:
                for key, value in record.items():
                    if pd.isna(value):
                        record[key] = None
                    elif isinstance(value, (pd.Timestamp, datetime.datetime, datetime.date)):
                        record[key] = value.isoformat() if value else None
                    elif isinstance(value, (int, float)) and pd.isna(value):
                        record[key] = None
            
            # Prepare file data for database storage
            file_data = {
                "upload_date": datetime.datetime.now().isoformat(),
                "user_id": current_user.id,
                "location_id": request.location_id,  # NEW: Store location_id in file_data
                "location_name": location.name,      # NEW: Store location name for reference
                "total_rows": len(df),
                "columns": df.columns.tolist(),
                "data": df_json
            }
            
        except Exception as e:
            print(f"Error processing Excel file: {str(e)}")
            print(traceback.format_exc())
            raise HTTPException(status_code=400, detail=f"Error processing Excel file: {str(e)}")
        
        # Check if file with same name already exists for this company and location
        existing_file = masterfile_crud.get_masterfile_by_filename_and_location(
            db, request.company_id, request.location_id, request.fileName
        )
        
        if existing_file:
            # Update existing file
            print(f"Updating existing file: {request.fileName}")
            updated_file = masterfile_crud.update_masterfile(
                db, existing_file.id, file_data
            )
            saved_file = updated_file
        else:
            # Create new file record
            print(f"Creating new file record: {request.fileName}")
            masterfile_create = MasterFileCreate(
                company_id=request.company_id,
                location_id=request.location_id,  # NEW
                filename=request.fileName,
                file_data=file_data
            )
            saved_file = masterfile_crud.create_masterfile(db, masterfile_create)
        
        print(f"Successfully saved file to database with ID: {saved_file.id}")
        
        # Prepare response data
        column_names = df.columns.tolist()
        columns_data = df_json[:10]
        
        master_response = {
            "columnNames": column_names,
            "columnsData": columns_data,
            "fileName": request.fileName,
            "company_id": request.company_id,
            "location_id": request.location_id,    # NEW
            "location_name": location.name,        # NEW
            "userId": current_user.id,
            "data": f"File uploaded successfully. {len(df)} rows processed and saved to database.",
            "file_id": saved_file.id,
            "total_rows": len(df),
            "preview_rows": len(columns_data)
        }
        
        return master_response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in master_upload: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/master/files/company/{company_id}")
async def get_company_master_files(
    company_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get all master files for a specific company
    """
    try:
        files = masterfile_crud.get_masterfile_by_company(db, company_id, skip, limit)
        
        # Prepare response with file metadata
        files_data = []
        for file in files:
            file_info = {
                "id": file.id,
                "filename": file.filename,
                "company_id": file.company_id,
                "upload_date": file.file_data.get("upload_date"),
                "total_rows": file.file_data.get("total_rows", 0),
                "columns": file.file_data.get("columns", []),
                "location": file.file_data.get("location"),
                "dashboard": file.file_data.get("dashboard"),
                "user_id": file.file_data.get("user_id")
            }
            files_data.append(file_info)
        
        return {
            "files": files_data,
            "total": len(files_data),
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        print(f"Error retrieving company files: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving files: {str(e)}")


@router.get("/master/files/{file_id}/data")
async def get_master_file_data(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get the actual data from a specific master file
    """
    try:
        file = masterfile_crud.get_masterfile(db, file_id)
        
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        return {
            "file_info": {
                "id": file.id,
                "filename": file.filename,
                "company_id": file.company_id,
                "upload_date": file.file_data.get("upload_date"),
                "total_rows": file.file_data.get("total_rows", 0),
                "columns": file.file_data.get("columns", [])
            },
            "data": file.file_data.get("data", [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving file data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving file data: {str(e)}")