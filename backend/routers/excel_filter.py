from fastapi import APIRouter, Depends, HTTPException
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
import os
from datetime import datetime, timedelta
import traceback

from routers import excel_upload

# Import from local modules
from models import ExcelUploadRequest, ExcelFilterRequest, ExcelUploadResponse, SalesAnalyticsResponse
from excel_processor import process_excel_file
from utils import find_file_in_directory
from sales_analytics import generate_sales_analytics
from financials_dashboard.financials_processor import process_financials_file

# Directory to save uploaded files
UPLOAD_DIR = "../uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(
    prefix="/api",
    tags=["excel_filter"],
)


@router.post("/excel/filter", response_model=ExcelUploadResponse)
async def filter_excel_data(request: ExcelFilterRequest = Body(...)):
    """
    Endpoint to filter previously processed Excel data by date range and location.
    """
    try:
        print(f"Received filter request for file: {request.fileName}")
        print(f"Date range type: {request.dateRangeType}")
        print(f"Location: {request.location}")
        
        # Build a pattern to match the location in filenames if provided
        location_pattern = ""
        if request.location:
            location_slug = request.location.replace(' ', '_').lower()
            location_pattern = f"_{location_slug}_"
            
        # Check if we have the file in the uploads directory
        file_path = find_file_in_directory(UPLOAD_DIR, request.fileName, location_pattern)
        
        # If not found using the location pattern, try without it
        if not file_path:
            file_path = find_file_in_directory(UPLOAD_DIR, request.fileName)
        
        # If still not found, check if fileContent is provided
        if not file_path and not request.fileContent:
            print(f"File not found in uploads directory: {request.fileName}")
            print(f"Files in directory: {os.listdir(UPLOAD_DIR)}")
            raise HTTPException(
                status_code=404, 
                detail=f"File not found: {request.fileName}. Please upload the file again."
            )
        
        # If fileContent is provided, use that instead
        if request.fileContent:
            # Decode base64 file content
            file_content = base64.b64decode(request.fileContent)
            excel_data = io.BytesIO(file_content)
        else:
            # Read the file from disk
            with open(file_path, "rb") as f:
                file_content = f.read()
            excel_data = io.BytesIO(file_content)
        
        # Handle date range types
        start_date = request.startDate
        end_date = request.endDate
        
        if request.dateRangeType and not (request.startDate and request.endDate):
            # Calculate date range based on type
            now = datetime.now()
            
            if request.dateRangeType == "Last 7 Days":
                start_date = (now - timedelta(days=7)).strftime("%Y-%m-%d")
                end_date = now.strftime("%Y-%m-%d")
            
            elif request.dateRangeType == "Last 30 Days":
                start_date = (now - timedelta(days=30)).strftime("%Y-%m-%d")
                end_date = now.strftime("%Y-%m-%d")
            
            elif "This Month" in request.dateRangeType:
                start_date = now.replace(day=1).strftime("%Y-%m-%d")
                end_date = now.strftime("%Y-%m-%d")
                
            elif "Last Month" in request.dateRangeType:
                last_month = now.replace(day=1) - timedelta(days=1)
                start_date = last_month.replace(day=1).strftime("%Y-%m-%d")
                end_date = last_month.strftime("%Y-%m-%d")
                
            elif request.dateRangeType == "Last 3 Months":
                start_date = (now - timedelta(days=90)).strftime("%Y-%m-%d")
                end_date = now.strftime("%Y-%m-%d")
                
            print(f"Using date range: {start_date} to {end_date} based on type: {request.dateRangeType}")
        
        # Process Excel file with filters
        result = process_excel_file(
            excel_data, 
            start_date=start_date,
            end_date=end_date,
            location=request.location
        )
        
        # Ensure each table exists in the result, even if empty
        for table in ['table1', 'table2', 'table3', 'table4', 'table5']:
            if table not in result:
                result[table] = []
        
        # If location is provided, make sure it's in the locations list
        if 'locations' not in result:
            result['locations'] = []
            
        if request.location and request.location not in result['locations']:
            result['locations'].append(request.location)
            
        if 'dateRanges' not in result:
            result['dateRanges'] = []
            
        # Add fileLocation field to the response
        result['fileLocation'] = request.location
        
        # Return the properly structured response
        return ExcelUploadResponse(**result)
        
    except Exception as e:
        # Log the full exception for debugging
        print(f"Error filtering data: {str(e)}")
        print(traceback.format_exc())
        
        # Return a more specific error message
        error_message = str(e)
        if "NaTType does not support strftime" in error_message:
            error_message = "Date formatting error. This usually happens with invalid date values in your data."
        
        # Raise HTTP exception
        raise HTTPException(status_code=500, detail=f"Error filtering data: {error_message}")

