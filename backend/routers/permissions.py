from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud import permissions as permission_crud
from schemas.permissions import Permission, PermissionCreate

router = APIRouter(
    prefix="/permissions",
    tags=["Permissions"]
)

@router.post("/", response_model=Permission)
def create_permission(data: PermissionCreate, db: Session = Depends(get_db)):
    return permission_crud.create_permission(db, data)

@router.get("/", response_model=list[Permission])
def get_all_permissions(db: Session = Depends(get_db)):
    return permission_crud.get_permissions(db)

@router.get("/{permission_id}", response_model=Permission)
def get_permission(permission_id: int, db: Session = Depends(get_db)):
    permission = permission_crud.get_permission(db, permission_id)
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    return permission

@router.put("/{permission_id}", response_model=Permission)
def update_permission(permission_id: int, data: PermissionCreate, db: Session = Depends(get_db)):
    updated = permission_crud.update_permission(db, permission_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Permission not found")
    return updated

@router.delete("/{permission_id}")
def delete_permission(permission_id: int, db: Session = Depends(get_db)):
    success = permission_crud.delete_permission(db, permission_id)
    if not success:
        raise HTTPException(status_code=404, detail="Permission not found")
    return {"detail": "Permission deleted successfully"}
