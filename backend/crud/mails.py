# crud/mails.py

from datetime import time
from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.companies import Company
from models.users import User
from models.mails import Mail
from schemas.mails import MailCreate
from fastapi import status
from schemas.mails import MailUpdate



def create_mail_record(db: Session, mail: MailCreate):
    """Create a mail record in the database"""
    db_mail = Mail(**mail.dict())
    db.add(db_mail)
    db.commit()
    db.refresh(db_mail)
    return db_mail



def create_mail_record_simple(db: Session, receiver_name: str, receiver_email: str, receiving_time: time):
    """Create a mail record with simple parameters"""
    mail_data = MailCreate(
        receiver_name=receiver_name,
        receiver_email=receiver_email,
        receiving_time=receiving_time
    )
    return create_mail_record(db, mail_data)


def get_mails(db: Session, skip: int = 0, limit: int = 100):
    """Get all mail records"""
    return db.query(Mail).offset(skip).limit(limit).all()


# Updated CRUD function
def get_mails_by_company_id(db: Session, company_id: int, skip: int = 0, limit: int = 100):
    """Get mail records by company_id"""
    return db.query(Mail).filter(Mail.company_id == company_id).offset(skip).limit(limit).all()






def get_mail_by_id(db: Session, mail_id: int):
    """Get a specific mail by ID"""
    return db.query(Mail).filter(Mail.id == mail_id).first()


def get_mails_by_email(db: Session, email: str):
    """Get all mails sent to a specific email address"""
    return db.query(Mail).filter(Mail.receiver_email == email).all()


def get_mails_by_time(db: Session, receiving_time: time):
    """Get all mails scheduled for a specific time"""
    return db.query(Mail).filter(Mail.receiving_time == receiving_time).all()


def get_mails_by_time_range(db: Session, start_time: time, end_time: time):
    """Get all mails scheduled within a time range"""
    return db.query(Mail).filter(
        Mail.receiving_time >= start_time,
        Mail.receiving_time <= end_time
    ).all()


def delete_mails_by_email(db: Session, email: str):
    """Delete all mails with the given receiver_email"""
    deleted_count = db.query(Mail).filter(Mail.receiver_email == email).delete()
    db.commit()

    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="No mails found with this email")

    return {"message": f"{deleted_count} mail(s) deleted"}


def get_mails_by_company(db: Session, company_id: int):
    """
    Get all mail records where the receiver email belongs to a user in the specified company.
    """
    emails = []
    # Get all users in the company
    company = db.query(Company).filter(Company.id == company_id).first()
    users = db.query(User).filter(User.company_id == company_id).all()
    if not users and not company:
        raise HTTPException(status_code=404, detail="No users found for this company")

    
    # Extract user emails
    user_emails = [user.email for user in users]
    company_email = company.email if company else None
    
    if company_email:
        user_emails.append(company_email)
        emails = user_emails

    else:
        emails = user_emails

    emails = list(set(emails))  # Ensure unique emails

    return emails


def get_remaining_mails_by_company(db: Session, company_id: int):
    """
    Get all mail records where the receiver email belongs to a user in the specified company
    and filter out emails that already exist in the mail table.
    """
    # Get all users in the company
    company = db.query(Company).filter(Company.id == company_id).first()
    users = db.query(User).filter(User.company_id == company_id).all()
    
    if not users and not company:
        raise HTTPException(status_code=404, detail="No users found for this company")

    # Extract user emails
    user_emails = [user.email for user in users]
    company_email = company.email if company else None
    
    if company_email:
        user_emails.append(company_email)
        
    emails = list(set(user_emails))  # Ensure unique emails
    
    # Get all emails that already exist in the mail table
    existing_emails = db.query(Mail.receiver_email).filter(
        Mail.receiver_email.in_(emails)
    ).all()
    
    # Extract the email values from the query result
    existing_email_set = {email[0] for email in existing_emails}
    
    # Filter out emails that already exist in the mail table
    remaining_emails = [email for email in emails if email not in existing_email_set]
    
    return remaining_emails


def create_mail_record_from_mail(db: Session, mail: MailCreate):
    """Create a mail record in the database"""
    print("Creating mail record from MailCreate schema", mail)

    # Check for duplicate entry by email
    existing_mail = db.query(Mail).filter(Mail.receiver_email == mail.receiver_email).first()
    if existing_mail:
        raise HTTPException(status_code=400, detail="Mail with this email already exists.")

    # Try to find the user with matching email
    user = db.query(User).filter(User.email == mail.receiver_email).first()
    mail_data = mail.dict()

    if user:
        mail_data["receiver_name"] = f"{user.last_name}"
    else:
        company = db.query(Company).filter(Company.email == mail.receiver_email).first()
        if company:
            mail_data["receiver_name"] = company.name
        else:
            mail_data["receiver_name"] = "user"

    db_mail = Mail(**mail_data)
    db.add(db_mail)
    db.commit()
    db.refresh(db_mail)

    return db_mail



def create_multiple_mail_records(db: Session, mails: List[MailCreate]):
    """Create multiple mail records"""
    created_mails = []

    for mail in mails:
        
        # Handle company_id logic
        if mail.company_id is None:
            # Get company_id from the user's email
            user = db.query(User).filter(User.email == mail.receiver_email).first()
            if user:
                mail.company_id = user.company_id
            else:
                # Check if it's a company email
                company = db.query(Company).filter(Company.email == mail.receiver_email).first()
                if not company:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Email {mail.receiver_email} is not registered in users or companies."
                    )
                mail.company_id = company.id  # Assuming company has an 'id' field
            
        elif mail.company_id > 0:
            # Check if user belongs to the specified company
            user = db.query(User).filter(User.email == mail.receiver_email).first()
            if user:
                if user.company_id != mail.company_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"User {mail.receiver_email} does not belong to company ID {mail.company_id}."
                    )
            else:
                # Check if it's a company email
                company = db.query(Company).filter(Company.email == mail.receiver_email).first()
                if not company:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Email {mail.receiver_email} is not registered in users or companies."
                    )
                if company.id != mail.company_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Company email {mail.receiver_email} does not belong to company ID {mail.company_id}."
                    )
        
        else:  # company_id == 0
            # Check if user is superuser to allow company_id = 0
            user = db.query(User).filter(User.email == mail.receiver_email).first()
            if user:
                if user.role != "superuser":
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Company ID cannot be 0. Only superusers can have company ID 0."
                    )
            else:
                # Check if it's a company email - companies can also have company_id = 0 if allowed
                company = db.query(Company).filter(Company.email == mail.receiver_email).first()
                if not company:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Email {mail.receiver_email} is not registered in users or companies."
                    )
                # If you want to restrict company_id = 0 for companies too, add validation here
        
        # Check for duplicate entry
        existing_mail = db.query(Mail).filter(Mail.receiver_email == mail.receiver_email).first()
        if existing_mail:
            continue  # Skip duplicates silently; or you could collect and report skipped entries

        mail_data = mail.dict()

        # Assign name based on email
        user = db.query(User).filter(User.email == mail.receiver_email).first()
        if user:
            mail_data["receiver_name"] = user.last_name
        else:
            company = db.query(Company).filter(Company.email == mail.receiver_email).first()
            if company:
                mail_data["receiver_name"] = company.name
            else:
                mail_data["receiver_name"] = "user"

        db_mail = Mail(**mail_data)
        db.add(db_mail)
        db.commit()
        db.refresh(db_mail)
        created_mails.append(db_mail)

    return created_mails



def update_mail(db: Session, mail_id: int, update_data: MailUpdate):
    """Update receiver_email, receiver_name, or receiving_time for a mail record"""
    mail_record = db.query(Mail).filter(Mail.id == mail_id).first()

    if not mail_record:
        raise HTTPException(status_code=404, detail="Mail not found.")

    # Handle receiver_email
    if update_data.receiver_email:
        # Check for duplicates (excluding current record)
        existing_mail = db.query(Mail).filter(
            Mail.receiver_email == update_data.receiver_email,
            Mail.id != mail_id
        ).first()
        if existing_mail:
            raise HTTPException(status_code=400, detail="Another mail with this email already exists.")

        mail_record.receiver_email = update_data.receiver_email

        # Update name only if not provided explicitly
        if not update_data.receiver_name:
            user = db.query(User).filter(User.email == update_data.receiver_email).first()
            if user:
                mail_record.receiver_name = user.last_name
            else:
                company = db.query(Company).filter(Company.email == update_data.receiver_email).first()
                if company:
                    mail_record.receiver_name = company.name
                else:
                    mail_record.receiver_name = "user"

    # Handle manual name override (even if email isn't changing)
    if update_data.receiver_name:
        mail_record.receiver_name = update_data.receiver_name

    if update_data.receiving_time:
        mail_record.receiving_time = update_data.receiving_time

    db.commit()
    db.refresh(mail_record)
    return mail_record




