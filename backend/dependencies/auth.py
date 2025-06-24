# ✅ dependencies/auth.py (ONLY file you need to change)
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import datetime, timedelta
from models.users import User
from database import get_db
import os

SECRET_KEY = os.getenv("SECRET_KEY", "secret")
ALGORITHM = "HS256"

# ✅ THE ONLY CHANGE: Extended token expiration
ACCESS_TOKEN_EXPIRE_HOURS = 168  # 7 days (was probably 0.5 hours before)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/signin")

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT access token - NOW WITH 7 DAY EXPIRATION"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # ✅ CHANGED: From minutes to hours (7 days instead of ~30 minutes)
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user