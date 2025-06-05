from sqlalchemy.orm import Session
from models_db.file_permissions import FilePermission
from schemas.file_permissions import FilePermissionCreate

def assign_file_permission(db: Session, perm: FilePermissionCreate):
    db_perm = FilePermission(**perm.dict())
    db.add(db_perm)
    db.commit()
    db.refresh(db_perm)
    return db_perm

def get_user_files(db: Session, user_id: int):
    return db.query(FilePermission).filter(
        FilePermission.user_id == user_id,
        FilePermission.can_view == True
    ).all()
