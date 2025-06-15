from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.locations import Store, StoreCreate
from crud import locations as store_crud
from database import get_db

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

@router.get("/{store_id}", response_model=Store)
def get_store(store_id: int, db: Session = Depends(get_db)):
    store = store_crud.get_store(db, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.locations import Store, StoreCreate
from crud import locations as store_crud
from database import get_db

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

@router.get("/{store_id}", response_model=Store)
def get_store(store_id: int, db: Session = Depends(get_db)):
    store = store_crud.get_store(db, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store
