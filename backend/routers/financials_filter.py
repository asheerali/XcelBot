from fastapi import APIRouter, HTTPException
from fastapi import HTTPException, Body
import os
import traceback

# Import from local modules
from models import FinancialUploadResponse, FinancialUploadRequest
from financials_dashboard.financials_processor import process_financials_file

router = APIRouter(
    prefix="/api",
    tags=["financials_filter"],
)

UPLOAD_DIR = "../uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Upload endpoint
@router.post("/financials/filter", response_model=FinancialUploadResponse)
async def upload_excel(request: FinancialUploadRequest = Body(...)):
    """
    Endpoint to upload and process an Excel file.
    Supports optional date range and location filtering.
    """
    try:
        # print(f"Received file upload: {request.fileName}")
        
        fileName = request.fileName
        # fileName = "20250514_200147_midtown_east_dashboard2_template1.xlsx"
        file_location = os.path.join(UPLOAD_DIR, fileName)
        
            
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
                "table6": [],
                "table7": [],
                "locations": ["test"],
                "dateRanges": ["test"],
                "fileLocation":["test"],
                "fileName": "123", #the full names of the file saved in the uploads folder
                "dashboardName": "Financials",
                "data":  "Financial Dashboard is not yet implemented."
                }
                       
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

