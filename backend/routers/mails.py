# routers/mails.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import time
from crud import mails as mail_crud
from schemas import mails as mail_schema
from database import get_db
from dependencies.auth import get_current_user
from schemas.users import User
from fastapi import status


router = APIRouter(
    prefix="/mails",
    tags=["Mails"],
)


# @router.post("/", response_model=mail_schema.Mail)
# def create_mail(
#     mail: mail_schema.MailCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     """Create a new mail record with scheduled receiving time"""
#     return mail_crud.create_mail_record(db, mail)


@router.get("/", response_model=List[mail_schema.Mail])
def get_mails(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """Get all mail records"""
    return mail_crud.get_mails(db, skip=skip, limit=limit)


# @router.get("/{mail_id}", response_model=mail_schema.Mail)
# def get_mail(
#     mail_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     """Get a specific mail by ID"""
#     mail = mail_crud.get_mail_by_id(db, mail_id)
#     if not mail:
#         raise HTTPException(status_code=404, detail="Mail not found")
#     return mail


# @router.get("/email/{email}", response_model=List[mail_schema.Mail])
# def get_mails_by_email(
#     email: str,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     """Get all mails sent to a specific email address"""
#     return mail_crud.get_mails_by_email(db, email)


# @router.get("/time/{receiving_time}", response_model=List[mail_schema.Mail])
# def get_mails_by_time(
#     receiving_time: time,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     """Get all mails scheduled for a specific time (format: HH:MM:SS)"""
#     return mail_crud.get_mails_by_time(db, receiving_time)


# @router.get("/time-range/", response_model=List[mail_schema.Mail])
# def get_mails_by_time_range(
#     start_time: time = Query(..., description="Start time (format: HH:MM:SS)"),
#     end_time: time = Query(..., description="End time (format: HH:MM:SS)"),
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     """Get all mails scheduled within a time range"""
#     return mail_crud.get_mails_by_time_range(db, start_time, end_time)





@router.post("/createmails", response_model=mail_schema.Mail)
def create_mail_with_company(
    mail: mail_schema.MailCreate,
    db: Session = Depends(get_db),
):
    """Create a new mail record with scheduled receiving time"""
    return mail_crud.create_mail_record_from_mail(db, mail)



@router.delete("/deleteschedule/{email}", status_code=status.HTTP_200_OK)
def delete_mails_by_email(
    email: str,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """Delete all mail entries for a given email"""
    return mail_crud.delete_mails_by_email(db, email)


@router.get("/mailslist/{company_id}", response_model=List[str])
def get_mails_by_company(
    company_id: int,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """Get all mails for a specific company"""
    return mail_crud.get_mails_by_company(db, company_id)





from schemas.mails import MailUpdate

@router.put("/updatemail/{mail_id}", response_model=mail_schema.Mail)
def update_mail_entry(
    mail_id: int,
    update_data: MailUpdate,
    db: Session = Depends(get_db)
):
    """Update receiver_email or receiving_time for a mail"""
    return mail_crud.update_mail(db, mail_id, update_data)

