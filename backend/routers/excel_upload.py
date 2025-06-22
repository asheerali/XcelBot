# router/excel_upload.py

from fastapi import APIRouter, Depends, HTTPException
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
import os
from datetime import datetime, timedelta
import traceback
from datetime import date
from dateutil.relativedelta import relativedelta
from fastapi import Request
from sqlalchemy.orm import Session

# Import from local modules
from models_pydantic import ExcelUploadRequest, ExcelFilterRequest, ExcelUploadResponse, SalesAnalyticsResponse, DualDashboardResponse, DashboardResponse
from excel_processor import process_excel_file
# from utils import find_file_in_directory
from sales_analytics import generate_sales_analytics
from constants import *

from crud.uploaded_files import upload_file_record
from schemas.uploaded_files import UploadedFileCreate
from dependencies.auth import get_current_active_user
from models.users import User
from fastapi import Depends
from database import get_db

# Import the return processor
from .excel_upload_return import process_dashboard_data

router = APIRouter(
    prefix="/api",
    tags=["excel_upload"],
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/excel/upload", response_model=DualDashboardResponse)
async def upload_excel(
    request: ExcelUploadRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    file_path = None  # Initialize in outer scope for access in except block
    try:
        print(f"Received file upload: {request.fileName}")
        
        # Decode base64 file content
        file_content = base64.b64decode(request.fileContent)
        print("Type of file_content:", type(file_content))
        
        # Create BytesIO object for pandas
        excel_data = io.BytesIO(file_content)
        
        # Save file to disk with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_file_name = os.path.basename(request.fileName)  # Prevent path issues
        
        # Ensure the file name is safe and does not contain any path components
        file_name = f"{timestamp}_{safe_file_name}"
        # file_name = f"{timestamp}_{request.fileName}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        print('Processing uploaded file:', request.fileName)
        if request.location:
            print('Location:', request.location)
            print("Dashboard:", request.dashboard) 

        # Process the dashboard data using the separate module
        result = process_dashboard_data(request, file_content, file_name)

        # Save file record to database *after* successful processing
        file_record = UploadedFileCreate(
            file_name=file_name,
            dashboard_name=request.dashboard,
            uploader_id=current_user.id
        )
        upload_file_record(db, file_record)

        return result

    except Exception as e:
        print(traceback.format_exc())

        # Delete the file if it was already saved
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted file due to error: {file_path}")

        error_message = str(e)
        if "Net Price" in error_message:
            raise HTTPException(
                status_code=400,
                detail=f"You uploaded the file in the wrong dashboard i.e. ({request.dashboard}) or the file is not properly structured. Please check the help center for more details."
            )

        raise HTTPException(status_code=500, detail=f"Error processing file: {error_message}")
