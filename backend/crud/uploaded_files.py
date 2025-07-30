from sqlalchemy.orm import Session
from models.users import User
from models.uploaded_files import UploadedFile
from schemas.uploaded_files import UploadedFileCreate

def upload_file_record(db: Session, file_data: UploadedFileCreate):
    db_file = UploadedFile(**file_data.dict())
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file

# def get_files_uploaded_by_user(db: Session, user_id: int):
    # return db.query(UploadedFile).filter(UploadedFile.uploader_id == user_id).all()
    
    
def get_files_uploaded_by_user(db: Session, user_id: int):
    return db.query(UploadedFile).filter(UploadedFile.uploader_id == user_id).all()

def get_uploaded_files(db: Session, current_user: User):
    query = db.query(UploadedFile)
    if current_user.role != "superuser":
        query = query.filter(UploadedFile.company_id == current_user.company_id)
    return query.all()
