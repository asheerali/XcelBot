import random
import string
from sqlalchemy.orm import Session
from datetime import datetime
from passlib.hash import bcrypt
from fastapi import HTTPException

from models import users as user_model
from schemas import users as user_schema
from schemas.user_company import UserCompanyCreate
from schemas.user_company_companylocation import UserCompanyCompanyLocationCreate
from schemas.permissions import PermissionCreate

from crud.user_company import create_user_company
from crud.permissions import create_permission

from utils.email import send_account_email

from crud.user_company_companylocation import (
    create_user_location_mapping,
    delete_user_location_mappings
)
import asyncio

def create_user(db: Session, user: user_schema.UserCreate, background_tasks=None):

    existing_user = db.query(user_model.User).filter(user_model.User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="The email address is already registered. Please use another one."
        )


    if user.role != user_schema.RoleEnum.superuser and not user.company_id:
        raise HTTPException(status_code=400, detail="Non-superuser accounts must be associated with a company.")

    # ✅ Generate password if not provided
    raw_password = user.password if user.password else generate_password()
    hashed_password = bcrypt.hash(raw_password)

    db_user = user_model.User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password_hash=hashed_password,
        phone_number=user.phone_number,
        role=user.role,
        company_id=user.company_id,
        # isActive=user.isActive if user.isActive is not None else True  # ✅ Added isActive field
        isActive=True if user.isActive else False,
        
    )
    
    print("Creating_user:test:", db_user, raw_password, user.assigned_location, user.permissions, user.company_id)

 
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    if db_user.company_id:
        user_company_data = UserCompanyCreate(
            user_id=db_user.id,
            company_id=db_user.company_id
        )
        create_user_company(db, user_company_data)

    if user.assigned_location:
        for location_id in user.assigned_location:
            create_user_location_mapping(db, UserCompanyCompanyLocationCreate(
                user_id=db_user.id,
                company_location_id=location_id
            ))
            
    
    # Create user permissions
    PERMISSION_MAP = {
        "sales_split": "d1",
        "product_mix": "d2",
        "finance": "d3",
        "sales_wide": "d4",
        "user_management": "d5",
        "location_management": "d6",
        "reporting": "d7",
        "excel_upload": "upload_excel"
    }

    if user.permissions:
        permission_kwargs = {
            "company_id": db_user.company_id,
            "user_id": db_user.id,
            "upload_excel": False,
            "d1": False,
            "d2": False,
            "d3": False,
            "d4": False,
            "d5": False,
            "d6": False,
            "d7": False
        }

        for perm in user.permissions:
            backend_field = PERMISSION_MAP.get(perm)
            if backend_field:
                permission_kwargs[backend_field] = True

        permission_data = PermissionCreate(**permission_kwargs)
        create_permission(db, permission_data)
            

    # ✅ Send email AFTER successful DB entry
    if background_tasks:
        background_tasks.add_task(send_account_email, db_user.email, db_user.first_name, raw_password)

    return db_user


def generate_password(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def get_users(db: Session, current_user: user_model.User):
    query = db.query(user_model.User)
    if current_user.role != "superuser":
        query = query.filter(user_model.User.company_id == current_user.company_id)
    return query.all()


def get_user(db: Session, user_id: int):
    return db.query(user_model.User).filter(user_model.User.id == user_id).first()


def update_user(db: Session, user_id: int, user: user_schema.UserCreate):
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    db_user.first_name = user.first_name
    db_user.last_name = user.last_name
    db_user.email = user.email
    db_user.password_hash = bcrypt.hash(user.password)
    db_user.phone_number = user.phone_number
    db_user.role = user.role
    db_user.isActive = user.isActive if user.isActive is not None else db_user.isActive  # ✅ Added isActive update
    db_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)

    # ✅ Reassign locations
    if user.assigned_location is not None:
        delete_user_location_mappings(db, db_user.id)
        for location_id in user.assigned_location:
            create_user_location_mapping(db, UserCompanyCompanyLocationCreate(
                user_id=db_user.id,
                company_location_id=location_id
            ))

    return db_user


def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if not db_user:
        return False

    # ✅ Delete user-location mappings
    delete_user_location_mappings(db, user_id)

    # Optionally: delete user-company mapping if needed

    db.delete(db_user)
    db.commit()
    return True


# ✅ Additional helper functions for managing user active status
def deactivate_user(db: Session, user_id: int):
    """Deactivate a user instead of deleting them"""
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    
    db_user.isActive = False
    db_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)
    return True


def activate_user(db: Session, user_id: int):
    """Reactivate a deactivated user"""
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    
    db_user.isActive = True
    db_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)
    return True


def get_active_users(db: Session, current_user: user_model.User):
    """Get only active users"""
    query = db.query(user_model.User).filter(user_model.User.isActive == True)
    if current_user.role != "superuser":
        query = query.filter(user_model.User.company_id == current_user.company_id)
    return query.all()


def get_inactive_users(db: Session, current_user: user_model.User):
    """Get only inactive users"""
    query = db.query(user_model.User).filter(user_model.User.isActive == False)
    if current_user.role != "superuser":
        query = query.filter(user_model.User.company_id == current_user.company_id)
    return query.all()