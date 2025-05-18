from fastapi import APIRouter, Depends, HTTPException
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
import os

import traceback


# Import from local modules
from models import ExcelUploadRequest, ExcelUploadResponse, SalesAnalyticsResponse
from excel_processor import process_excel_file
from utils import find_file_in_directory
from sales_analytics import generate_sales_analytics

from pmix_dashboard.pmix_processor import process_pmix_file

router = APIRouter(
    prefix="/api",
    tags=["pmix_filter"],
)

UPLOAD_DIR = "../uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Upload endpoint
@router.post("/pmix/filter", response_model=ExcelUploadResponse)
async def upload_excel(request: ExcelUploadRequest = Body(...)):
    """
    Endpoint to upload and process an Excel file.
    Supports optional date range and location filtering.
    """
    try:
        # print(f"Received file upload: {request.fileName}")
        
        fileName = request.fileName
        # fileName = "20250514_200147_midtown_east_dashboard2_template1.xlsx"
        file_location = os.path.join(UPLOAD_DIR, fileName)

        location_filter = request.location if request.location else 'All'
        order_date_filter = request.startDate if request.startDate else None
        server_filter = request.server if request.server else 'All'
        dining_option_filter = request.diningOption if request.diningOption else 'All'
        menu_item_filter = request.menuItem if request.menuItem else 'All'
        
        net_sales, orders, qty_sold, sales_by_category_df, sales_by_menu_group_df, sales_by_server_df, top_selling_items_df, sales_by_location_df, average_price_by_item_df, average_order_value, average_items_per_order, price_changes_df, top_items_df, unique_orders, total_quantity = process_pmix_file(file_location, 
                                                                                                                                                                                                                                                                                                             location_filter=location_filter, 
                                                                                                                                                                                                                                                                                                             order_date_filter=order_date_filter, 
                                                                                                                                                                                                                                                                                                             server_filter=server_filter, 
                                                                                                                                                                                                                                                                                                             dining_option_filter=dining_option_filter,  
                                                                                                                                                                                                                                                                                                             menu_item_filter=menu_item_filter)


        result ={
            "table1": [{"net_sales": [net_sales], "orders": [orders], 
                        "qty_sold": [qty_sold],"average_order_value": [average_order_value], 
                        "average_items_per_order": [average_items_per_order], "unique_orders": [unique_orders], 
                        "total_quantity": [total_quantity]}],
            "table2": sales_by_category_df.to_dict(orient='records'),
            "table3": sales_by_menu_group_df.to_dict(orient='records'),
            "table4": sales_by_server_df.to_dict(orient='records'),
            "table5": top_selling_items_df.to_dict(orient='records'),
            "table6": sales_by_location_df.to_dict(orient='records'),
            "table7": average_price_by_item_df.to_dict(orient='records'),
            "table8": price_changes_df.to_dict(orient='records'),
            "table9": top_items_df.to_dict(orient='records'),
            "locations": result['locations'],
            "dateRanges": result['dateRanges'],
            "fileLocation": result['fileLocation'],
            "fileName": request.fileName,
            "dashboardName": "Product Mix ",
            "data":  "Dashboard is not yet implemented."
            }
            
        return result
            # return {"message": "Financial Dashboard is not yet implemented."}
       
    except Exception as e:
        # Log the full exception for debugging
        error_message = str(e)
        # print(f"Error processing file: {error_message}")
        print(traceback.format_exc())
        
            # Check for specific known error patterns
        if "Net Price" in error_message:
            raise HTTPException(
                status_code=400,
                detail=f"You uploaded the file in the wrong dashboard i.e. ({request.dashboard}) or the file is not properly structured. Please check the help center for more details."
            )
        
        # Raise HTTP exception
        raise HTTPException(status_code=500, detail=f"Error processing file: {error_message}")

