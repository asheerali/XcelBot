from fastapi import APIRouter, Depends, HTTPException
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
import os
from datetime import datetime, timedelta
import traceback


# Import from local modules
from models import ExcelUploadRequest, ExcelFilterRequest, ExcelUploadResponse, SalesAnalyticsResponse
from excel_processor import process_excel_file
from utils import find_file_in_directory
from sales_analytics import generate_sales_analytics
from financials_dashboard.financials_processor import process_financials_file

router = APIRouter(
    prefix="/api",
    tags=["excel_upload"],
)

UPLOAD_DIR = "../uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Upload endpoint
@router.post("/financials/filter", response_model=ExcelUploadResponse)
async def upload_excel(request: ExcelUploadRequest = Body(...)):
    """
    Endpoint to upload and process an Excel file.
    Supports optional date range and location filtering.
    """
    try:
        # print(f"Received file upload: {request.fileName}")
        
        # fileName = request.fileName
        fileName = "20250514_200147_midtown_east_dashboard2_template1.xlsx"
        file_location = os.path.join(UPLOAD_DIR, fileName)
        
        # Decode base64 file content
        # print("Type of file_content:", type(file_content))
        # file_content = base64.b64decode(request.fileContent)
        # print("Type of file_content:", type(file_content))
        
        # # Create BytesIO object for pandas
        # excel_data = io.BytesIO(file_content)
        
        # # Save file to disk with timestamp and location
        # timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        # location_slug = ""
        
        # # If location is provided, include it in the filename
        # if request.location:
        #     location_slug = f"{request.location.replace(' ', '_').lower()}_"
            
        # file_path = os.path.join(UPLOAD_DIR, f"{timestamp}_{location_slug}{request.fileName}")
        
        # with open(file_path, "wb") as f:
        #     f.write(file_content)
        
        # print('Processing uploaded file:', request.fileName)
        # if request.location:
        #     print('Location:', request.location)
            
        if request.dashboard == "Financials":
            print("Dashboard type: Financials")
            # print("i am here 4")
            # excel_data = io.BytesIO(file_content)

            financials_weeks, financials_years, financials_stores, financials_sales_table, financials_orders_table, financials_avg_ticket_table, financials_tw_lw_bdg_table = process_financials_file(
                file_location, 
                location=request.location,
                year=request.year,
                week_range=request.weekRange,
            )
            # print("financials_weeks type:", type(financials_weeks))
            # print("financials_weeks:", financials_weeks)
            # print( "table2", [{"financials_sales_table": [financials_sales_table]}])
            
# Ensure all returned values are properly converted to JSON-serializable formats
            # return {"hello": "world"}
            result = {
            "table1": [{"financials_weeks": [financials_weeks], "financials_years": [financials_years], "financials_stores": [financials_stores]}],
            "table2": financials_sales_table.to_dict(orient='records'),
            "table3": financials_orders_table.to_dict(orient='records'),
            "table4": financials_avg_ticket_table.to_dict(orient='records'),
            "table5": financials_tw_lw_bdg_table.to_dict(orient='records'),
            "locations": ["test"],
            "dateRanges": ["test"],
            "fileLocation":["test"],
            "data":  "Financial Dashboard is not yet implemented."
            
        }
        #        result = {
        #     "table1": [{"financials_weeks": [financials_weeks], "financials_years": [financials_years], "financials_stores": [financials_stores]}],
        #     "table2": financials_sales_table.to_dict(orient='records'),
        #     "table3": financials_orders_table.to_dict(orient='records'),
        #     "table4": financials_avg_ticket_table.to_dict(orient='records'),
        #     "table5": financials_tw_lw_bdg_table.to_dict(orient='records'),
        #     "locations": [financials_stores],
        #     "default_location": "xyz",
        #     "locations_range": [financials_stores],
        #     "weekRange": ["test"],
        #     "fileLocation":["test"],
        #     "defaultLocation": "xyz",
        #     "fileName": request.fileName,
        #     "dashboardName": "Financials",
        #     "data":  "Financial Dashboard is not yet implemented."
            
        # }
            print("result", result )
            
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

