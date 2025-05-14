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

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Directory to save uploaded files
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Welcome to the Excel Processing API!"}
    
    
# Add this test endpoint to verify FastAPI routing
@app.get("/api/test")
async def test_endpoint():
    return {"status": "ok", "message": "Test endpoint is working"}

# Upload endpoint
@app.post("/api/excel/upload", response_model=ExcelUploadResponse)
async def upload_excel(request: ExcelUploadRequest = Body(...)):
    """
    Endpoint to upload and process an Excel file.
    Supports optional date range and location filtering.
    """
    try:
        print(f"Received file upload: {request.fileName}")
        # Decode base64 file content
        # print("Type of file_content:", type(file_content))
        file_content = base64.b64decode(request.fileContent)
        print("Type of file_content:", type(file_content))
        
        # Create BytesIO object for pandas
        excel_data = io.BytesIO(file_content)
        
        # Save file to disk with timestamp and location
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        location_slug = ""
        
        # If location is provided, include it in the filename
        if request.location:
            location_slug = f"{request.location.replace(' ', '_').lower()}_"
            
        file_path = os.path.join(UPLOAD_DIR, f"{timestamp}_{location_slug}{request.fileName}")
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        print('Processing uploaded file:', request.fileName)
        if request.location:
            print('Location:', request.location)

            
        if request.dashboard == "Financials":
            print("Dashboard type: Financials")
            # print("i am here 4")
            excel_data_copy = io.BytesIO(file_content)

            financials_weeks, financials_years, financials_stores, financials_sales_table, financials_orders_table, financials_avg_ticket_table, financials_tw_lw_bdg_table = process_financials_file(
                excel_data_copy, 
                location=request.location
            )
            print("financials_weeks type:", type(financials_weeks))
            # print("financials_weeks:", financials_weeks)
            
# Ensure all returned values are properly converted to JSON-serializable formats
            # return {"hello": "world"}
            result = {
            "table1": [],
            "table2": [],
            "table3": [],
            "table4": [],
            "table5": [],
            "locations": [request.location],
            "dateRanges": [],
            "fileLocation":[request.location],
            "data":  "Financial Dashboard is not yet implemented."
        }
            print("result", result )
            
            return result
            # return {"message": "Financial Dashboard is not yet implemented."}
        
        if request.dashboard == "Sales Split":
            print("Dashboard type: Sales Split Dashboard")

            # Process Excel file with optional filters
            result = process_excel_file(
                excel_data, 
                start_date=request.startDate,
                end_date=request.endDate,
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
        error_message = str(e)
        print(f"Error processing file: {error_message}")
        print(traceback.format_exc())
        
            # Check for specific known error patterns
        if "Net Price" in error_message:
            raise HTTPException(
                status_code=400,
                detail=f"You uploaded the file in the wrong dashboard i.e. ({request.dashboard}) or the file is not properly structured. Please check the help center for more details."
            )
        
        # Raise HTTP exception
        raise HTTPException(status_code=500, detail=f"Error processing file: {error_message}")

# Filter endpoint
@app.post("/api/excel/filter", response_model=ExcelUploadResponse)
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

# NEW ENDPOINT: Analytics endpoint
@app.post("/api/excel/analytics", response_model=SalesAnalyticsResponse)
async def get_sales_analytics(request: ExcelFilterRequest = Body(...)):
    """
    Endpoint to generate sales analytics including time of day and day of week breakdowns.
    Uses the same filter parameters as the filter endpoint.
    """
    try:
        print(f"Received analytics request for file: {request.fileName}")
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
        
        # Generate sales analytics with filters
        result = generate_sales_analytics(
            excel_data, 
            start_date=start_date,
            end_date=end_date,
            location=request.location
        )
        
        # Add the file location to the result
        result['fileLocation'] = request.location
        
        # Return the analytics response
        return SalesAnalyticsResponse(**result)
        
    except Exception as e:
        # Log the full exception for debugging
        print(f"Error generating analytics: {str(e)}")
        print(traceback.format_exc())
        
        # Return a more specific error message
        error_message = str(e)
        if "NaTType does not support strftime" in error_message:
            error_message = "Date formatting error. This usually happens with invalid date values in your data."
        
        # Raise HTTP exception
        raise HTTPException(status_code=500, detail=f"Error generating analytics: {error_message}")

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)