# crud/user_location.py

from sqlalchemy.orm import Session
from models.user_location import UserLocation
from schemas.user_location import UserLocationCreate

def create_user_location(db: Session, data: UserLocationCreate):
    record = UserLocation(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def delete_all_user_locations(db: Session, user_id: int):
    db.query(UserLocation).filter(UserLocation.user_id == user_id).delete()
    db.commit()
