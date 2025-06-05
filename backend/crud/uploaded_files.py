from sqlalchemy.orm import Session
from models_db.uploaded_files import UploadedFile
from schemas.uploaded_files import UploadedFileCreate

def upload_file_record(db: Session, file_data: UploadedFileCreate):
    db_file = UploadedFile(**file_data.dict())
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file

def get_files_uploaded_by_user(db: Session, user_id: int):
    return db.query(UploadedFile).filter(UploadedFile.uploader_id == user_id).all()
