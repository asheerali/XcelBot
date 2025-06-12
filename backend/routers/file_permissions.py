from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.file_permissions import FilePermission, FilePermissionCreate
from crud import file_permissions as perm_crud
from app import get_db

router = APIRouter(
    prefix="/permissions/files",
    tags=["File Permissions"]
)

@router.post("/", response_model=FilePermission)
def assign_file_permission(perm: FilePermissionCreate, db: Session = Depends(get_db)):
    return perm_crud.assign_file_permission(db, perm)

@router.get("/user/{user_id}", response_model=list[FilePermission])
def get_user_file_permissions(user_id: int, db: Session = Depends(get_db)):
    return perm_crud.get_user_files(db, user_id)
