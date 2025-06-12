from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.uploaded_files import UploadedFile, UploadedFileCreate
from crud import uploaded_files as file_crud
from database import get_db

router = APIRouter(
    prefix="/files",
    tags=["Uploaded Files"]
)

@router.post("/", response_model=UploadedFile)
def upload_file_record(file_data: UploadedFileCreate, db: Session = Depends(get_db)):
    return file_crud.upload_file_record(db, file_data)

@router.get("/uploader/{user_id}", response_model=list[UploadedFile])
def get_user_uploaded_files(user_id: int, db: Session = Depends(get_db)):
    return file_crud.get_files_uploaded_by_user(db, user_id)
