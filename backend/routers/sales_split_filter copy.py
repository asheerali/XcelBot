# from fastapi import APIRouter, Depends, HTTPException
# from fastapi import FastAPI, HTTPException, Body
# from fastapi.middleware.cors import CORSMiddleware
# import base64
# import io
# import os
# from datetime import datetime, timedelta
# import traceback

# from routers import excel_upload

# # Import from local modules
# from models_pydantic import ExcelUploadRequest, ExcelFilterRequest, ExcelUploadResponse, DashboardResponse, SalesSplitPmixUploadRequest
# from excel_processor import process_excel_file
# # from utils import find_file_in_directory
# from sales_analytics import generate_sales_analytics
# from financials_dashboard.financials_processor import process_financials_file
# from sales_split_dashboard.sales_split_prcoessor import process_sales_split_file

# # Directory to save uploaded files
# UPLOAD_DIR = "./uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# router = APIRouter(
#     prefix="/api",
#     tags=["sales_split_filter"],
# )


# @router.post("/salessplit/filter", response_model=DashboardResponse)
# async def filter_excel_data(request: SalesSplitPmixUploadRequest = Body(...)):
#     """
#     Endpoint to filter previously processed Excel data by date range and location.
#     """
#     print(f"Received file upload/////// 1234556 : {request}")
#     try:
#         print(f"Received file upload 1234556 : {request}")
        
#         fileName = request.fileName
#         print(f"Processing file: {request}")
#         if request.location == "Multiple Locations":
#             location_filter = "All"
#         else:
#             location_filter = request.locations if request.locations else 'All'
#         start_date = request.startDate if request.startDate else None
#         end_date = request.endDate if request.endDate else None
#         # server_filter = request.server if request.server else 'All'
#         # Step 1: Get the raw input
#         raw_categories = request.categories

#         # Step 2: Set to 'All' if None or empty
#         if raw_categories in [None, '']:
#             category_filter = 'All'
#         else:
#             # Step 3: Convert comma-separated string to list
#             category_filter = [cat.strip() for cat in raw_categories.split(',') if cat.strip()]
#         # category_filter = request.categories if request.categories not in [None, ''] else 'All'
        
#         print("i am  here in sales_split_filter.py checking the category_filter", category_filter, "and the request ,", request)
        
#         # fileName = "20250514_200147_midtown_east_dashboard2_template1.xlsx"
#         file_location = os.path.join(UPLOAD_DIR, fileName)
#         (sales_by_day_table, 
#          sales_by_category_table, 
#          category_comparison_table, 
#          thirteen_week_category_table, 
#          pivot_table, 
#          in_house_table, 
#          week_over_week_table, 
#          category_summary_table, 
#          salesByWeek, 
#          salesByDayOfWeek, 
#          salesByTimeOfDay, 
#          categories, 
#          locations) = process_sales_split_file(
#                 file_location, 
#                 location=location_filter,
#                 start_date=start_date,
#                 end_date=end_date,
#                 category_filter=category_filter
#             )
            
        
#         sales_split_dashboard = {
#         "table1": pivot_table.to_dict(orient='records'),
#         "table2": in_house_table.to_dict(orient='records'),
#         "table3": week_over_week_table.to_dict(orient='records'),
#         "table4": category_summary_table.to_dict(orient='records'),
#         "table5": salesByWeek.to_dict(orient='records'),
#         "table6": salesByDayOfWeek.to_dict(orient='records'),
#         "table7": salesByTimeOfDay.to_dict(orient='records'),
#         "table8": sales_by_day_table.to_dict(orient='records'),
#         "table9": sales_by_category_table.to_dict(orient='records'),
#         "table10": category_comparison_table.to_dict(orient='records'),
#         "table11": thirteen_week_category_table.to_dict(orient='records'),
#         "locations": locations,
#         "categories": categories,
#         "dashboardName": "Sales Split",
#         "fileName": request.fileName,
#         "data": f"Sales Split Dashboard is not yet implemented."
#     }
                   

#         print(f"Sales Split Dashboard: {sales_split_dashboard}")
#             # Return the properly structured response
#         return sales_split_dashboard
        
#     except Exception as e:
#         # Log the full exception for debugging
#         print(f"Error filtering data: {str(e)}")
#         print(traceback.format_exc())
        
#         # Return a more specific error message
#         error_message = str(e)
#         if "NaTType does not support strftime" in error_message:
#             error_message = "Date formatting error. This usually happens with invalid date values in your data."
        
#         # Raise HTTP exception
#         raise HTTPException(status_code=500, detail=f"Error filtering data: {error_message}")

