from fastapi import APIRouter, Depends, HTTPException
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
import os

import traceback


# Import from local modules
from models_pydantic import DashboardResponse, SalesSplitPmixUploadRequest
from pmix_dashboard.pmix_processor import process_pmix_file

router = APIRouter(
    prefix="/api",
    tags=["pmix_filter"],
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Upload endpoint
@router.post("/pmix/filter", response_model=DashboardResponse)
async def upload_excel(request: SalesSplitPmixUploadRequest = Body(...)):
    """
    Endpoint to upload and process an Excel file.
    Supports optional date range and location filtering.
    """
    print("Received request for PMIX filter with data:", request)
    try:
        # print(f"Received file upload: {request.fileName}")
        
       
        # fileName = "20250514_200147_midtown_east_dashboard2_template1.xlsx"
        fileName = request.fileName
        file_location = os.path.join(UPLOAD_DIR, fileName)

        location_filter = request.locations if request.locations else 'All'
        start_date = request.startDate if request.startDate else None
        end_date = request.endDate if request.endDate else None
        server_filter = request.servers if request.servers else 'All'
        category_filter = request.categories if request.categories else 'All'

        print("i am  here in pmix_filter.py checking the category_filter", category_filter, "and the request ,", request)
                
        (net_sales, 
        orders, 
        qty_sold, 
        sales_by_category_df, 
        sales_by_menu_group_df, 
        sales_by_server_df, 
        top_selling_items_df, 
        sales_by_location_df, 
        average_price_by_item_df, 
        average_order_value, 
        average_items_per_order, 
        price_changes_df, 
        top_items_df, 
        unique_orders, 
        total_quantity, 
        locations, 
        server, 
        category, 
        net_sales_change, 
        orders_change, 
        qty_sold_change, 
        average_order_value_change,
        average_items_per_order_change,
        unique_orders_change,
        total_quantity_change,
        sales_by_category_tables_df, 
        category_comparison_table_df, 
        sales_by_category_by_day_table_df,
        top_vs_bottom_comparison_df
        ) = process_pmix_file(file_location, 
        location_filter=location_filter,
        start_date=start_date, 
        end_date=end_date,
        server_filter=server_filter,
        category_filter=category_filter
        )
        
        # print("i am here in excel upload printing before the result" )
        pmix_dashboard = {
            # "table1": [{"net_sales": [net_sales], "orders": [orders], 
            #             "qty_sold": [qty_sold],"average_order_value": [average_order_value], 
            #             "average_items_per_order": [average_items_per_order], "unique_orders": [unique_orders], 
            #             "total_quantity": [total_quantity]}],
                "table1": [{
                            "net_sales": [float(net_sales)],
                            "orders": [int(orders)],
                            "qty_sold": [int(qty_sold)],
                            "average_order_value": [float(average_order_value)],
                            "average_items_per_order": [float(average_items_per_order)],
                            "unique_orders": [int(unique_orders)],
                            "total_quantity": [int(total_quantity)],
                            
                            "net_sales_change": [float(net_sales_change)],
                            "orders_change": [int(orders_change)],
                            "qty_sold_change": [int(qty_sold_change)],
                            "average_order_value_change": [float(average_order_value_change)],
                            "average_items_per_order_change": [float(average_items_per_order_change)],
                            "unique_orders_change": [int(unique_orders_change)],
                            "total_quantity_change": [int(total_quantity_change)]
                        }],
            "table2": sales_by_category_df.to_dict(orient='records'),
            "table3": sales_by_menu_group_df.to_dict(orient='records'),
            "table4": sales_by_server_df.to_dict(orient='records'),
            "table5": top_selling_items_df.to_dict(orient='records'),
            "table6": sales_by_location_df.to_dict(orient='records'),
            "table7": average_price_by_item_df.to_dict(orient='records'),
            "table8": price_changes_df.to_dict(orient='records'),
            "table9": top_items_df.to_dict(orient='records'),
            "table10": sales_by_category_tables_df.to_dict(orient='records'),
            "table11": category_comparison_table_df.to_dict(orient='records'),
            "table12": top_vs_bottom_comparison_df.to_dict(orient='records'),
            "table13": sales_by_category_by_day_table_df.to_dict(orient='records'),
            "locations": locations,
            "servers": server,
            "categories": category,
            "dateRanges": [],
            "fileName": request.fileName,
            "dashboardName": "Product Mix",
            "data":  "Dashboard is not yet implemented."
            }
 
            
        print("i am here in pmix_filter.py printing the pmix_dashboard", pmix_dashboard)
          
        return [pmix_dashboard]
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

