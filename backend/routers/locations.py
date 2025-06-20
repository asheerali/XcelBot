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
    print("Creating store:", store)
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

@router.put("/{store_id}", response_model=Store)
def update_store(store_id: int, store: StoreCreate, db: Session = Depends(get_db)):
    updated_store = store_crud.update_store(db, store_id, store)
    if not updated_store:
        raise HTTPException(status_code=404, detail="Store not found")
    return updated_store

@router.delete("/{store_id}")
def delete_store(store_id: int, db: Session = Depends(get_db)):
    success = store_crud.delete_store(db, store_id)
    if not success:
        raise HTTPException(status_code=404, detail="Store not found")
    return {"detail": "Store deleted successfully"}
