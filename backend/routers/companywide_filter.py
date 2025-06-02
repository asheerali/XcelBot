from fastapi import APIRouter, Depends, HTTPException
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import os
import traceback
# Import from local modules
from models import FinancialCompanyWideUploadRequest, ExcelUploadResponse , DashboardResponse
from companywide_dashboard.companywide_processor import process_companywide_file

router = APIRouter(
    prefix="/api",
    tags=["companywide_filter"],
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Upload endpoint
@router.post("/companywide/filter", response_model=DashboardResponse)
async def upload_excel(request: FinancialCompanyWideUploadRequest = Body(...)):
    """
    Endpoint to upload and process an Excel file.
    Supports optional date range and location filtering.
    """
    try:
        # print(f"Received file upload: {request.fileName}")
        
        fileName = request.fileName
        # fileName = "20250514_200147_midtown_east_dashboard2_template1.xlsx"
        file_location = os.path.join(UPLOAD_DIR, fileName)
        
        location = request.location if request.location else 'All'
        year = request.year if request.year else "All"
        quarter_filter = request.quarter if request.quarter else 'All'
        week_range = request.weekRange if request.weekRange else 'All'
            
        sales_df, order_df, avg_ticket_df, cogs_df, reg_pay_df, lb_hrs_df, spmh_df, years, dates, stores = process_companywide_file(
                file_location, 
                store_filter=location, 
                year_filter=year, 
                quarter_filter=quarter_filter, 
                helper4_filter=week_range
            )
            
            
        sales_wide_result ={
                "table1":sales_df.to_dict(orient='records'),
                "table2":order_df.to_dict(orient='records'),
                "table3":avg_ticket_df.to_dict(orient='records'),
                "table4":cogs_df.to_dict(orient='records'),
                "table5":reg_pay_df.to_dict(orient='records'),
                "table6":lb_hrs_df.to_dict(orient='records'),
                "table7":spmh_df.to_dict(orient='records'),
                # "locations": stores,
                # "years": years,
                # "dates": dates,
                "dashboardName": "Sales Wide",
                "fileName": request.fileName, #the full names of the file saved in the uploads folder
                "data": "Sales Wide Dashboard data."
            }
            
        return sales_wide_result
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

