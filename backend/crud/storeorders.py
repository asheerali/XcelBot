# crud/storeorders.py
from sqlalchemy import desc, func, or_, and_
from sqlalchemy.orm import Session
from models.storeorders import StoreOrders
from schemas.storeorders import StoreOrdersCreate, StoreOrdersUpdate
from typing import List, Optional, Union
from sqlalchemy.orm.attributes import flag_modified
from datetime import datetime


def create_storeorders(db: Session, obj_in: StoreOrdersCreate):
    """Create a new store orders record"""
    # Convert Pydantic model to dict, created_at will be auto-set by SQLAlchemy default
    obj_data = obj_in.dict(exclude_unset=True)
    # Remove created_at if it's None to let SQLAlchemy handle the default
    if 'created_at' in obj_data and obj_data['created_at'] is None:
        del obj_data['created_at']
    
    db_obj = StoreOrders(**obj_data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj



def get_storeorders(db: Session, storeorders_id: int):
    """Get a store orders record by ID"""
    return db.query(StoreOrders).filter(StoreOrders.id == storeorders_id).first()

def get_all_storeorders(db: Session, skip: int = 0, limit: int = 100):
    """Get all store orders records with pagination"""
    return db.query(StoreOrders).offset(skip).limit(limit).all()

def get_storeorders_by_company(db: Session, company_id: int, skip: int = 0, limit: int = 100):
    """Get store orders records by company ID with pagination"""
    return db.query(StoreOrders).filter(StoreOrders.company_id == company_id).offset(skip).limit(limit).all()



def get_storeorders_by_company_current_date(db: Session, company_id: int):
    """Get all store orders for company from current date (prioritizing updated_at over created_at)"""
    current_date = datetime.today().date()
    return db.query(StoreOrders).filter(
        StoreOrders.company_id == company_id,
        or_(
            # If updated_at exists, use it for filtering
            and_(StoreOrders.updated_at.isnot(None), func.date(StoreOrders.updated_at) == current_date),
            # Otherwise, use created_at for filtering
            and_(StoreOrders.updated_at.is_(None), func.date(StoreOrders.created_at) == current_date)
        )
    ).all()
    
    
def get_storeorders_by_location(db: Session, location_id: int, skip: int = 0, limit: int = 100):
    """Get store orders records by location ID with pagination"""
    return db.query(StoreOrders).filter(StoreOrders.location_id == location_id).offset(skip).limit(limit).all()

def get_storeorders_by_company_and_location(db: Session, company_id: int, location_id: int):
    """Get store orders record by company ID and location ID (latest)"""
    return db.query(StoreOrders).filter(
        StoreOrders.company_id == company_id,
        StoreOrders.location_id == location_id
    ).order_by(StoreOrders.updated_at.desc()).first()
    
    
def get_all_storeorders_by_company_and_location(db: Session, company_id: int, location_id: int):
    """Get store orders record by company ID and location ID (latest)"""
    return db.query(StoreOrders).filter(
        StoreOrders.company_id == company_id,
        StoreOrders.location_id == location_id
    ).order_by(StoreOrders.updated_at.desc()).all()
        

def get_recent_storeorders_by_company_and_location(db: Session, 
                                                   company_id: int, 
                                                   location_id: int, 
                                                   limit: Union[int, str] = 7):
    """Get the most recent store orders records by company ID and location ID"""
    print("Fetching recent store orders for company:", company_id, "and location:", location_id, "with limit:", limit)
    if limit == "all":
        # If limit is "all", return all records without limit
        return db.query(StoreOrders).filter(
            StoreOrders.company_id == company_id,
            StoreOrders.location_id == location_id
        ).order_by(
            desc(func.coalesce(StoreOrders.updated_at, StoreOrders.created_at))
        ).all()
    else:    
        return db.query(StoreOrders).filter(
            StoreOrders.company_id == company_id,
            StoreOrders.location_id == location_id
        ).order_by(
            desc(func.coalesce(StoreOrders.updated_at, StoreOrders.created_at))
        ).limit(limit).all()
        
        



def update_storeorders(db: Session, storeorders_id: int, obj_in: StoreOrdersUpdate, updated_at_date: Optional[datetime] = None):
    """Update items_ordered for an existing store orders record"""
    try:
        db_obj = db.query(StoreOrders).filter(StoreOrders.id == storeorders_id).first()
        if db_obj:
            print(f"Found store orders object with ID: {storeorders_id}")
            print(f"Current items_ordered keys: {list(db_obj.items_ordered.keys()) if db_obj.items_ordered else 'None'}")
            
            # Move current items_ordered to prev_items_ordered
            db_obj.prev_items_ordered = db_obj.items_ordered.copy() if db_obj.items_ordered else None
            
            # Update with new items_ordered
            db_obj.items_ordered = obj_in.items_ordered
            
            # Update the updated_at timestamp
            # db_obj.updated_at = datetime.utcnow()
            # Use client-provided updated_date if available, else use server's UTC time
            db_obj.updated_at = updated_at_date
            
            # Mark the objects as dirty (important for JSON fields)
            flag_modified(db_obj, "items_ordered")
            flag_modified(db_obj, "prev_items_ordered")
            
            print(f"Updated items_ordered keys: {list(obj_in.items_ordered.keys())}")
            print(f"Previous items_ordered moved to prev_items_ordered")
            
            # Commit the changes
            db.commit()
            print("Database commit successful")
            
            # Refresh the object to get the latest state
            db.refresh(db_obj)
            print("Object refresh successful")
            
            return db_obj
        else:
            print(f"No store orders found with ID: {storeorders_id}")
            return None
            
    except Exception as e:
        print(f"Error in update_storeorders: {str(e)}")
        db.rollback()  # Rollback on error
        raise e



def update_storeorders_by_location(db: Session, company_id: int, location_id: int, obj_in: StoreOrdersUpdate):
    """Update items_ordered for store orders by company and location"""
    try:
        db_obj = db.query(StoreOrders).filter(
            StoreOrders.company_id == company_id,
            StoreOrders.location_id == location_id
        ).order_by(StoreOrders.updated_at.desc()).first()
        
        if db_obj:
            print(f"Found store orders for company {company_id}, location {location_id}")
            print(f"Current items_ordered keys: {list(db_obj.items_ordered.keys()) if db_obj.items_ordered else 'None'}")
            
            # Move current items_ordered to prev_items_ordered
            db_obj.prev_items_ordered = db_obj.items_ordered.copy() if db_obj.items_ordered else None
            
            # Update with new items_ordered
            db_obj.items_ordered = obj_in.items_ordered
            
            # Update the updated_at timestamp
            db_obj.updated_at = datetime.utcnow()
            
            # Mark the objects as dirty (important for JSON fields)
            flag_modified(db_obj, "items_ordered")
            flag_modified(db_obj, "prev_items_ordered")
            
            print(f"Updated items_ordered keys: {list(obj_in.items_ordered.keys())}")
            print(f"Previous items_ordered moved to prev_items_ordered")
            
            # Commit the changes
            db.commit()
            print("Database commit successful")
            
            # Refresh the object to get the latest state
            db.refresh(db_obj)
            print("Object refresh successful")
            
            return db_obj
        else:
            print(f"No store orders found for company {company_id}, location {location_id}")
            return None
            
    except Exception as e:
        print(f"Error in update_storeorders_by_location: {str(e)}")
        db.rollback()  # Rollback on error
        raise e

def delete_storeorders(db: Session, storeorders_id: int):
    """Delete a store orders record"""
    db_obj = db.query(StoreOrders).filter(StoreOrders.id == storeorders_id).first()
    if db_obj:
        db.delete(db_obj)
        db.commit()
        return True
    return False

def bulk_create_storeorders(db: Session, objects: List[StoreOrdersCreate]):
    """Bulk create multiple store orders records"""
    db_objects = []
    for obj in objects:
        obj_data = obj.dict(exclude_unset=True)
        # Remove created_at if it's None to let SQLAlchemy handle the default
        if 'created_at' in obj_data and obj_data['created_at'] is None:
            del obj_data['created_at']
        db_objects.append(StoreOrders(**obj_data))
    
    db.add_all(db_objects)
    db.commit()
    for obj in db_objects:
        db.refresh(obj)
    return db_objects