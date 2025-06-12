from sqlalchemy.orm import Session
from models.stores import Store
from schemas.stores import StoreCreate

def create_store(db: Session, store: StoreCreate):
    db_store = Store(**store.dict())
    db.add(db_store)
    db.commit()
    db.refresh(db_store)
    return db_store

def get_store(db: Session, store_id: int):
    return db.query(Store).filter(Store.id == store_id).first()

def get_stores(db: Session):
    return db.query(Store).all()
