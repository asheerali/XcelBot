from sqlalchemy.orm import Session
from models import users as user_model
from schemas import users as user_schema
from datetime import datetime
from passlib.hash import bcrypt
from crud.user_company import create_user_company
from schemas.user_company import UserCompanyCreate
from utils.email import send_account_email

from crud.user_company_companylocation import (
    create_user_location_mapping,
    delete_user_location_mappings
)
from schemas.user_company_companylocation import UserCompanyCompanyLocationCreate

from fastapi import HTTPException


# def create_user(db: Session, user: user_schema.UserCreate):
#     # Check if email exists
#     existing_user = db.query(user_model.User).filter(user_model.User.email == user.email).first()
#     if existing_user:
#         raise ValueError("Email already registered.")

#     # Enforce company_id check for non-superusers
#     if user.role != user_schema.RoleEnum.superuser and not user.company_id:
#         raise HTTPException(status_code=400, detail="Non-superuser accounts must be associated with a company.")

#     hashed_password = bcrypt.hash(user.password)
#     db_user = user_model.User(
#         first_name=user.first_name,
#         last_name=user.last_name,
#         email=user.email,
#         password_hash=hashed_password,
#         phone_number=user.phone_number,
#         role=user.role,
#         company_id=user.company_id
#     )
#     db.add(db_user)
#     db.commit()
#     db.refresh(db_user)

#     # ✅ Add user-company mapping
#     if db_user.company_id:
#         user_company_data = UserCompanyCreate(
#             user_id=db_user.id,
#             company_id=db_user.company_id
#         )
#         create_user_company(db, user_company_data)

#     # ✅ Assign locations using company_location_id list
#     if user.assigned_location:
#         for location_id in user.assigned_location:
#             create_user_location_mapping(db, UserCompanyCompanyLocationCreate(
#                 user_id=db_user.id,
#                 company_location_id=location_id
#             ))

#     return db_user



import random
import string
import asyncio

def generate_password(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

# def create_user(db: Session, user: user_schema.UserCreate):
def create_user(db: Session, user: user_schema.UserCreate, background_tasks=None):

    existing_user = db.query(user_model.User).filter(user_model.User.email == user.email).first()
    if existing_user:
        raise ValueError("Email already registered.")

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
        company_id=user.company_id
    )
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

    # ✅ Send email AFTER successful DB entry
    # asyncio.create_task(send_account_email(db_user.email, db_user.first_name, raw_password))
    if background_tasks:
        background_tasks.add_task(send_account_email, db_user.email, db_user.first_name, raw_password)


    return db_user

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
    db.delete(db_user)
    db.commit()
    return True
