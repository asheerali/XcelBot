import base64
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.hash import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta

from database import get_db
from models.users import User
from schemas.users import UserCreate
import os
import secrets

from models.email_config import fm
from fastapi_mail import MessageSchema, MessageType

from starlette.background import BackgroundTasks
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks


from models.uploaded_files import UploadedFile
from models.file_permissions import FilePermission
from routers.excel_upload_return import process_dashboard_data
from models_pydantic import ExcelUploadRequest  # if not already imported

router = APIRouter(prefix="/auth", tags=["Authentication"])

SECRET_KEY = os.getenv("SECRET_KEY", "secret")  # Replace in prod
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 2000
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


# # ---------------------- SCHEMAS ----------------------
# class Token(BaseModel):
#     access_token: str
#     token_type: str


class SignInInput(BaseModel):
    email: EmailStr
    password: str

# Updated Token schema to include dashboard_data
class Token(BaseModel):
    access_token: str
    token_type: str
    dashboard_data: list = None  # Add this field

# Alternative approach - create a separate response model
class SignInResponse(BaseModel):
    access_token: str
    token_type: str
    dashboard_data: list = None



sales_wide_dummy = {
    "table1": [],
    "table2": [],
    "table3": [],
    "table4": [],
    "table5": [],
    "table6": [],
    "table7": [],
    "locations": [],
    "years": [],
    "dates": [],
    "fileLocation": [],
    "dashboardName": "Sales Wide",
    "fileName": [],
    "data": "Sales Wide Dashboard data."
}


financials_dummy = {
    "table1": [],
    "table2": [],
    "table3": [],
    "table4": [],
    "table5": [],
    "table6": [],
    "table7": [],
    "table8": [],
    "table9": [],
    "table10": [],
    "table11": [],
    "table12": [],
    "table13": [],
    "table14": [],
    "table15": [],
    "table16": [],
    "fileName": [],
    "locations": [],
    "years": [],
    "dates": [],
    "dashboardName": "Financials",
    "data": "Financial Dashboard is not yet implemented."
}

pmix_dummy = {
    "table1": [],
    "table2": [],
    "table3": [],
    "table4": [],
    "table5": [],
    "table6": [],
    "table7": [],
    "table8": [],
    "table9": [],
    "table10": [],
    "table11": [],
    "table12": [],
    "table13": [],
    "locations": [],
    "servers": [],
    "categories": [],
    "dateRanges": [],
    "fileName": [],
    "dashboardName": "Product Mix",
    "data": "Dashboard is not yet implemented."
}

sales_split_dummy = {
    "table1": [],
    "table2":[],
    "table3": [],
    "table4": [],
    "table5": [],
    "table6": [],
    "table7": [],
    "table8": [],
    "table9": [],
    "table10": [],
    "table11": [],
    "locations": [],
    "categories": [],
    "dashboardName": "Sales Split",
    "fileName": [],
    "data": f"Sales Split Dashboard is not yet implemented."
}
dummy_dashboard_data = [sales_wide_dummy, financials_dummy, pmix_dummy,sales_split_dummy]


# ---------------------- AUTH UTILS ----------------------
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=2000))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ---------------------- ROUTES ----------------------

@router.post("/signup", response_model=Token)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    print("Received data:", user_data)
    
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = bcrypt.hash(user_data.password)
    new_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone_number=user_data.phone_number,
        password_hash=hashed_pw,
        role=user_data.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.email})
    return {"access_token": token, "token_type": "bearer"}


# @router.post("/signin", response_model=Token)
# def signin(credentials: SignInInput, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.email == credentials.email).first()
#     if not user or not bcrypt.verify(credentials.password, user.password_hash):
#         raise HTTPException(status_code=401, detail="Invalid credentials")
    
#     token = create_access_token(data={"sub": user.email})
#     return {"access_token": token, "token_type": "bearer"}


# @router.post("/signin", response_model=Token)
# def signin(credentials: SignInInput, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.email == credentials.email).first()
#     if not user or not bcrypt.verify(credentials.password, user.password_hash):
#         raise HTTPException(status_code=401, detail="Invalid credentials")


#     # Print user role when they sign in
#     print(f"User {user.email} signed in with role: {user.role}")

#     # Generate token
#     token = create_access_token(data={"sub": user.email})

#     # Determine accessible file based on user role
#     file_record = None
    
#     if user.role == "superuser":
#         # Superuser can access the most recent file from ANY user
#         file_record = db.query(UploadedFile).order_by(UploadedFile.id.desc()).first()
#         print(f"User {user.email} signed in with role: {user.role}", "accessing file:", file_record.file_name)
        
        
        
#     else:
#         # For non-superusers (manager and lower roles)
#         # First, check if they have uploaded any files themselves
#         user_uploaded_file = (
#             db.query(UploadedFile)
#             .filter(UploadedFile.uploader_id == user.id)
#             .order_by(UploadedFile.id.desc())
#             .first()
#         )
        
#         if user_uploaded_file:
#             file_record = user_uploaded_file
#         else:
#             # If no files uploaded by user, check for files they have permission to access
#             permitted_file = (
#                 db.query(UploadedFile)
#                 .join(FilePermission, FilePermission.file_id == UploadedFile.id)
#                 .filter(FilePermission.user_id == user.id)
#                 .order_by(UploadedFile.id.desc())
#                 .first()
#             )
#             file_record = permitted_file

#     # If no accessible file found, return token with null dashboard_data
#     # if file_record is None:
#     #     return {
#     #         "access_token": token,
#     #         "token_type": "bearer",
#     #         "dashboard_data": None
#     #     }
#         # If no accessible file found, return token with dummy dashboard_data
#     if file_record is None:
#         return {
#         "access_token": token,
#         "token_type": "bearer",
#         "dashboard_data": dummy_dashboard_data
#     }


#     # Read file from disk
#     file_path = os.path.join("uploads", file_record.file_name)
   
#     # print("file path:", file_path)
    
#     if not os.path.exists(file_path):
#         print("it is failing to find the file:", file_path)
#         return {
#             "access_token": token,
#             "token_type": "bearer",
#             "dashboard_data": dummy_dashboard_data
#         }
#     try:
#         print("trying to Reading file content...")
#         with open(file_path, "rb") as f:
#             file_content = f.read()
#         print("file path:", file_path, "file content length:", len(file_content))
#         # Build minimal request structure for processing
#         dummy_request = ExcelUploadRequest(
#             fileName=file_record.file_name,
#             fileContent=base64.b64encode(file_content).decode("utf-8"),
#             dashboard=file_record.dashboard_name,
#             location="All",  # or set default/fallback filters
#             startDate=None,
#             endDate=None,
#             category=None,
#             server=None,
#         )

#         dashboard_data = process_dashboard_data(dummy_request, file_content, file_record.file_name)
        
#     except Exception as e:
#         print(f"Error processing dashboard data: {str(e)}")
#         dashboard_data = dummy_dashboard_data

#     return {
#         "access_token": token,
#         "token_type": "bearer",
#         "dashboard_data": dashboard_data
#     }


# Then update your signin endpoint
@router.post("/signin", response_model=SignInResponse)  # Change this line
def signin(credentials: SignInInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not bcrypt.verify(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Print user role when they sign in
    print(f"User {user.email} signed in with role: {user.role}")

    # Generate token
    token = create_access_token(data={"sub": user.email},
                                 expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    # Determine accessible file based on user role
    file_record = None
    
    try:
        if user.role == "superuser":
            # Superuser can access the most recent file from ANY user
            file_record = db.query(UploadedFile).order_by(UploadedFile.id.desc()).first()
            print(f"Superuser {user.email} accessing file: {file_record.file_name if file_record else 'None'}")
        else:
            print(f"Non-superuser {user.email} looking for accessible files...")
            
            # For non-superusers (manager and lower roles)
            # First, check if they have uploaded any files themselves
            user_uploaded_file = (
                db.query(UploadedFile)
                .filter(UploadedFile.uploader_id == user.id)
                .order_by(UploadedFile.id.desc())
                .first()
            )
            
            if user_uploaded_file:
                file_record = user_uploaded_file
                print(f"Found user's own uploaded file: {file_record.file_name}")
            else:
                print("No files uploaded by user, checking permissions...")
                # If no files uploaded by user, check for files they have permission to access
                permitted_file = (
                    db.query(UploadedFile)
                    .join(FilePermission, FilePermission.file_id == UploadedFile.id)
                    .filter(FilePermission.user_id == user.id)
                    .order_by(UploadedFile.id.desc())
                    .first()
                )
                
                if permitted_file:
                    file_record = permitted_file
                    print(f"Found permitted file: {file_record.file_name}")
                else:
                    print("No permitted files found")

        # If no accessible file found, return token with dummy dashboard_data
        if file_record is None:
            print(f"No accessible file found for user {user.email}, returning dummy data", dummy_dashboard_data)
            return SignInResponse(  # Use the new response model
                access_token=token,
                token_type="bearer",
                dashboard=dummy_dashboard_data
            )

        # Read file from disk
        file_path = os.path.join("uploads", file_record.file_name)
        print(f"Attempting to read file: {file_path}")
        
        if not os.path.exists(file_path):
            print(f"File not found on disk: {file_path}, returning dummy data")
            return SignInResponse(
                access_token=token,
                token_type="bearer",
                dashboard_data=dummy_dashboard_data
            )

        print("Reading file content...")
        with open(file_path, "rb") as f:
            file_content = f.read()
        print(f"File content length: {len(file_content)}")
        
        # Build minimal request structure for processing
        dummy_request = ExcelUploadRequest(
            fileName=file_record.file_name,
            fileContent=base64.b64encode(file_content).decode("utf-8"),
            dashboard=file_record.dashboard_name,
            location="All",  # or set default/fallback filters
            startDate=None,
            endDate=None,
            category=None,
            server=None,
        )

        dashboard_data = process_dashboard_data(dummy_request, file_content, file_record.file_name)
        print("Successfully processed dashboard data")
        
        return SignInResponse(
            access_token=token,
            token_type="bearer",
            dashboard_data=dashboard_data
        )
        
    except Exception as e:
        print(f"Error in signin process: {str(e)}")
        print("Returning dummy data due to error")
        return SignInResponse(
            access_token=token,
            token_type="bearer",
            dashboard_data=dummy_dashboard_data
        )

# In-memory store (replace with Redis/DB in prod)
reset_tokens = {}

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordInput(BaseModel):
    token: str
    new_password: str

reset_tokens = {}


from fastapi import Request

@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None,
    fastapi_request: Request = None  # gets the domain from the request
):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = secrets.token_urlsafe(32)
    reset_tokens[token] = user.email

    origin = fastapi_request.headers.get("origin", "http://localhost:5173")
    reset_link = f"{origin}/reset-password?token={token}"


    # reset_link = f"http://localhost:3000/reset-password?token={token}"  # Replace with your actual frontend link

    message = MessageSchema(
        subject="Reset Your Password",
        recipients=[user.email],
        body=f"""
Hello {user.first_name},

We received a request to reset your password.

Please click the link below to reset your password:

{reset_link}

or you can copy and paste the folowing token into the reset password form:
{token}
This link will expire in 30 minutes.

If you didn’t request this, just ignore this email.

Regards,
XcelBot Team
""",
        subtype=MessageType.plain
    )

    background_tasks.add_task(fm.send_message, message)
    return {"message": "Password reset email sent successfully"}


@router.post("/reset-password")
def reset_password(data: ResetPasswordInput, db: Session = Depends(get_db)):
    email = reset_tokens.get(data.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()
    user.password_hash = bcrypt.hash(data.new_password)
    db.commit()
    del reset_tokens[data.token]
    return {"message": "Password updated successfully"}

