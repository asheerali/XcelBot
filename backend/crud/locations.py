from sqlalchemy.orm import Session
from models.locations import Store
from schemas.locations import StoreCreate
from models.company_locations import CompanyLocation  # Add this import

def create_store(db: Session, store: StoreCreate) -> Store:
    db_store = Store(**store.model_dump())
    db.add(db_store)
    db.commit()
    db.refresh(db_store)

    # Add entry to company_locations
    company_location = CompanyLocation(
        company_id=db_store.company_id,
        location_id=db_store.id
    )
    db.add(company_location)
    db.commit()

    return db_store
def get_stores(db: Session):
    return db.query(Store).all()

def get_store(db: Session, store_id: int):
    return db.query(Store).filter(Store.id == store_id).first()

def update_store(db: Session, store_id: int, store_data: StoreCreate):
    print("Updating store:", store_data)
    db_store = get_store(db, store_id)
    if not db_store:
        return None
    for key, value in store_data.model_dump().items():
        setattr(db_store, key, value)
    db.commit()
    db.refresh(db_store)
    return db_store

# def delete_store(db: Session, store_id: int):
#     db_store = get_store(db, store_id)
#     if not db_store:
#         return False
#     db.delete(db_store)
#     db.commit()
#     return True

def delete_store(db: Session, store_id: int):
    db_store = get_store(db, store_id)
    if not db_store:
        return False

    # Manually delete from company_locations
    db.query(CompanyLocation).filter(CompanyLocation.location_id == store_id).delete()

    db.delete(db_store)
    db.commit()
    return True
