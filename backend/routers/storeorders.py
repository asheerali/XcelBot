# routers/storeorders.py
import datetime
import traceback
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.locations import Store
from models.companies import Company
from crud import storeorders as storeorders_crud
from schemas import storeorders as storeorders_schema
from database import get_db
from crud.locations import get_store
from pydantic import BaseModel
from typing import Dict, Any
from crud import storeorders as storeorders_crud
from schemas import storeorders as storeorders_schema
        
router = APIRouter(
    prefix="/api/storeorders",
    tags=["Store Orders"]
)

class UpdateStoreOrdersRequest(BaseModel):
    company_id: int
    location_id: int
    items_ordered: Dict[str, Any]

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
            if not location_aggregates[location_name]["latest_order_date"] or order.updated_at > datetime.datetime.fromisoformat(location_aggregates[location_name]["latest_order_date"]):
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
    storeorders.updated_at = datetime.datetime.utcnow()
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



from pydantic import BaseModel
from typing import Optional, List

class OrderItemsRequest(BaseModel):
    company_id: Optional[int] = None
    location_id: Optional[int] = None
    items: Optional[List[Dict[str, Any]]] = None
    # Add other fields as neede

# @router.post("/orderitems") 
# def get_order_items(request: OrderItemsRequest, db: Session = Depends(get_db)):
#     """Get order items from masterfile"""
#     print("Received request in orderitems endpoint:", request.model_dump())
    
#     # Here you can process the request as needed
#     # For now, just return the request back in the response
#     return {
#         "message": "Order items request received successfully",
#         "received_data": request.model_dump()
#     }
    
    
@router.post("/orderitems")
def create_new_order_items(request: OrderItemsRequest, db: Session = Depends(get_db)):
    """Create new store orders entry every time"""
    print("Received request to create new order:", request.model_dump())
    
    try:
        
        # Prepare the items_ordered data
        items_ordered_data = {
            "total_items": len(request.items),
            "items": request.items,
        }
        
        # Always create new store orders entry
        create_obj = storeorders_schema.StoreOrdersCreate(
            company_id=request.company_id,
            location_id=request.location_id,
            created_at=datetime.datetime.utcnow(),  # Set current time as created_at
            items_ordered=items_ordered_data
        )
        
        new_order = storeorders_crud.create_storeorders(db, create_obj)
        
        return {
            "message": "New store orders created successfully",
            "store_orders_id": new_order.id,
            "received_data": request.model_dump(),
            "items_ordered": items_ordered_data,
            "created_at": new_order.created_at.isoformat()
        }
        
    except Exception as e:
        print(f"Error creating new order: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")    
    
    
    
    