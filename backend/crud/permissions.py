from sqlalchemy.orm import Session
from models.permissions import Permission
from schemas.permissions import PermissionCreate

def create_permission(db: Session, data: PermissionCreate):
    entry = Permission(**data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def get_permission(db: Session, permission_id: int):
    return db.query(Permission).filter(Permission.id == permission_id).first()

def get_permissions(db: Session):
    return db.query(Permission).all()

def update_permission(db: Session, permission_id: int, data: PermissionCreate):
    permission = get_permission(db, permission_id)
    if not permission:
        return None
    for key, value in data.model_dump().items():
        setattr(permission, key, value)
    db.commit()
    db.refresh(permission)
    return permission

def delete_permission(db: Session, permission_id: int):
    permission = get_permission(db, permission_id)
    if not permission:
        return False
    db.delete(permission)
    db.commit()
    return True

def delete_user_permission_mappings(db: Session, user_id: int):
    db.query(Permission).filter(
        Permission.user_id == user_id
    ).delete()
    db.commit()