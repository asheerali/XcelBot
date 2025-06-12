from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.stores import Store, StoreCreate
from crud import stores as store_crud
from app import get_db

router = APIRouter(
    prefix="/stores",
    tags=["Stores"]
)

@router.post("/", response_model=Store)
def create_store(store: StoreCreate, db: Session = Depends(get_db)):
    return store_crud.create_store(db, store)

@router.get("/", response_model=list[Store])
def get_stores(db: Session = Depends(get_db)):
    return store_crud.get_stores(db)
