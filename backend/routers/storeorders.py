# routers/storeorders.py
from collections import defaultdict
import platform
import traceback
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from models.locations import Store
from models.companies import Company
from crud import storeorders as storeorders_crud
from schemas import storeorders as storeorders_schema
from database import get_db
from crud.locations import get_store
from pydantic import BaseModel
from typing import Dict, Any
import pandas as pd
from schemas import storeorders as storeorders_schema
from models.users import User
from dependencies.auth import get_current_active_user
from fastapi import BackgroundTasks
from utils.email import send_order_confirmation_email, send_production
from crud.users import get_user 
from fastapi import Query
from datetime import datetime, timedelta
from pydantic import BaseModel
from models.mails import Mail  # Add this import for the Mail model
from typing import Optional, List, Dict, Any


class OrderItemsRequest(BaseModel):
    company_id: Optional[int] = None
    location_id: Optional[int] = None
    items: Optional[List[Dict[str, Any]]] = None
    email_order: Optional[bool] = None
    startDate: Optional[str] = None  # Date in ISO format, e.g., "2023-10-01T12:00:00Z"
    endDate: Optional[str] = None  # Date in ISO format, e.g., "2023-10-01T12:00:00Z"
    order_date: Optional[str] = None  # Date in ISO format, e.g., "2023-10-01T12:00:00Z"
    startDateStr: Optional[str] = None  # Date in string format, e.g., "2023-10-01"
    endDateStr: Optional[str] = None  # Date in string format, e.g., "2023-10-01"
    start_date: Optional[str] = None  # Date in ISO format, e.g., "2023-10-01T12:00:00Z"
    end_date: Optional[str] = None  # Date in ISO format, e.g., "2023-10-01T12:00:00Z"

    # Add other fields as neede

 
router = APIRouter(
    prefix="/api/storeorders",
    tags=["Store Orders"]
)

# class UpdateStoreOrdersRequest(BaseModel):
#     company_id: int
#     location_id: int
#     items_ordered: Dict[str, Any]
#     order_id: Optional[int] = None  # Optional order ID to update, if not provided a new order will be created

class UpdateStoreOrdersRequest(BaseModel):
    order_id: int
    company_id: int
    location_id: int
    items: Optional[List[Dict[str, Any]]] = None
    items_ordered: Optional[Dict[str, Any]] = None
    total_amount: Optional[Any] = None
    email_order: Optional[Any] = False
    updated_date: Optional[str] = None

@router.get("/details")
def get_storeorders_details_alt(db: Session = Depends(get_db)):
    """Get details of all store orders with company and location info"""
    try:
        storeorders = storeorders_crud.get_all_storeorders(db)
        
        if not storeorders:
            return {"message": "Database is empty", "data": []}
        
        # Get all unique company and location IDs
        company_ids = list(set(order.company_id for order in storeorders if order.company_id))
        location_ids = list(set(order.location_id for order in storeorders if order.location_id))
        
        # Fetch companies and locations in batch
        companies = db.query(Company).filter(Company.id.in_(company_ids)).all()
        locations = db.query(Store).filter(Store.id.in_(location_ids)).all()

        # Create lookup dictionaries
        company_lookup = {comp.id: comp.name for comp in companies}
        location_lookup = {loc.id: loc.name for loc in locations}
        
        details = []
        for order in storeorders:
            # Format datetime for display
            readable_created_date = order.created_at.strftime('%Y-%m-%d %H:%M:%S') if order.created_at else "Unknown"
            readable_updated_date = order.updated_at.strftime('%Y-%m-%d %H:%M:%S') if order.updated_at else "Unknown"
            
            details.append({
                "id": order.id,
                "company_id": order.company_id,
                "company_name": company_lookup.get(order.company_id, "Unknown"),
                "location_id": order.location_id,
                "location_name": location_lookup.get(order.location_id, "Unknown"),
                "created_at": order.created_at.isoformat() if order.created_at else None,
                "created_at_readable": readable_created_date,
                "updated_at": order.updated_at.isoformat() if order.updated_at else None,
                "updated_at_readable": readable_updated_date,
                "items_ordered": order.items_ordered,
                "prev_items_ordered": order.prev_items_ordered,
            })

        return {"message": "Store orders details fetched successfully", "data": details}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching store orders details: {str(e)}")

@router.get("/details/{company_id}")
def get_storeorders_details_by_company(company_id: int, db: Session = Depends(get_db)):
    """Get details of all store orders for a specific company"""
    try:
        storeorders = storeorders_crud.get_storeorders_by_company(db, company_id)
        
        if not storeorders:
            return {"message": "No store orders found for this company", "data": []}
        
        # Get all unique company and location IDs
        company_ids = list(set(order.company_id for order in storeorders if order.company_id))
        location_ids = list(set(order.location_id for order in storeorders if order.location_id))
        
        # Fetch companies and locations in batch
        companies = db.query(Company).filter(Company.id.in_(company_ids)).all()
        locations = db.query(Store).filter(Store.id.in_(location_ids)).all()

        # Create lookup dictionaries
        company_lookup = {comp.id: comp.name for comp in companies}
        location_lookup = {loc.id: loc.name for loc in locations}
        
        # Initialize aggregation data
        total_orders = len(storeorders)
        locations_with_orders = len(set(order.location_id for order in storeorders))
        
        details = []
        location_aggregates = {}
        
        for order in storeorders:
            # Format datetime for display
            readable_created_date = order.created_at.strftime('%Y-%m-%d %H:%M:%S') if order.created_at else "Unknown"
            readable_updated_date = order.updated_at.strftime('%Y-%m-%d %H:%M:%S') if order.updated_at else "Unknown"
            
            # Aggregate by location
            location_name = location_lookup.get(order.location_id, "Unknown")
            if location_name not in location_aggregates:
                location_aggregates[location_name] = {
                    "location_id": order.location_id,
                    "total_orders": 0,
                    "latest_order_date": None,
                    "has_previous_orders": False
                }
            
            location_aggregates[location_name]["total_orders"] += 1
            if not location_aggregates[location_name]["latest_order_date"] or order.updated_at > datetime.fromisoformat(location_aggregates[location_name]["latest_order_date"]):
                location_aggregates[location_name]["latest_order_date"] = order.updated_at.isoformat()
            
            if order.prev_items_ordered:
                location_aggregates[location_name]["has_previous_orders"] = True
            
            details.append({
                "id": order.id,
                "company_id": order.company_id,
                "company_name": company_lookup.get(order.company_id, "Unknown"),
                "location_id": order.location_id,
                "location_name": location_name,
                "created_at": order.created_at.isoformat() if order.created_at else None,
                "created_at_readable": readable_created_date,
                "updated_at": order.updated_at.isoformat() if order.updated_at else None,
                "updated_at_readable": readable_updated_date,
                "items_ordered": order.items_ordered,
                "prev_items_ordered": order.prev_items_ordered,
            })
        
        # Convert location aggregates to list
        location_summary = []
        for location_name, aggregates in location_aggregates.items():
            location_summary.append({
                "location_name": location_name,
                "location_id": aggregates["location_id"],
                "total_orders": aggregates["total_orders"],
                "latest_order_date": aggregates["latest_order_date"],
                "has_previous_orders": aggregates["has_previous_orders"]
            })
        
        return {
            "message": "Store orders details fetched successfully",
            "data": details,
            "summary": {
                "total_orders": total_orders,
                "locations_with_orders": locations_with_orders,
                "company_name": company_lookup.get(company_id, "Unknown")
            },
            "location_summary": location_summary
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching store orders details: {str(e)}")

@router.get("/details/{company_id}/{location_id}")
def get_storeorders_details_by_location(
    company_id: int, 
    location_id: int, 
    db: Session = Depends(get_db)
):
    """Get store orders details by company ID and location ID"""
    
    # Get the store orders
    storeorders = storeorders_crud.get_storeorders_by_company_and_location(db, company_id, location_id)
    
    if not storeorders:
        return {"message": "Store orders not found", "data": None}
    
    # Get company and location names
    company = db.query(Company).filter(Company.id == company_id).first()
    location = db.query(Store).filter(Store.id == location_id).first()
    
    # Format datetime for display
    readable_created_date = storeorders.created_at.strftime('%Y-%m-%d %H:%M:%S') if storeorders.created_at else "Unknown"
    readable_updated_date = storeorders.updated_at.strftime('%Y-%m-%d %H:%M:%S') if storeorders.updated_at else "Unknown"
    
    data = {
        "id": storeorders.id,
        "company_id": storeorders.company_id,
        "company_name": company.name if company else "Unknown",
        "location_id": storeorders.location_id,
        "location_name": location.name if location else "Unknown",
        "created_at": storeorders.created_at.isoformat() if storeorders.created_at else None,
        "created_at_readable": readable_created_date,
        "updated_at": storeorders.updated_at.isoformat() if storeorders.updated_at else None,
        "updated_at_readable": readable_updated_date,
        "items_ordered": storeorders.items_ordered,
        "prev_items_ordered": storeorders.prev_items_ordered,
    }
    
    return {"message": "Store orders details fetched successfully", "data": data}


@router.put("/updatelocation/{storeorders_id}/{new_location_id}", response_model=storeorders_schema.StoreOrders)
def update_storeorders_location(
    storeorders_id: int,
    new_location_id: int,  # new location_id to update to
    db: Session = Depends(get_db)
):
    """Update a store orders location by ID"""
    
    # First, find the existing store orders
    storeorders = storeorders_crud.get_storeorders(db, storeorders_id)
    if not storeorders:
        raise HTTPException(status_code=404, detail="Store orders not found")
    
    # Validate that the new location belongs to the same company
    new_location = get_store(db, new_location_id)
    if not new_location:
        raise HTTPException(status_code=404, detail="New location not found")
    
    if new_location.company_id != storeorders.company_id:
        raise HTTPException(
            status_code=400, 
            detail="New location does not belong to the same company"
        )
    
    # Update the location_id to the new value
    storeorders.location_id = new_location_id
    storeorders.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(storeorders)
    return storeorders

@router.post("/updateorder")
def update_storeorders_items(
    request: UpdateStoreOrdersRequest,
    db: Session = Depends(get_db)
):
    """Update store orders items"""
    
    print("Received request to update store orders:", request)
    try:
        # Create update object
        update_obj = storeorders_schema.StoreOrdersUpdate(items_ordered=request.items_ordered)
        
        # Update by company and location
        updated_storeorders = storeorders_crud.update_storeorders_by_location(
            db, request.company_id, request.location_id, update_obj
        )
        
        if updated_storeorders:
            print("Successfully updated store orders in database")
            return {
                "status": "success", 
                "message": "Store orders updated successfully",
                "updated_at": updated_storeorders.updated_at.isoformat(),
                "id": updated_storeorders.id
            }
        else:
            raise HTTPException(status_code=404, detail="Store orders not found for the specified company and location")
        
    except Exception as e:
        print(f"Error in update_storeorders_items: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error updating store orders: {str(e)}")

@router.post("/", response_model=storeorders_schema.StoreOrders)
def create_storeorders(storeorders: storeorders_schema.StoreOrdersCreate, db: Session = Depends(get_db)):
    """Create a new store orders record"""
    return storeorders_crud.create_storeorders(db, storeorders)

@router.get("/", response_model=list[storeorders_schema.StoreOrders])
def get_storeorders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all store orders with pagination"""
    storeorders = storeorders_crud.get_all_storeorders(db, skip, limit)
    print("Store orders fetched:", len(storeorders))
    
    # Print the actual data
    for order in storeorders:
        print(f"ID: {order.id}")
        print(f"Company ID: {order.company_id}")
        print(f"Location ID: {order.location_id}")
        print(f"Items Ordered: {order.items_ordered}")
        print("---")
    return storeorders

@router.get("/{storeorders_id}", response_model=storeorders_schema.StoreOrders)
def get_storeorders_by_id(storeorders_id: int, db: Session = Depends(get_db)):
    """Get a specific store orders by ID"""
    storeorders = storeorders_crud.get_storeorders(db, storeorders_id)
    print("Store orders fetched by ID:", storeorders)
    if not storeorders:
        raise HTTPException(status_code=404, detail="Store orders not found")
    return storeorders

@router.get("/{storeorders_id}/items")
def get_storeorders_items(storeorders_id: int, db: Session = Depends(get_db)):
    """Get items_ordered from a store orders as dict"""
    storeorders = storeorders_crud.get_storeorders(db, storeorders_id)
    if not storeorders:
        raise HTTPException(status_code=404, detail="Store orders not found")
    return {
        "items_ordered": storeorders.items_ordered,
        "prev_items_ordered": storeorders.prev_items_ordered
    }

@router.get("/company/{company_id}", response_model=list[storeorders_schema.StoreOrders])
def get_company_storeorders(
    company_id: int, 
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all store orders for a company"""
    return storeorders_crud.get_storeorders_by_company(db, company_id, skip, limit)

@router.get("/location/{location_id}", response_model=list[storeorders_schema.StoreOrders])
def get_location_storeorders(
    location_id: int, 
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all store orders for a location"""
    return storeorders_crud.get_storeorders_by_location(db, location_id, skip, limit)

@router.get("/company/{company_id}/location/{location_id}", response_model=storeorders_schema.StoreOrders)
def get_storeorders_by_company_location(
    company_id: int,
    location_id: int,
    db: Session = Depends(get_db)
):
    """Get store orders by company ID and location ID"""
    storeorders = storeorders_crud.get_storeorders_by_company_and_location(db, company_id, location_id)
    if not storeorders:
        raise HTTPException(status_code=404, detail="Store orders not found")
    return storeorders

@router.put("/{storeorders_id}", response_model=storeorders_schema.StoreOrders)
def update_storeorders(storeorders_id: int, items_data: storeorders_schema.StoreOrdersUpdate, db: Session = Depends(get_db)):
    """Update items_ordered for an existing store orders"""
    updated = storeorders_crud.update_storeorders(db, storeorders_id, items_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Store orders not found")
    return updated

@router.delete("/{storeorders_id}")
def delete_storeorders(storeorders_id: int, db: Session = Depends(get_db)):
    """Delete a store orders record"""
    success = storeorders_crud.delete_storeorders(db, storeorders_id)
    if not success:
        raise HTTPException(status_code=404, detail="Store orders not found")
    return {"detail": "Store orders deleted successfully"}

@router.post("/bulk", response_model=list[storeorders_schema.StoreOrders])
def bulk_create_storeorders(storeorders: list[storeorders_schema.StoreOrdersCreate], db: Session = Depends(get_db)):
    """Bulk create multiple store orders records"""
    return storeorders_crud.bulk_create_storeorders(db, storeorders)
    

# Modified routers/storeorders.py - Update the create_new_order_items function
@router.post("/orderitems")
def create_new_order_items(
    request: OrderItemsRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create new store orders entry every time"""
    print("Received request to create new order:", request.model_dump())
    print("dates", request.start_date, request.end_date)

    try:
        # Query and print first email entry for this company
        first_company_email = db.query(Mail).filter(Mail.company_id == request.company_id).first()
        
        users_mails =  db.query(Mail).filter(Mail.company_id == request.company_id).all()


        # Create a list of emails from users mails
        user_emails = [mail.receiver_email for mail in users_mails]

        print(f"User emails for company_ID {user_emails}" )
        # Extract global time from the first email entry
        global_time = None
        if first_company_email and first_company_email.receiving_time:
            global_time = first_company_email.receiving_time
            print(f"\n=== GLOBAL TIME SET FROM COMPANY EMAIL ===")
            print(f"Global time extracted: {global_time}")
        
        print(f"\n=== FIRST EMAIL ENTRY FOR COMPANY ID {request.company_id} ===")
        if first_company_email:
            print(f"Found first email for company ID {request.company_id}:")
            print(f"  - ID: {first_company_email.id}")
            print(f"    Receiver Name: {first_company_email.receiver_name}")
            print(f"    Receiver Email: {first_company_email.receiver_email}")
            print(f"    Receiving Time: {first_company_email.receiving_time}")
            print(f"    Company ID: {first_company_email.company_id}")
        else:
            print(f"No email entries found for company ID {request.company_id}")
        print("=" * 50 + "\n")

        # Default created_at is the order_date or current time
        order_date = pd.to_datetime(request.order_date).replace(tzinfo=None) if request.order_date else datetime.utcnow()
        created_at = order_date  # default

        # Handle start_date logic first
        if request.start_date:
            # Convert start_date to date and combine with order time
            start_date_only = pd.to_datetime(request.start_date).date()
            order_time = order_date.time()
            start_date_with_time = datetime.combine(start_date_only, order_time)

            print("Computed start_date_with_time:", start_date_with_time)
            print("Order date:", order_date)

            if order_date > start_date_with_time:
                raise HTTPException(
                    status_code=400,
                    detail=f"Order date {order_date.isoformat()} is before allowed start date {start_date_with_time.isoformat()}"
                )
            else:
                created_at = start_date_with_time

        # NOW check if this is a future order and adjust time if global_time exists
        current_time = datetime.utcnow()
        is_future_order = created_at > current_time
        
        if is_future_order and global_time:
            print(f"\n=== FUTURE ORDER DETECTED ===")
            print(f"Final calculated order time: {created_at}")
            print(f"Current time: {current_time}")
            print(f"Global time from email: {global_time}")
            
            # Convert global_time to datetime for calculation (using the created_at date)
            global_datetime = datetime.combine(created_at.date(), global_time)
            
            # Calculate one hour before global time
            adjusted_time = global_datetime - timedelta(hours=1)
            
            print(f"Original scheduled time would be: {created_at}")
            print(f"Adjusted time (global_time - 1 hour): {adjusted_time}")
            
            # Update created_at to the adjusted time
            created_at = adjusted_time
            print(f"Final order time set to: {created_at}")
            print("=" * 50 + "\n")
        elif is_future_order:
            print(f"\n=== FUTURE ORDER DETECTED BUT NO GLOBAL TIME ===")
            print(f"Future order detected but no global time available from emails")
            print(f"Final order time: {created_at}")
            print("=" * 50 + "\n")

        # Prepare the items_ordered data
        items_ordered_data = {
            "total_items": len(request.items),
            "items": request.items,
        }

        # Create store order entry
        create_obj = storeorders_schema.StoreOrdersCreate(
            company_id=request.company_id,
            location_id=request.location_id,
            created_at=created_at.isoformat(),
            items_ordered=items_ordered_data
        )

        print(f"Creating new store items ordered with data: {items_ordered_data}")
        new_order = storeorders_crud.create_storeorders(db, create_obj)

        # Modified: Send production requirements email instead of order confirmation
        if request.email_order:
            user_details = get_user(db, current_user.id)
            if user_details and user_details.email:
                # Check if email is being sent after global time
                current_time_for_email = datetime.utcnow()
                is_email_after_global_time = False
                order_id_to_send = None
                
                if global_time:
                    # Get today's date to combine with global_time
                    today = current_time_for_email.date()
                    global_datetime_today = datetime.combine(today, global_time)
                    
                    if current_time_for_email > global_datetime_today:
                        is_email_after_global_time = True
                        order_id_to_send = new_order.id
                        print(f"Email being sent after global time. Order ID {new_order.id} will be specially highlighted.")
                
                background_tasks.add_task(
                    send_production,
                    user_emails,
                    # user_details.email,
                    user_details.first_name,
                    request.company_id,
                    False,  # is_update = False (this is for general updates, not new orders)
                    is_email_after_global_time,  # is_email_update = True if email sent after global time
                    new_order.id  
                )
                print(f"Production requirements email queued for {user_details.email} (email after global time: {is_email_after_global_time}, order ID: {order_id_to_send})")
            else:
                print("Warning: Could not find user email for production requirements")

        return {
            "message": "New store orders created successfully",
            "store_orders_id": new_order.id,
            "received_data": request.model_dump(),
            "items_ordered": items_ordered_data,
            "created_at": new_order.created_at.isoformat(),
            "global_time": str(global_time) if global_time else None,
            "is_future_order": is_future_order,
            "adjusted_time_applied": is_future_order and global_time is not None
        }

    except HTTPException as http_exc:
        raise http_exc  # re-raise expected errors

    except Exception as e:
        print(f"Error creating new order: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")



# @router.post("/orderitems")
# def create_new_order_items(
#     request: OrderItemsRequest,
#     background_tasks: BackgroundTasks,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_active_user),
# ):
#     """Create new store orders entry every time"""
#     print("Received request to create new order:", request.model_dump())
#     print("dates", request.start_date, request.end_date)

#     try:
#         # Query and print first email entry for this company
#         first_company_email = db.query(Mail).filter(Mail.company_id == request.company_id).first()
        
#         # Extract global time from the first email entry
#         global_time = None
#         if first_company_email and first_company_email.receiving_time:
#             global_time = first_company_email.receiving_time
#             print(f"\n=== GLOBAL TIME SET FROM COMPANY EMAIL ===")
#             print(f"Global time extracted: {global_time}")
        
#         print(f"\n=== FIRST EMAIL ENTRY FOR COMPANY ID {request.company_id} ===")
#         if first_company_email:
#             print(f"Found first email for company ID {request.company_id}:")
#             print(f"  - ID: {first_company_email.id}")
#             print(f"    Receiver Name: {first_company_email.receiver_name}")
#             print(f"    Receiver Email: {first_company_email.receiver_email}")
#             print(f"    Receiving Time: {first_company_email.receiving_time}")
#             print(f"    Company ID: {first_company_email.company_id}")
#         else:
#             print(f"No email entries found for company ID {request.company_id}")
#         print("=" * 50 + "\n")

#         # Default created_at is the order_date or current time
#         order_date = pd.to_datetime(request.order_date).replace(tzinfo=None) if request.order_date else datetime.utcnow()
#         created_at = order_date  # default

#         # Handle start_date logic first
#         if request.start_date:
#             # Convert start_date to date and combine with order time
#             start_date_only = pd.to_datetime(request.start_date).date()
#             order_time = order_date.time()
#             start_date_with_time = datetime.combine(start_date_only, order_time)

#             print("Computed start_date_with_time:", start_date_with_time)
#             print("Order date:", order_date)

#             if order_date > start_date_with_time:
#                 raise HTTPException(
#                     status_code=400,
#                     detail=f"Order date {order_date.isoformat()} is before allowed start date {start_date_with_time.isoformat()}"
#                 )
#             else:
#                 created_at = start_date_with_time

#         # NOW check if this is a future order and adjust time if global_time exists
#         current_time = datetime.utcnow()
#         is_future_order = created_at > current_time
        
#         if is_future_order and global_time:
#             print(f"\n=== FUTURE ORDER DETECTED ===")
#             print(f"Final calculated order time: {created_at}")
#             print(f"Current time: {current_time}")
#             print(f"Global time from email: {global_time}")
            
#             # Convert global_time to datetime for calculation (using the created_at date)
#             global_datetime = datetime.combine(created_at.date(), global_time)
            
#             # Calculate one hour before global time
#             adjusted_time = global_datetime - timedelta(hours=1)
            
#             print(f"Original scheduled time would be: {created_at}")
#             print(f"Adjusted time (global_time - 1 hour): {adjusted_time}")
            
#             # Update created_at to the adjusted time
#             created_at = adjusted_time
#             print(f"Final order time set to: {created_at}")
#             print("=" * 50 + "\n")
#         elif is_future_order:
#             print(f"\n=== FUTURE ORDER DETECTED BUT NO GLOBAL TIME ===")
#             print(f"Future order detected but no global time available from emails")
#             print(f"Final order time: {created_at}")
#             print("=" * 50 + "\n")

#         # Prepare the items_ordered data
#         items_ordered_data = {
#             "total_items": len(request.items),
#             "items": request.items,
#         }

#         # Create store order entry
#         create_obj = storeorders_schema.StoreOrdersCreate(
#             company_id=request.company_id,
#             location_id=request.location_id,
#             created_at=created_at.isoformat(),
#             items_ordered=items_ordered_data
#         )

#         print(f"Creating new store items ordered with data: {items_ordered_data}")
#         new_order = storeorders_crud.create_storeorders(db, create_obj)

#         # Modified: Send production requirements email instead of order confirmation
#         if request.email_order:
#             user_details = get_user(db, current_user.id)
#             if user_details and user_details.email:
#                 # Check if email is being sent after global time
#                 current_time_for_email = datetime.utcnow()
#                 is_email_after_global_time = False
#                 order_id_to_send = None
                
#                 if global_time:
#                     # Get today's date to combine with global_time
#                     today = current_time_for_email.date()
#                     global_datetime_today = datetime.combine(today, global_time)
                    
#                     if current_time_for_email > global_datetime_today:
#                         is_email_after_global_time = True
#                         order_id_to_send = new_order.id
#                         print(f"Email being sent after global time. Order ID {new_order.id} will be specially highlighted.")
                
#                 background_tasks.add_task(
    
    
#                     send_production,
#                     user_details.email,
#                     user_details.first_name,
#                     request.company_id,
#                     False,  # is_update = False (this is for general updates, not new orders)
#                     is_email_after_global_time,  # is_email_update = True if email sent after global time
#                     order_id_to_send  # recent_order_id = order ID if email sent after global time
#                 )
#                 print(f"Production requirements email queued for {user_details.email} (email after global time: {is_email_after_global_time}, order ID: {order_id_to_send})")
#             else:
#                 print("Warning: Could not find user email for production requirements")

#         return {
#             "message": "New store orders created successfully",
#             "store_orders_id": new_order.id,
#             "received_data": request.model_dump(),
#             "items_ordered": items_ordered_data,
#             "created_at": new_order.created_at.isoformat(),
#             "global_time": str(global_time) if global_time else None,
#             "is_future_order": is_future_order,
#             "adjusted_time_applied": is_future_order and global_time is not None
#         }

#     except HTTPException as http_exc:
#         raise http_exc  # re-raise expected errors

#     except Exception as e:
#         print(f"Error creating new order: {str(e)}")
#         import traceback
#         print(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")




# Updated router endpoint
@router.get("/detailsrecent/{company_id}/{location_id}")
def get_recent_storeorders_details_by_location(
    company_id: int, 
    location_id: int, 
    start_date: str = Query(None),
    end_date: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get 7 most recent store orders details by company ID and location ID"""
    print(" i am here in details recent", company_id, location_id, start_date, end_date)
    
    # Get the recent store orders (returns a list)
    storeorders_list = storeorders_crud.get_recent_storeorders_by_company_and_location(db, company_id, location_id)
    

    if start_date and end_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
            end = datetime.strptime(end_date, "%Y-%m-%d").date()
            print("Filtering store orders between dates:", start, end)
            storeorders_list = [
                order for order in storeorders_list
                if (order.updated_at or order.created_at)
                and start <= (order.updated_at or order.created_at).date() <= end
            ]
        except ValueError:
            return {"message": "Invalid date format. Use YYYY-MM-DD", "data": []}

    if not storeorders_list:
        return {"message": "Store orders not found", "data": []}
    
    # Get company and location names (fetch once)
    company = db.query(Company).filter(Company.id == company_id).first()
    location = db.query(Store).filter(Store.id == location_id).first()
    
    # Process each order in the list
    data = []
    for storeorder in storeorders_list:
        created = storeorder.created_at.isoformat() if storeorder.created_at else None
        updated = storeorder.updated_at.isoformat() if storeorder.updated_at else None
        created_readable = storeorder.created_at.strftime('%Y-%m-%d %H:%M:%S') if storeorder.created_at else None
        updated_readable = storeorder.updated_at.strftime('%Y-%m-%d %H:%M:%S') if storeorder.updated_at else None
        
        created_variable = updated if updated else created
        created_readable_variable = updated_readable if updated_readable else created_readable

        order_data = {
            "id": storeorder.id,
            "company_id": storeorder.company_id,
            "company_name": company.name if company else "Unknown",
            "location_id": storeorder.location_id,
            "location_name": location.name if location else "Unknown",
            "created_at_original": storeorder.created_at.isoformat() if storeorder.created_at else None,
            "created_at_readable_original": storeorder.created_at.strftime('%Y-%m-%d %H:%M:%S') if storeorder.created_at else None,
            "created_at": created_variable,
            "created_at_readable": created_readable_variable,
            "updated_at": storeorder.updated_at.isoformat() if storeorder.updated_at else None,
            "updated_at_readable": storeorder.updated_at.strftime('%Y-%m-%d %H:%M:%S') if storeorder.updated_at else None,
            "testing_created_at_show_updated_at_if_available": created_variable,
            "items_ordered": storeorder.items_ordered,
            "prev_items_ordered": storeorder.prev_items_ordered,
        }
        data.append(order_data)
    
    return {
        "message": "Recent store orders details fetched successfully", 
        "data": data,
        "total_orders": len(data),
        "company_name": company.name if company else "Unknown",
        "location_name": location.name if location else "Unknown"
    }
    

@router.get("/aisuggestions/{company_id}/{location_id}")
def get_recent_storeorders_details_by_location(
    company_id: int, 
    location_id: int, 
    db: Session = Depends(get_db)
):
    """Get 7 most recent store orders details by company ID and location ID"""
    
    # Get the recent store orders (returns a list)
    storeorders_list = storeorders_crud.get_recent_storeorders_by_company_and_location(db, company_id, location_id)
    
    if not storeorders_list:
        return {"message": "Store orders not found", "data": []}
    
    # Get company and location names (fetch once)
    company = db.query(Company).filter(Company.id == company_id).first()
    location = db.query(Store).filter(Store.id == location_id).first()
    
    # Process each order in the list
    data = []
    for storeorder in storeorders_list:
        order_data = {
            "id": storeorder.id,
            "company_id": storeorder.company_id,
            "company_name": company.name if company else "Unknown",
            "location_id": storeorder.location_id,
            "location_name": location.name if location else "Unknown",
            "created_at": storeorder.created_at.isoformat() if storeorder.created_at else None,
            "created_at_readable": storeorder.created_at.strftime('%Y-%m-%d %H:%M:%S') if storeorder.created_at else "Unknown",
            "updated_at": storeorder.updated_at.isoformat() if storeorder.updated_at else None,
            "updated_at_readable": storeorder.updated_at.strftime('%Y-%m-%d %H:%M:%S') if storeorder.updated_at else "Unknown",
            "items_ordered": storeorder.items_ordered,
            "prev_items_ordered": storeorder.prev_items_ordered,
        }
        data.append(order_data)
    
    return {
        "message": "Recent store orders details fetched successfully", 
        "data": data[0],
        "total_orders": len(data),
        "company_name": company.name if company else "Unknown",
        "location_name": location.name if location else "Unknown"
    }


# Updated function to update order by ID
@router.post("/orderupdate")
def update_storeorders_by_id(
    request: UpdateStoreOrdersRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update items_ordered for a specific store orders record by ID"""

    print(f"Received request to update store order request.order_id:", request.model_dump(), "date:", request.updated_date)
    try:
        # First, check if the order exists
        existing_order = storeorders_crud.get_storeorders(db, request.order_id)
        print(f"Checking existing order with ID:", existing_order)    
        
        
        if not existing_order:
            raise HTTPException(
                status_code=404, 
                detail=f"Store order with ID {request.order_id} not found"
            )

        # Optional: Verify that the order belongs to the specified company and location
        if existing_order.company_id != request.company_id or existing_order.location_id != request.location_id:
            raise HTTPException(
                status_code=400,
                detail=f"Order ID {request.order_id} does not belong to company {request.company_id} and location {request.location_id}"
            )
        
        print(f"Found existing order with ID: {existing_order.id}")
        print(f"Current items_ordered: {existing_order.items_ordered}")
        
        
        # Prepare the items_ordered data
        new_items_ordered_data = {
            "total_items": len(request.items),
            "items": request.items,
        }
        print(f"New items_ordered: {new_items_ordered_data}")
        
        # Create update object
        update_obj = storeorders_schema.StoreOrdersUpdate(items_ordered=new_items_ordered_data)

        # updated_at_date = request.updated_date if request.updated_date else datetime.utcnow().isoformat()
        
        if request.updated_date:
            # Remove 'Z' and convert
            updated_at_date = datetime.fromisoformat(request.updated_date.rstrip('Z'))
        else:
            updated_at_date = datetime.utcnow()
        # Update by order ID (this will automatically move current to prev and set new items)
        updated_storeorders = storeorders_crud.update_storeorders(db, request.order_id, update_obj, updated_at_date=updated_at_date)

        if not updated_storeorders:
            raise HTTPException(status_code=500, detail="Failed to update store order")
            
        print("Successfully updated store order in database")
        print(f"New items_ordered: {updated_storeorders.items_ordered}")
        print(f"Previous items_ordered: {updated_storeorders.prev_items_ordered}")
        
        # Handle email notification AFTER successful update
        if request.email_order:
            company_id = request.company_id
            current_user_id = current_user.id   
            print("Email order is enabled. Company ID:", company_id, "Current User ID:", current_user_id)
            
            # Get user details from user ID
            user_details = get_user(db, current_user_id)
            
            if user_details and user_details.email:
                # Send order confirmation email in background
                background_tasks.add_task(
                    send_order_confirmation_email,
                    user_details.email,
                    user_details.first_name,
                    updated_storeorders.id,  # Use the order ID instead of new_items_ordered_data
                    new_items_ordered_data,
                    updated_storeorders.updated_at,  # Use updated_at instead of created_at
                    True
                )
                print(f"Order confirmation email queued for {user_details.email}")
            else:
                print("Warning: Could not find user email for order confirmation")
        
        # Return the response
        return {
            "status": "success", 
            "message": f"Store order {request.order_id} updated successfully",
            "order_id": updated_storeorders.id,
            "company_id": updated_storeorders.company_id,
            "location_id": updated_storeorders.location_id,
            "updated_at": updated_storeorders.updated_at.isoformat() if updated_storeorders.updated_at else None,
            "created_at": updated_storeorders.created_at.isoformat() if updated_storeorders.created_at else None,
            "items_ordered": updated_storeorders.items_ordered,
            "prev_items_ordered": updated_storeorders.prev_items_ordered,
            "update_summary": {
                "previous_items_preserved": True if updated_storeorders.prev_items_ordered else False,
                # "new_items_count": len(request.items_ordered.get('items', [])) if 'items' in request.items_ordered else 0
            }
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Error in update_storeorders_by_id: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error updating store order: {str(e)}")
    



@router.get("/analytics/{company_id}/{location_id}")
def get_avg_daily_orders(
    company_id: int, 
    location_id: int, 
    start_date: str = Query(None),
    end_date: str = Query(None),
    db: Session = Depends(get_db)
    
):
    """Get average daily orders, total orders, and top 2 items ordered for a company and location"""
    print(f"Fetching average daily orders for company {company_id} and location {location_id} with date range {start_date} to {end_date}"
          )
    
    
    try:
        # FIXED: Use get_storeorders_by_location() to get ALL orders, not just the latest one
        storeorders = storeorders_crud.get_storeorders_by_location(db, location_id)
        
        # Filter by company_id since get_storeorders_by_location doesn't filter by company
        storeorders = [order for order in storeorders if order.company_id == company_id]
        
                
        # Apply date filtering if start_date and end_date are provided
        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d").date()
                end = datetime.strptime(end_date, "%Y-%m-%d").date()
                print("Filtering store orders between dates:", start, end)
                storeorders = [
                    order for order in storeorders
                    if (order.updated_at or order.created_at)
                    and start <= (order.updated_at or order.created_at).date() <= end
                ]
            except ValueError:
                return {"message": "Invalid date format. Use YYYY-MM-DD", "data": []}
        
        if not storeorders:
            return {
                "message": "No store orders found for this company and location", 
                "data": {
                    "total_orders": 0,
                    "avg_daily_orders": 0,
                    "date_range": None,
                    "top_items": []
                }
            }
        
        total_orders = len(storeorders)
        
        # Calculate average daily orders
        if total_orders > 0:
            # Get valid dates only
            valid_dates = [order.created_at for order in storeorders if order.created_at]
            
            if valid_dates:
                first_order_date = min(valid_dates)
                last_order_date = max(valid_dates)
                days_difference = (last_order_date - first_order_date).days + 1  # Include the last day
                
                avg_daily_orders = round(total_orders / days_difference, 2) if days_difference > 0 else total_orders
                date_range = {
                    "first_order": first_order_date.strftime('%Y-%m-%d'),
                    "last_order": last_order_date.strftime('%Y-%m-%d'),
                    "total_days": days_difference
                }
            else:
                avg_daily_orders = 0
                date_range = None
        else:
            avg_daily_orders = 0
            date_range = None
        
        # Aggregate items ordered
        item_counts = {}
        for order in storeorders:
            if order.items_ordered and 'items' in order.items_ordered:
                items_ordered = order.items_ordered.get('items', [])
                for item in items_ordered:
                    # Handle different possible item structure
                    item_name = item.get('name') or item.get('product') or item.get('item_name', 'Unknown')
                    item_quantity = item.get('quantity', 1)
                    
                    if item_name in item_counts:
                        item_counts[item_name] += item_quantity
                    else:
                        item_counts[item_name] = item_quantity
        
        # Get top 2 items ordered
        top_items = sorted(item_counts.items(), key=lambda x: x[1], reverse=True)[:2]
        top_items_formatted = [{"name": name, "total_quantity": quantity} for name, quantity in top_items]
        
        # Get company and location names for response
        company = db.query(Company).filter(Company.id == company_id).first()
        location = db.query(Store).filter(Store.id == location_id).first()
        
        return {
            "message": "Average daily orders and top items fetched successfully",
            "data": {
                "company_name": company.name if company else "Unknown",
                "location_name": location.name if location else "Unknown",
                "total_orders": total_orders,
                "avg_daily_orders": avg_daily_orders,
                "date_range": date_range,
                "top_items": top_items_formatted,
                "all_items_summary": {
                    "unique_items_count": len(item_counts),
                    "total_item_quantities": sum(item_counts.values())
                }
            }
        }
    
    except Exception as e:
        print(f"Error fetching average daily orders: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching average daily orders: {str(e)}")




@router.get("/analyticsdashboard/{company_id}/{location_ids}")
def get_analytics_dashboard(
    company_id: int, 
    location_ids: str,  # it will be like "2,3,5"
    start_date: str = Query(None),
    end_date: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get total sales, total orders, average order value, and daily analytics tables"""
    location_id_list = [int(i) for i in location_ids.split(",") if i.strip().isdigit()]
    print(f"Fetching analytics dashboard for company {company_id} and locations {location_id_list} with date range {start_date} to {end_date}")

    try:
        # 1. Get all storeorders for all location_ids
        storeorders = []
        for loc_id in location_id_list:
            orders = storeorders_crud.get_all_storeorders_by_company_and_location(db, company_id, loc_id)
            storeorders.extend(orders or [])

        # 2. Date filtering
        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d").date()
                end = datetime.strptime(end_date, "%Y-%m-%d").date()
                print("Filtering store orders between dates:", start, end)
                storeorders = [
                    order for order in storeorders
                    if (order.updated_at or order.created_at)
                    and start <= (order.updated_at or order.created_at).date() <= end
                ]
            except ValueError:
                return {"message": "Invalid date format. Use YYYY-MM-DD", "data": []}

        if not storeorders:
            return {
                "message": "No store orders found for this company and locations", 
                "data": {
                    "total_sales": 0,
                    "total_orders": 0,
                    "avg_order_value": 0.0,
                    "daily_orders": [],
                    "avg_order_value_table": [],
                    "daily_sales_trend": []
                }
            }

        total_orders = len(storeorders)
        total_sales = 0.0

        rows = []
        for order in storeorders:
            created_date = order.created_at.date()
            order_sales = 0.0
            if order.items_ordered and "items" in order.items_ordered:
                for item in order.items_ordered["items"]:
                    total_price = item.get("total_price", 0)
                    order_sales += float(total_price)
            total_sales += order_sales
            rows.append({"created_at": created_date, "order_sales": order_sales})

        avg_order_value = round(total_sales / total_orders, 2) if total_orders > 0 else 0.0

        df = pd.DataFrame(rows)
        df["created_at"] = pd.to_datetime(df["created_at"])

        # Daily Orders
        daily_counts = df.groupby(df["created_at"].dt.date).size().reset_index(name="order_count")
        daily_counts["created_at"] = pd.to_datetime(daily_counts["created_at"])
        daily_counts = daily_counts.sort_values(by="created_at")
        daily_counts["moving_avg"] = daily_counts["order_count"].rolling(window=5, min_periods=1).mean().round(2)

        # Daily Sales and Avg Order Value
        daily_sales = df.groupby(df["created_at"].dt.date).agg(
            total_sales_per_day=("order_sales", "sum"),
            order_count=("order_sales", "count")
        ).reset_index()
        daily_sales["created_at"] = pd.to_datetime(daily_sales["created_at"])
        daily_sales["avg_order_value"] = (daily_sales["total_sales_per_day"] / daily_sales["order_count"]).round(2)
        daily_sales = daily_sales.sort_values(by="created_at")
        daily_sales["moving_avg"] = daily_sales["avg_order_value"].rolling(window=5, min_periods=1).mean().round(2)

        # Daily Sales Trend
        daily_sales_trend_df = daily_sales[["created_at", "total_sales_per_day"]].copy()
        daily_sales_trend_df = daily_sales_trend_df.sort_values(by="created_at")
        daily_sales_trend_df["moving_avg"] = daily_sales_trend_df["total_sales_per_day"].rolling(window=5, min_periods=1).mean().round(2)

        # Format dates for plotting
        if platform.system() == "Windows":
            date_format = "%b %#d"
        else:
            date_format = "%b %-d"

        daily_counts = daily_counts.rename(columns={"created_at": "date"})
        daily_counts["date"] = daily_counts["date"].dt.strftime(date_format)

        daily_sales = daily_sales.rename(columns={"created_at": "date"})
        daily_sales["date"] = daily_sales["date"].dt.strftime(date_format)

        daily_sales_trend_df = daily_sales_trend_df.rename(columns={"created_at": "date", "total_sales_per_day": "total_sales"})
        daily_sales_trend_df["date"] = daily_sales_trend_df["date"].dt.strftime(date_format)

        company = db.query(Company).filter(Company.id == company_id).first()

        return {
            "message": "Analytics dashboard data fetched successfully",
            "data": {
                "company_name": company.name if company else "Unknown",
                "location_ids": location_ids,
                "total_sales": total_sales,
                "total_orders": total_orders,
                "avg_order_value": avg_order_value,
                "daily_orders": daily_counts.to_dict(orient="records"),
                "avg_order_value_table": daily_sales.to_dict(orient="records"),
                "daily_sales_trend": daily_sales_trend_df.to_dict(orient="records")
            }
        }

    except Exception as e:
        print(f"Error fetching analytics dashboard data: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching analytics dashboard data: {str(e)}")



@router.get("/allordersinvoices/{company_id}/{location_ids}")
def get_analytics_dashboard(
    company_id: int,
    location_ids: str = Path(..., description="Comma-separated location IDs, e.g., 3,6,8"),
    startDate: Optional[str] = Query(None),
    endDate: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    
    """Get total sales, total orders, average order value, and daily analytics tables"""
    print(f"Fetching all orders and invoices for company {company_id} and locations {location_ids} with date range {startDate} to {endDate}")
    fallback_row = [{
        "order_id": "#-",
        "created_at": "-",
        "items_count": 0,
        "total_quantity": 0.0,
        "total_amount": 0.0
    }]

    try:
        # Parse location IDs
        try:
            location_id_list = [int(loc_id.strip()) for loc_id in location_ids.split(",") if loc_id.strip().isdigit()]
            if not location_id_list:
                return {"message": "No valid location IDs provided", 
                        "data": fallback_row,
                        "total": 0
                        }
                
        except Exception:
            return {
                
                "message": "Invalid location_ids format. Provide comma-separated integers.", 
                 "data": fallback_row,
                "total": 0
                }

        # Get orders for all locations
        storeorders = []
        for loc_id in location_id_list:
            orders = storeorders_crud.get_recent_storeorders_by_company_and_location(db, company_id, loc_id, limit="all")
            if isinstance(orders, list):
                storeorders.extend(orders)
            elif orders:
                storeorders.append(orders)

        if startDate and endDate:
            try:
                start = datetime.strptime(startDate, "%Y-%m-%d").date()
                end = datetime.strptime(endDate, "%Y-%m-%d").date()
                storeorders = [
                    order for order in storeorders
                    if (order.updated_at or order.created_at)
                    and start <= (order.updated_at or order.created_at).date() <= end
                ]
            except ValueError:
                return {"message": "Invalid date format. Use YYYY-MM-DD", 
                        "data": fallback_row,
                        "total": 0
                        }

        total_sales = 0.0
        rows = []
        for order in storeorders:
            the_date = order.updated_at if order.updated_at else order.created_at
            created_date = the_date
            total_amount = 0.0
            total_quantity = 0.0

            if order.items_ordered:
                items = order.items_ordered.get("items", [])
                for item in items:
                    total_price = item.get("total_price", 0) or 0
                    quantity = item.get("quantity", 0) or 0
                    total_amount += float(total_price)
                    total_quantity += float(quantity)
                items_count = order.items_ordered.get("total_items", len(items))
            else:
                items_count = 0

            total_sales += total_amount
            rows.append({
                "order_id": order.id,
                "created_at": created_date,
                "formatted_created_at": created_date.strftime("%#m/%#d/%Y, %#I:%M:%S %p"),
                "items_count": items_count,
                "total_quantity": total_quantity,
                "total_amount": total_amount,
            })

        return {
            "message": "Analytics dashboard data fetched successfully",
            "data": rows,
            "total": total_sales
        }

    except Exception as e:
        print(f"Error fetching analytics dashboard data: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching analytics dashboard data: {str(e)}")





@router.get("/consolidatedproduction/{company_id}")
def get_consolidated_production(company_id: int, 
                                startDate: str = Query(None),
                                endDate: str = Query(None),
                                db: Session = Depends(get_db)):
    try:
        storeorders = storeorders_crud.get_storeorders_by_company(db, company_id)
        
        
        if not storeorders:
            return {"message": "No store orders found for this company", "data": []}

        # Apply date filtering if startDate and endDate are provided
        if startDate and endDate:
            try:
                start = datetime.strptime(startDate, "%Y-%m-%d").date()
                end = datetime.strptime(endDate, "%Y-%m-%d").date()
                print("Filtering store orders between dates:", start, end)
                storeorders = [
                    order for order in storeorders
                    if (order.updated_at or order.created_at)
                    and start <= (order.updated_at or order.created_at).date() <= end
                ]
            except ValueError:
                return {"message": "Invalid date format. Use YYYY-MM-DD", "data": []}
        
        
        # Get all unique locations
        location_ids = list(set(order.location_id for order in storeorders if order.location_id))
        locations = db.query(Store).filter(Store.id.in_(location_ids)).all()
        location_lookup = {loc.id: loc.name for loc in locations}

        # Build item-location-quantity matrix
        item_data = defaultdict(lambda: defaultdict(int))  # item_data[item_name][location_name] = quantity
        item_units = {}  # item_data[item_name] = unit

        for order in storeorders:
            location_name = location_lookup.get(order.location_id, f"Location {order.location_id}")
            if not order.items_ordered or "items" not in order.items_ordered:
                continue

            for item in order.items_ordered["items"]:
                name = item.get("name")
                quantity = item.get("quantity", 0)
                unit = item.get("unit", "")
                item_data[name][location_name] += quantity
                item_units[name] = unit

        # Format final table rows
        all_location_names = sorted(location_lookup.values())
        table_rows = []
        for item_name, location_qtys in item_data.items():
            row = {"Item": item_name}
            total_required = 0
            for loc in all_location_names:
                qty = location_qtys.get(loc, 0)
                row[loc] = qty
                total_required += qty
            row["Total Required"] = total_required
            row["Unit"] = item_units.get(item_name, "")
            table_rows.append(row)

        return {
            "message": "Consolidated production table generated successfully",
            "columns": ["Item"] + all_location_names + ["Total Required", "Unit"],
            "data": table_rows
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching consolidated production: {str(e)}")



@router.get("/financialsummary/{company_id}/{location_ids}")
def get_financial_summary(
    company_id: int,
    location_ids: str,
    start_date: str = Query(None),
    end_date: str = Query(None),
    db: Session = Depends(get_db)
):
    try:
        # Step 1: Convert comma-separated location_ids to a list of ints
        location_id_list = [int(loc.strip()) for loc in location_ids.split(",") if loc.strip().isdigit()]

        all_storeorders = []

        for location_id in location_id_list:
            orders = storeorders_crud.get_all_storeorders_by_company_and_location(db, company_id, location_id)
            if orders:
                all_storeorders.extend(orders)

        # Step 2: Filter by date range
        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d").date()
                end = datetime.strptime(end_date, "%Y-%m-%d").date()
                all_storeorders = [
                    order for order in all_storeorders
                    if (order.updated_at or order.created_at)
                    and start <= (order.updated_at or order.created_at).date() <= end
                ]
            except ValueError:
                return {"message": "Invalid date format. Use YYYY-MM-DD", "data": []}

        if not all_storeorders:
            return {
                "message": "No store orders found for the provided company and location(s)",
                "data": {
                    "total_sales": 0,
                    "total_orders": 0,
                    "orders_cost_per_day": 0.0
                }
            }

        total_orders = len(all_storeorders)
        total_sales = 0.0
        rows = []

        for order in all_storeorders:
            created_date = order.created_at.date()
            order_sales = 0.0
            if order.items_ordered and "items" in order.items_ordered:
                for item in order.items_ordered["items"]:
                    total_price = item.get("total_price", 0) or 0.0
                    order_sales += float(total_price)
            total_sales += order_sales
            rows.append({"created_at": created_date, "order_sales": order_sales})

        avg_order_value = round(total_sales / total_orders, 2) if total_orders > 0 else 0.0

        df = pd.DataFrame(rows)
        df["created_at"] = pd.to_datetime(df["created_at"])

        # Daily sales and averages
        daily_sales = df.groupby(df["created_at"].dt.date).agg(
            total_sales_per_day=("order_sales", "sum"),
            order_count=("order_sales", "count")
        ).reset_index()
        daily_sales["created_at"] = pd.to_datetime(daily_sales["created_at"])
        daily_sales["avg_order_value"] = (daily_sales["total_sales_per_day"] / daily_sales["order_count"]).round(2)
        daily_sales = daily_sales.sort_values(by="created_at")
        daily_sales["moving_avg"] = daily_sales["avg_order_value"].rolling(window=5, min_periods=1).mean().round(2)

        # Category breakdown
        category_costs = {}
        for order in all_storeorders:
            if order.items_ordered and "items" in order.items_ordered:
                for item in order.items_ordered["items"]:
                    category = item.get("category", "Uncategorized")
                    cost = float(item.get("total_price", 0.0) or 0.0)
                    category_costs[category] = category_costs.get(category, 0.0) + cost

        category_rows = [{"category": k, "cost": v} for k, v in category_costs.items()]
        cost_breakdown_by_category_df = pd.DataFrame(category_rows)

        if not cost_breakdown_by_category_df.empty:
            total_category_cost = cost_breakdown_by_category_df["cost"].sum()
            cost_breakdown_by_category_df["cost"] = cost_breakdown_by_category_df["cost"].round(2)
            cost_breakdown_by_category_df["percentage"] = (
                (cost_breakdown_by_category_df["cost"] / total_category_cost) * 100
            ).round(2)
        else:
            cost_breakdown_by_category_df = pd.DataFrame(columns=["category", "cost", "percentage"])

        return {
            "message": "Financial summary data fetched successfully",
            "data": {
                "company_id": company_id,
                "location_ids": location_id_list,
                "total_sales": total_sales,
                "total_orders": total_orders,
                "orders_cost_per_day": avg_order_value,
                "cost_breakdown_by_category": cost_breakdown_by_category_df.to_dict(orient="records"),
            }
        }

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching analytics dashboard data: {str(e)}")



@router.get("/companysummary/{company_id}")
def get_company_summary(
    company_id: int,
    start_date: str = Query(None),
    end_date: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get cost breakdown by store and cost summary table (date vs store matrix)"""
    try:
        storeorders = storeorders_crud.get_storeorders_by_company(db, company_id)


        # Apply date filtering if start_date and end_date are provided
        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d").date()
                end = datetime.strptime(end_date, "%Y-%m-%d").date()
                print("Filtering store orders between dates:", start, end)
                storeorders = [
                    order for order in storeorders
                    if (order.updated_at or order.created_at)
                    and start <= (order.updated_at or order.created_at).date() <= end
                ]
            except ValueError:
                return {"message": "Invalid date format. Use YYYY-MM-DD", "data": []}
        
        
        if not storeorders:
            return {
                "message": "No store orders found for this company",
                "data": {
                    "cost_breakdown_by_store": [],
                    "cost_summary": []
                }
            }

        if not isinstance(storeorders, list):
            storeorders = [storeorders]

        # Lookup store names
        location_ids = {order.location_id for order in storeorders if order.location_id}
        locations = db.query(Store).filter(Store.id.in_(location_ids)).all()
        location_lookup = {loc.id: loc.name for loc in locations}

        # Initialize cost summary table
        cost_matrix = {}

        for order in storeorders:
            if not order.created_at or not order.location_id:
                continue

            date = order.created_at
            store_id = order.location_id
            store_name = location_lookup.get(store_id, f"Store {store_id}")

            if date not in cost_matrix:
                cost_matrix[date] = {}
            if store_name not in cost_matrix[date]:
                cost_matrix[date][store_name] = 0.0

            if order.items_ordered and "items" in order.items_ordered:
                for item in order.items_ordered["items"]:
                    matrix = item.get("total_price", 0.0)
                    if matrix is None:
                        matrix = 0.0
                    cost_matrix[date][store_name] += float(matrix)

        # Normalize data: Get all unique store names
        all_stores = sorted({store for store_data in cost_matrix.values() for store in store_data})

        # Build cost_summary table
        cost_summary = []
        for date in sorted(cost_matrix.keys(), reverse=True):  # latest date first
            row = {"date": str(date)}
            daily_total = 0.0
            for store in all_stores:
                cost = cost_matrix[date].get(store, 0.0)
                row[store] = round(cost, 2)
                daily_total += cost
            row["daily_total"] = round(daily_total, 2)
            cost_summary.append(row)

        # Optional: Add period total row
        period_totals = {"date": "Period Total:"}
        grand_total = 0.0
        for store in all_stores:
            total = sum(row[store] for row in cost_summary)
            period_totals[store] = round(total, 2)
            grand_total += total
        period_totals["daily_total"] = round(grand_total, 2)
        cost_summary.append(period_totals)

        # Prepare cost breakdown by store
        store_costs = {}
        for row in cost_summary:
            if row["date"] == "Period Total:":
                continue
            for store in all_stores:
                store_costs[store] = store_costs.get(store, 0.0) + row[store]

        total_cost = sum(store_costs.values())
        cost_breakdown_by_store = [
            {
                "store_name": store,
                "cost": round(cost, 2),
                "percentage": round((cost / total_cost * 100) if total_cost > 0 else 0.0, 2)
            }
            for store, cost in store_costs.items()
        ]
        cost_breakdown_by_store.sort(key=lambda x: x["cost"], reverse=True)

        # Get company name
        company = db.query(Company).filter(Company.id == company_id).first()

        return {
            "message": "Company cost summary and breakdown fetched successfully",
            "data": {
                "company_name": company.name if company else "Unknown",
                "cost_breakdown_by_store": cost_breakdown_by_store,
                "cost_summary": cost_summary
            }
        }

    except Exception as e:
        print(f"Error fetching financial summary data: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching analytics dashboard data: {str(e)}"
        )





