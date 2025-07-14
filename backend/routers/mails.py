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



@router.get("/", response_model=List[mail_schema.Mail])
def get_mails(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """Get all mail records"""
    return mail_crud.get_mails(db, skip=skip, limit=limit)



# Updated endpoint
@router.get("/{company_id}", response_model=List[mail_schema.Mail])
def get_mails(
    company_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """Get mail records by company_id"""
    return mail_crud.get_mails_by_company_id(db, company_id=company_id, skip=skip, limit=limit)



@router.post("/createmails", response_model=List[mail_schema.Mail])
def create_mails_with_company(
    mails: List[mail_schema.MailCreate],
    db: Session = Depends(get_db),
):

    """Create multiple mail records with scheduled receiving time"""
    return mail_crud.create_multiple_mail_records(db, mails)



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

