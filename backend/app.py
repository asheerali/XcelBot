from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
import os
from datetime import datetime, timedelta
import traceback

# Import from local modules
from models import ExcelUploadRequest, ExcelFilterRequest, ExcelUploadResponse
from excel_processor import process_excel_file
from utils import find_file_in_directory

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
        # Decode base64 file content
        file_content = base64.b64decode(request.fileContent)
        
        # Create BytesIO object for pandas
        excel_data = io.BytesIO(file_content)
        
        # Save file to disk with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = os.path.join(UPLOAD_DIR, f"{timestamp}_{request.fileName}")
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        print('Processing uploaded file:', request.fileName)
        
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
        
        if 'locations' not in result:
            result['locations'] = []
            
        if 'dateRanges' not in result:
            result['dateRanges'] = []
        
        # Return the properly structured response
        return ExcelUploadResponse(**result)
        
    except Exception as e:
        # Log the full exception for debugging
        print(f"Error processing file: {str(e)}")
        print(traceback.format_exc())
        
        # Raise HTTP exception
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

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
        
        # Check if we have the file in the uploads directory
        file_path = find_file_in_directory(UPLOAD_DIR, request.fileName)
        
        # If not found, check if fileContent is provided
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
        
        if 'locations' not in result:
            result['locations'] = []
            
        if 'dateRanges' not in result:
            result['dateRanges'] = []
        
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

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)