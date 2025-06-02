from fastapi import APIRouter, HTTPException
from fastapi import HTTPException, Body
import os
import traceback

# Import from local modules
from models import FinancialCompanyWideUploadRequest, DashboardResponse
from financials_dashboard.financials_processor import process_financials_file
from constants import *

router = APIRouter(
    prefix="/api",
    tags=["financials_filter"],
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Upload endpoint
@router.post("/financials/filter", response_model=DashboardResponse)
async def upload_excel(request: FinancialCompanyWideUploadRequest = Body(...)):
    """
    Endpoint to upload and process an Excel file.
    Supports optional date range and location filtering.
    """
    try:
        # print(f"Received file upload: {request.fileName}")
        
        fileName = request.fileName
        print("i am here in the financials filter endpoint", request)
        # fileName = "20250514_200147_midtown_east_dashboard2_template1.xlsx"
        file_location = os.path.join(UPLOAD_DIR, fileName)
        
        year = request.year if request.year else "All"
        week_range = request.weekRange if request.weekRange else "All"
        if request.location == "Multiple Locations":
            location_filter = "All"
        else:
            location_filter = request.location if request.location else 'All'
        # location = request.location if request.location else "All"
        start_date = request.startDate if request.startDate else None
        end_date = request.endDate if request.endDate else None
        
        print("this is the year", year)


        (financials_weeks, 
         financials_years, 
         financials_stores, 
         financials_sales_table, 
         financials_orders_table, 
         financials_avg_ticket_table, 
         financials_tw_lw_bdg_table, 
         years, 
         dates, 
         stores)  = process_financials_file(
                file_location,  
                year=year, 
                week_range=week_range, 
                location=location_filter, 
                start_date=start_date,
                end_date=end_date
                )
            
        financials_result = {
            "table1": [{"financials_sales": 45000, 
                        "financials_labor_cost": 33 , 
                        "financials_avg_ticket": 13.4,
                        "financials_prime_cost": 12.4,
                        "financials_food_cost": 11.4,
                        "financials_spmh": 10.4,
                        "financials_lmph": 9.4,
                        }],
            "table2": financials_sales_table.to_dict(orient='records'),
            "table3": financials_orders_table.to_dict(orient='records'),
            "table4": financials_avg_ticket_table.to_dict(orient='records'),
            "table5": financials_tw_lw_bdg_table.to_dict(orient='records'),
            "table6": financials_sales_df1.to_dict(orient='records'),  
            "table7": financials_labor_df.to_dict(orient='records'),
            "table8": financials_avg_ticker_df.to_dict(orient='records'),
            "table9": financials_prime_cost_df.to_dict(orient='records'),
            "table10": financials_food_cost_df.to_dict(orient='records'),
            "table11": financials_spmh_df.to_dict(orient='records'),
            "table12": financials_lpmh_df.to_dict(orient='records'),
            "table13": financials_weekly_sales_df.to_dict(orient='records'),
            "table14": financials_orders_by_day_df.to_dict(orient='records'),
            "table15": financials_average_ticket_df.to_dict(orient='records'),
            "table16": financials_kpi_vs_budget_df.to_dict(orient='records'),
            "fileName": request.fileName, #the full names of the file saved in the uploads folder
            "locations": stores,
            # "years": years,
            # "dates": dates,
            "dashboardName": "Financials",
            "data":  "Financial Dashboard is not yet implemented."
            }
                       
            
        return financials_result
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

