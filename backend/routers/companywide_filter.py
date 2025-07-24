# from fastapi import APIRouter, Depends, HTTPException
# from fastapi import FastAPI, HTTPException, Body
# from fastapi.middleware.cors import CORSMiddleware
# import os
# import traceback

# import pandas as pd
# # Import from local modules
# from models_pydantic import FinancialCompanyWideUploadRequest, ExcelUploadResponse , DashboardResponse
# from companywide_dashboard.companywide_processor import process_companywide_file



from fastapi import APIRouter, Depends, HTTPException
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import os
import traceback
import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

# Import from local modules
from models_pydantic import FinancialCompanyWideUploadRequest, ExcelUploadResponse, DashboardResponse
from companywide_dashboard.companywide_processor import process_companywide_file
from models.financials_company_wide import FinancialsCompanyWide
from models.budget import Budget
from database import get_db

router = APIRouter(
    prefix="/api",
    tags=["companywide_filter"],
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# # Upload endpoint
# @router.post("/companywide/filter", response_model=DashboardResponse)
# async def upload_excel(request: FinancialCompanyWideUploadRequest = Body(...)):
#     """
#     Endpoint to upload and process an Excel file.
#     Supports optional date range and location filtering.
#     """
#     try:
#         print(f"Received file upload in companywide filters: {request}")
        
#         fileName = request.fileName
#         # fileName = "20250514_200147_midtown_east_dashboard2_template1.xlsx"
#         file_location = os.path.join(UPLOAD_DIR, fileName)
#         if request.locations == "Multiple Locations":
#             location_filter = "All"
#         else:
#             location_filter = request.locations if request.locations else 'All'
#         # year = request.year if request.year else "All"
#         # quarter_filter = request.quarter if request.quarter else 'All'
#         # week_range = request.weekRange if request.weekRange else 'All'
#         start_date = request.startDate if request.startDate else None
#         end_date = request.endDate if request.endDate else None
            
            
            
@router.post("/companywide/filter", response_model=DashboardResponse)
async def filter_companywide_data(
    request: FinancialCompanyWideUploadRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Endpoint to filter previously processed company wide data by date range and location from database.
    Similar to financials_filter but for company wide dashboard data.
    """
    print(f"Received company wide filter request: {request}")
    try:
        print(f"Processing company wide filter request...")
        
        # Extract filter parameters
        if request.locations == "Multiple Locations":
            location_filter = "All"
        else:
            location_filter = request.locations if request.locations else 'All'
        
        # Convert all locations to lowercase if it's a list
        if isinstance(location_filter, list):
            location_filter = [loc.lower() for loc in location_filter]
        elif isinstance(location_filter, str) and location_filter != 'All':
            location_filter = location_filter.lower()

        # Handle year filter
        year_filter = request.year if request.year else None
        
        # Convert dates to pandas datetime objects for consistent handling
        start_date_original = request.startDate if request.startDate else None
        end_date_original = request.endDate if request.endDate else None
        
        start_date_pd = None
        end_date_pd = None
        
        if start_date_original:
            start_date_pd = pd.to_datetime(start_date_original).date()
            print(f"Converted start_date to pandas datetime: {start_date_pd}")
        
        if end_date_original:
            end_date_pd = pd.to_datetime(end_date_original).date()
            print(f"Converted end_date to pandas datetime: {end_date_pd}")
        
        print(f"Filters applied - Location: {location_filter}, Year: {year_filter}, Start: {start_date_pd}, End: {end_date_pd}")
        
        # ===== QUERY DATABASE FOR FINANCIALS DATA =====
        print("Querying database for financials data...")
        
        # Handle company_id
        if not hasattr(request, 'company_id') or not request.company_id:
            company_id = 1  # Default fallback
        else:
            company_id = request.company_id
        
        print(f"Using company_id: {company_id}")
        
        # Build the base query for financials
        financials_query = db.query(FinancialsCompanyWide).filter(FinancialsCompanyWide.company_id == company_id)
        
        # # Apply year filter
        # if year_filter and year_filter != "All":
        #     financials_query = financials_query.filter(FinancialsCompanyWide.Year == year_filter)
        
        # Apply date filters using Ly_Date if available
        if start_date_pd is not None:
            financials_query = financials_query.filter(FinancialsCompanyWide.Date >= start_date_pd)
            
        if end_date_pd is not None:
            end_datetime = end_date_pd + timedelta(days=1)  # Include end date
            financials_query = financials_query.filter(FinancialsCompanyWide.Date < end_datetime)
        
        # Apply location filter
        if location_filter != "All" and location_filter:
            if isinstance(location_filter, list):
                financials_query = financials_query.filter(FinancialsCompanyWide.Store.in_(location_filter))
            else:
                financials_query = financials_query.filter(FinancialsCompanyWide.Store == location_filter)
        
        # Execute query and get results
        financials_records = financials_query.all()
        print(f"Retrieved {len(financials_records)} financials records from database")
        
        
        if not financials_records:
            print("No records found with applied filters")
            # Return empty dashboard structure
            empty_dashboard = {
                "table1": [],
                "table2": [],
                "table3": [],
                "table4": [],
                "table5": [],
                "table6": [],
                "table7": [],
                "locations": [],
                "dashboardName": "Sales Wide",
                "fileName": "Database Query",
                "data": "No data found with the applied filters."
            }
            return empty_dashboard
        
        # ===== CONVERT FINANCIALS RECORDS TO DATAFRAME =====
        print("Converting financials database records to DataFrame...")
        
        financials_df_data = []
        for record in financials_records:
            # Convert each record to dictionary matching the column structure
            record_dict = {
                'Store': record.Store,
                'Ly_Date': record.Ly_Date,
                'Date': record.Date,
                'Day': record.Day,
                'Week': record.Week,
                'Month': record.Month,
                'Quarter': record.Quarter,
                'Year': record.Year,
                'Helper_1': record.Helper_1,
                'Helper_2': record.Helper_2,
                'Helper_3': record.Helper_3,
                'Helper_4': record.Helper_4,
                'Tw_Sales': record.Tw_Sales,
                'Lw_Sales': record.Lw_Sales,
                'Ly_Sales': record.Ly_Sales,
                'Tw_Orders': record.Tw_Orders,
                'Lw_Orders': record.Lw_Orders,
                'Ly_Orders': record.Ly_Orders,
                'Tw_Avg_Tckt': record.Tw_Avg_Tckt,
                'Lw_Avg_Tckt': record.Lw_Avg_Tckt,
                'Ly_Avg_Tckt': record.Ly_Avg_Tckt,
                'Tw_Labor_Hrs': record.Tw_Labor_Hrs,
                'Lw_Labor_Hrs': record.Lw_Labor_Hrs,
                'Tw_Reg_Pay': record.Tw_Reg_Pay,
                'Lw_Reg_Pay': record.Lw_Reg_Pay,
                'Tw_SPMH': record.Tw_SPMH,
                'Lw_SPMH': record.Lw_SPMH,
                'Tw_LPMH': record.Tw_LPMH,
                'Lw_LPMH': record.Lw_LPMH,
                'Tw_COGS': record.Tw_COGS,
                'TW_Johns': record.TW_Johns,
                'TW_Terra': record.TW_Terra,
                'TW_Metro': record.TW_Metro,
                'TW_Victory': record.TW_Victory,
                'TW_Central_Kitchen': record.TW_Central_Kitchen,
                'TW_Other': record.TW_Other,
                'Unnamed_36': record.Unnamed_36,
                'Unnamed_37': record.Unnamed_37,
                'Unnamed_38': record.Unnamed_38,
                'Unnamed_39': record.Unnamed_39,
                'Lw_COGS': record.Lw_COGS,
                'LW_Johns': record.LW_Johns,
                'LW_Terra': record.LW_Terra,
                'LW_Metro': record.LW_Metro,
                'LW_Victory': record.LW_Victory,
                'LW_Central_Kitchen': record.LW_Central_Kitchen,
                'LW_Other': record.LW_Other
            }
            financials_df_data.append(record_dict)
        
        # Create financials DataFrame
        df_financials = pd.DataFrame(financials_df_data) if financials_df_data else pd.DataFrame()
        print(f"Created financials DataFrame with shape: {df_financials.shape}")
        
        
        # ===== FIX DATA TYPES FOR FINANCIALS =====
        if not df_financials.empty:
            print("Converting financials data types...")
            
            # Convert datetime columns
            datetime_columns = ['Ly_Date']
            for col in datetime_columns:
                if col in df_financials.columns:
                    df_financials[col] = pd.to_datetime(df_financials[col], errors='coerce')
            
            # Convert string columns
            string_columns = ['Store', 'Date', 'Day', 'Month']
            for col in string_columns:
                if col in df_financials.columns:
                    df_financials[col] = df_financials[col].astype(str)
            
            # Convert numeric columns
            numeric_columns = ['Week', 'Quarter', 'Year', 'Tw_Sales', 'Lw_Sales', 'Ly_Sales', 
                             'Tw_Orders', 'Lw_Orders', 'Ly_Orders', 'Tw_Avg_Tckt', 'Lw_Avg_Tckt', 'Ly_Avg_Tckt',
                             'Tw_Labor_Hrs', 'Lw_Labor_Hrs', 'Tw_Reg_Pay', 'Lw_Reg_Pay', 'Tw_SPMH', 'Lw_SPMH',
                             'Tw_LPMH', 'Lw_LPMH', 'Tw_COGS', 'Lw_COGS']
            for col in numeric_columns:
                if col in df_financials.columns:
                    df_financials[col] = pd.to_numeric(df_financials[col], errors='coerce').fillna(0)
        


        print("Company wide filter endpoint after converting the data types")
        print(f"Financials DataFrame head:\n{df_financials.head()}")
  

        (sales_df, 
         order_df, 
         avg_ticket_df, 
         cogs_df, 
         reg_pay_df, 
         lb_hrs_df, 
         spmh_df, 
         years, 
         dates, 
         stores) = process_companywide_file(
                df1=df_financials, 
                store_filter=location_filter, 
                start_date=start_date_original,
                end_date=end_date_original
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

