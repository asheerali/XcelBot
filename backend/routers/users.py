from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from crud import users as user_crud
from schemas import users as user_schema
from database import get_db
from dependencies.permissions import can_update
from dependencies.auth import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

@router.post("/", response_model=user_schema.User)
def create_user(
    background_tasks: BackgroundTasks,
    user: user_schema.UserCreate,
    db: Session = Depends(get_db),
):
    print("Creating_user:", background_tasks, user, db)
    return user_crud.create_user(db, user, background_tasks=background_tasks)


@router.get("/", response_model=list[user_schema.User])
def get_users(
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_user)
):
    return user_crud.get_users(db, current_user)


@router.get("/active", response_model=list[user_schema.User])
def get_active_users(
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_user)
):
    """Get only active users"""
    return user_crud.get_active_users(db, current_user)


@router.get("/inactive", response_model=list[user_schema.User])
def get_inactive_users(
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_user)
):
    """Get only inactive users"""
    return user_crud.get_inactive_users(db, current_user)


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

    # Permission check
    if not can_update(current_user.role, target_user.role):
        raise HTTPException(status_code=403, detail="Permission denied")

    updated_user = user_crud.update_user(db, user_id, user)
    return updated_user


@router.patch("/{user_id}/deactivate")
def deactivate_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_user)
):
    """Deactivate a user instead of deleting them"""
    target_user = user_crud.get_user(db, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Permission check
    if not can_update(current_user.role, target_user.role):
        raise HTTPException(status_code=403, detail="Permission denied")

    success = user_crud.deactivate_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deactivated successfully"}


@router.patch("/{user_id}/activate")
def activate_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_user)
):
    """Reactivate a deactivated user"""
    target_user = user_crud.get_user(db, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Permission check
    if not can_update(current_user.role, target_user.role):
        raise HTTPException(status_code=403, detail="Permission denied")

    success = user_crud.activate_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User activated successfully"}


@router.delete("/{user_id}")
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_user)
):
    """Hard delete a user (use with caution)"""
    target_user = user_crud.get_user(db, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Permission check
    if not can_update(current_user.role, target_user.role):
        raise HTTPException(status_code=403, detail="Permission denied")

    success = user_crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted successfully"}