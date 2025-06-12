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

router = APIRouter(prefix="/auth", tags=["Authentication"])

SECRET_KEY = os.getenv("SECRET_KEY", "secret")  # Replace in prod
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


# ---------------------- SCHEMAS ----------------------
class Token(BaseModel):
    access_token: str
    token_type: str


class SignInInput(BaseModel):
    email: EmailStr
    password: str


# ---------------------- AUTH UTILS ----------------------
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ---------------------- ROUTES ----------------------

@router.post("/signup", response_model=Token)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
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


@router.post("/signin", response_model=Token)
def signin(credentials: SignInInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not bcrypt.verify(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


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

