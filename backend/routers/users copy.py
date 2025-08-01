# routers/users.py

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks  # ✅ Add BackgroundTasks
from sqlalchemy.orm import Session
from crud import users as user_crud
from schemas import users as user_schema
from database import get_db
from dependencies.permissions import can_update
from dependencies.auth import get_current_user  # ✅ import your auth logic

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

# @router.post("/", response_model=user_schema.User)
# def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
#     return user_crud.create_user(db, user)

@router.post("/", response_model=user_schema.User)
def create_user(
    background_tasks: BackgroundTasks,
    user: user_schema.UserCreate,
    db: Session = Depends(get_db),
):
    return user_crud.create_user(db, user, background_tasks=background_tasks)


# @router.get("/", response_model=list[user_schema.User])
# def get_users(db: Session = Depends(get_db)):
#     return user_crud.get_users(db)

@router.get("/", response_model=list[user_schema.User])
def get_users(
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_user)  # Add this
):
    return user_crud.get_users(db, current_user)  # Pass current_user

@router.get("/{user_id}", response_model=user_schema.User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = user_crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=user_schema.User)
def update_user(
    user_id: int,
    user: user_schema.UserCreate,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_user)
):
    target_user = user_crud.get_user(db, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    #  Permission check
    if not can_update(current_user.role, target_user.role):
        raise HTTPException(status_code=403, detail="Permission denied")

    updated_user = user_crud.update_user(db, user_id, user)
    return updated_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    success = user_crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted successfully"}
