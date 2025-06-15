from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import datetime
import base64
import io
import os
import traceback

from models_pydantic import ExcelUploadRequest, DualDashboardResponse
from crud.uploaded_files import upload_file_record
from schemas.uploaded_files import UploadedFileCreate
from dependencies.auth import get_current_active_user
from models.users import User
from database import get_db

from excel_upload_return import process_uploaded_excel

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
    try:
        print(f"Received file upload: {request.fileName}")
        file_content = base64.b64decode(request.fileContent)
        excel_data = io.BytesIO(file_content)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_name = f"{timestamp}_{request.fileName}"
        file_path = os.path.join(UPLOAD_DIR, file_name)

        file_record = UploadedFileCreate(
            file_name=file_name,
            dashboard_name=request.dashboard,
            uploader_id=current_user.id
        )
        upload_file_record(db, file_record)
        with open(file_path, "wb") as f:
            f.write(file_content)

        return await process_uploaded_excel(request, file_name, file_content, excel_data)

    except Exception as e:
        print(traceback.format_exc())
        error_message = str(e)
        if "Net Price" in error_message:
            raise HTTPException(
                status_code=400,
                detail=f"You uploaded the file in the wrong dashboard i.e. ({request.dashboard}) or the file is not properly structured. Please check the help center for more details."
            )
        raise HTTPException(status_code=500, detail=f"Error processing file: {error_message}")
