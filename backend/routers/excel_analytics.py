# from fastapi import APIRouter, Depends, HTTPException
# from fastapi import FastAPI, HTTPException, Body
# from fastapi.middleware.cors import CORSMiddleware
# import base64
# import io
# import os
# from datetime import datetime, timedelta
# import traceback


# # Import from local modules
# from models import ExcelUploadRequest, ExcelFilterRequest, ExcelUploadResponse, SalesAnalyticsResponse
# from excel_processor import process_excel_file
# from utils import find_file_in_directory
# from sales_analytics import generate_sales_analytics
# from financials_dashboard.financials_processor import process_financials_file

# router = APIRouter(
#     prefix="/api",
#     tags=["excel_analytics"],
# )


# UPLOAD_DIR = "../uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)


# @router.post("/excel/analytics", response_model=SalesAnalyticsResponse)
# async def get_sales_analytics(request: ExcelFilterRequest = Body(...)):
#     """
#     Endpoint to generate sales analytics including time of day and day of week breakdowns.
#     Uses the same filter parameters as the filter endpoint.
#     """
#     try:
#         print(f"Received analytics request for file: {request.fileName}")
#         print(f"Date range type: {request.dateRangeType}")
#         print(f"Location: {request.location}")
        
#         # Build a pattern to match the location in filenames if provided
#         location_pattern = ""
#         if request.location:
#             location_slug = request.location.replace(' ', '_').lower()
#             location_pattern = f"_{location_slug}_"
            
#         # Check if we have the file in the uploads directory
#         file_path = find_file_in_directory(UPLOAD_DIR, request.fileName, location_pattern)
        
#         # If not found using the location pattern, try without it
#         if not file_path:
#             file_path = find_file_in_directory(UPLOAD_DIR, request.fileName)
        
#         # If still not found, check if fileContent is provided
#         if not file_path and not request.fileContent:
#             print(f"File not found in uploads directory: {request.fileName}")
#             print(f"Files in directory: {os.listdir(UPLOAD_DIR)}")
#             raise HTTPException(
#                 status_code=404, 
#                 detail=f"File not found: {request.fileName}. Please upload the file again."
#             )
        
#         # If fileContent is provided, use that instead
#         if request.fileContent:
#             # Decode base64 file content
#             file_content = base64.b64decode(request.fileContent)
#             excel_data = io.BytesIO(file_content)
#         else:
#             # Read the file from disk
#             with open(file_path, "rb") as f:
#                 file_content = f.read()
#             excel_data = io.BytesIO(file_content)
        
#         # Handle date range types
#         start_date = request.startDate
#         end_date = request.endDate
        
#         if request.dateRangeType and not (request.startDate and request.endDate):
#             # Calculate date range based on type
#             now = datetime.now()
            
#             if request.dateRangeType == "Last 7 Days":
#                 start_date = (now - timedelta(days=7)).strftime("%Y-%m-%d")
#                 end_date = now.strftime("%Y-%m-%d")
            
#             elif request.dateRangeType == "Last 30 Days":
#                 start_date = (now - timedelta(days=30)).strftime("%Y-%m-%d")
#                 end_date = now.strftime("%Y-%m-%d")
            
#             elif "This Month" in request.dateRangeType:
#                 start_date = now.replace(day=1).strftime("%Y-%m-%d")
#                 end_date = now.strftime("%Y-%m-%d")
                
#             elif "Last Month" in request.dateRangeType:
#                 last_month = now.replace(day=1) - timedelta(days=1)
#                 start_date = last_month.replace(day=1).strftime("%Y-%m-%d")
#                 end_date = last_month.strftime("%Y-%m-%d")
                
#             elif request.dateRangeType == "Last 3 Months":
#                 start_date = (now - timedelta(days=90)).strftime("%Y-%m-%d")
#                 end_date = now.strftime("%Y-%m-%d")
                
#             print(f"Using date range: {start_date} to {end_date} based on type: {request.dateRangeType}")
        
#         # Generate sales analytics with filters
#         result = generate_sales_analytics(
#             excel_data, 
#             start_date=start_date,
#             end_date=end_date,
#             location=request.location
#         )
        
#         # Add the file location to the result
#         result['fileLocation'] = request.location
        
#         # Return the analytics response
#         return SalesAnalyticsResponse(**result)
        
#     except Exception as e:
#         # Log the full exception for debugging
#         print(f"Error generating analytics: {str(e)}")
#         print(traceback.format_exc())
        
#         # Return a more specific error message
#         error_message = str(e)
#         if "NaTType does not support strftime" in error_message:
#             error_message = "Date formatting error. This usually happens with invalid date values in your data."
        
#         # Raise HTTP exception
#         raise HTTPException(status_code=500, detail=f"Error generating analytics: {error_message}")

