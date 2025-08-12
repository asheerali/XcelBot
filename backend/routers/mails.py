# routers/mails.py

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from datetime import time
from crud import mails as mail_crud
from schemas import mails as mail_schema
from database import get_db
from dependencies.auth import get_current_user
from schemas.users import User
from fastapi import status
from schemas.mails import MailUpdate
# Import the permission function
from datetime import datetime
from dependencies.permissions import can_set_global_time

# Schema for set_global_time request
class SetGlobalTimeRequest(BaseModel):
    company_id: int
    global_time: str  # Expected format: "HH:MM"

class SetGlobalTimeResponse(BaseModel):
    message: str
    global_time: str
    company_id: int
    user_role: str


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
    
    print("Creating mails with company:", mails)
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




# Updated endpoint
@router.get("/remainingmails/{company_id}", response_model=List[str])
def get_remaining_mails(
    company_id: int,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """Get users and companies that are not in the mails table for a specific company"""
    return mail_crud.get_remaining_mails_by_company(db, company_id=company_id)

    


@router.put("/updatemail/{mail_id}", response_model=mail_schema.Mail)
def update_mail_entry(
    mail_id: int,
    update_data: MailUpdate,
    db: Session = Depends(get_db)
):
    """Update receiver_email or receiving_time for a mail"""
    return mail_crud.update_mail(db, mail_id, update_data)



# # NEW ENDPOINT: Set Global Time
# @router.post("/set_global_time", response_model=SetGlobalTimeResponse)
# def set_global_time(
#     request: SetGlobalTimeRequest,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     """
#     Set global time for a company. Only superuser or admin can set global time.
#     Returns 11:30 as the global time if user has permission, otherwise denies access.
#     """
    
    
#     # Check if user has permission using the utility function
#     if not can_set_global_time(current_user.role):
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN, 
#             detail="You are not allowed to set the global time. Only superuser or admin can perform this action."
#         )
    
#     # Validate time format (basic validation)
#     try:
#         # Parse time to validate format
#         time_parts = request.global_time.split(":")
#         if len(time_parts) != 2:
#             raise ValueError("Invalid time format")
        
#         hours = int(time_parts[0])
#         minutes = int(time_parts[1])
        
#         if not (0 <= hours <= 23) or not (0 <= minutes <= 59):
#             raise ValueError("Invalid time values")
            
#     except (ValueError, IndexError):
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Invalid time format. Please use HH:MM format (24-hour)"
#         )
    
#     # For now, we're returning a fixed time as requested (11:30)
#     # In a real implementation, you might want to store this in the database
#     global_time_response = "11:30"
    
#     # You can add logic here to store the global time in database if needed
#     # mail_crud.set_company_global_time(db, request.company_id, global_time_response)
    
#     print(f"Global time set by {current_user.role} user (ID: {current_user.id}) for company {request.company_id}: {global_time_response}")
    
#     return SetGlobalTimeResponse(
#         message=f"Global time successfully set to {global_time_response} for company {request.company_id}",
#         global_time=global_time_response,
#         company_id=request.company_id,
#         user_role=current_user.role
#     )



# In your endpoint where you are setting the global time
@router.post("/set_global_time", response_model=SetGlobalTimeResponse)
def set_global_time(
    request: SetGlobalTimeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Set global time for a company. Updates the receiving time for all mail records 
    associated with the company_id. Only superuser or admin can set global time.
    """
    
    # Check if user has permission using the utility function
    if not can_set_global_time(current_user.role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="You are not allowed to set the global time. Only superuser or admin can perform this action."
        )
    
    # Validate time format (basic validation)
    try:
        # Parse time to validate format
        time_parts = request.global_time.split(":")
        if len(time_parts) != 2:
            raise ValueError("Invalid time format")
        
        hours = int(time_parts[0])
        minutes = int(time_parts[1])
        
        if not (0 <= hours <= 23) or not (0 <= minutes <= 59):
            raise ValueError("Invalid time values")
            
        # Convert to a time object
        receiving_time = datetime.strptime(request.global_time, "%H:%M").time()
    
    except (ValueError, IndexError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid time format. Please use HH:MM format (24-hour)"
        )
    
    # Set the receiving time for all mails associated with the company_id
    updated_mails = mail_crud.update_receiving_time_for_company(
        db=db,
        company_id=request.company_id,  # Use company_id to find all related mails
        receiving_time=receiving_time  # Use the time object instead of the string
    )
    
    global_time_response = request.global_time  # Use the provided global time

    print(f"Global time set by {current_user.role} user (ID: {current_user.id}) for company {request.company_id}: {global_time_response}")
    
    return SetGlobalTimeResponse(
        message=f"Global time successfully set to {global_time_response} for company {request.company_id}",
        global_time=global_time_response,
        company_id=request.company_id,
        user_role=current_user.role
    )


@router.get("/globaltime/{company_id}", response_model=str)
def get_global_time(
    company_id: int,
    db: Session = Depends(get_db),
):
    """
    Get the global time (receiving_time) for the first mail record associated with a company.
    If no record is found, returns '10:45'.
    """
    # Call the function to get the receiving time from the first mail record
    global_time = mail_crud.get_global_time_for_company(db=db, company_id=company_id)
    
    return global_time


