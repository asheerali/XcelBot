from fastapi import APIRouter, HTTPException, Depends
from fastapi import HTTPException, Body
import os
import traceback
from sqlalchemy.orm import Session

from datetime import datetime, timedelta

# Import from local modules
from models_pydantic import FinancialCompanyWideUploadRequest, DashboardResponse
from financials_dashboard.financials_processor import process_financials_file
from constants import *
from models.financials_company_wide import FinancialsCompanyWide
from models.budget import Budget
from database import get_db

router = APIRouter(
    prefix="/api",
    tags=["financials_filter"],
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/financials/filter", response_model=DashboardResponse)
async def filter_financials_data(
    request: FinancialCompanyWideUploadRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Endpoint to filter previously processed financials data by date range and location from database.
    Similar to sales_split_filter but for financials data.
    """
    print(f"Received financials filter request: {request}")
    try:
        print(f"Processing financials filter request...")
        
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
        
        # print("-----------------------------------------------------------")
        # print("i am here in the financials filter endpoint print startDate", request.startDate, " endDate", request.endDate, "location", request.locations)
        # Convert dates to pandas datetime objects for consistent handling
        start_date_original = request.startDate if request.startDate else None
        end_date_original = request.endDate if request.endDate else None
        
        start_date_pd = None
        end_date_pd = None
        
        if start_date_original:
            # start_date_pd = pd.to_datetime(start_date_original)
            start_date_pd = pd.to_datetime(start_date_original).date()
            print(f"Converted start_date to pandas datetime: {start_date_pd}")
        
        if end_date_original:
            # end_date_pd = pd.to_datetime(end_date_original)
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
        
        # ===== QUERY DATABASE FOR BUDGET DATA =====
        print("Querying database for budget data...")
        
        # Build the base query for budget
        budget_query = db.query(Budget).filter(Budget.company_id == company_id)
        
        # Apply same filters to budget data
        if year_filter and year_filter != "All":
            budget_query = budget_query.filter(Budget.Year == year_filter)
        
        # Apply location filter
        if location_filter != "All" and location_filter:
            if isinstance(location_filter, list):
                budget_query = budget_query.filter(Budget.Store.in_(location_filter))
            else:
                budget_query = budget_query.filter(Budget.Store == location_filter)
        
        # Execute budget query
        budget_records = budget_query.all()
        print(f"Retrieved {len(budget_records)} budget records from database")
        
        if not financials_records and not budget_records:
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
                "table8": [],
                "table9": [],
                "table10": [],
                "table11": [],
                "table12": [],
                "table13": [],
                "table14": [],
                "table15": [],
                "table16": [],
                "locations": [],
                "dashboardName": "Financials",
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
        
        # ===== CONVERT BUDGET RECORDS TO DATAFRAME =====
        print("Converting budget database records to DataFrame...")
        
        budget_df_data = []
        for record in budget_records:
            # Convert each record to dictionary
            record_dict = {
                'Store': record.Store,
                'Date': record.Date,
                'Week': record.Week,
                'Month': record.Month,
                'Quarter': record.Quarter,
                'Year': record.Year,
                'Helper_1': record.Helper_1,
                'Helper': record.Helper,
                'Helper_2': record.Helper_2,
                'Helper_4': record.Helper_4,
                'Sales_Pct_Contribution': record.Sales_Pct_Contribution,
                'Catering_Sales': record.Catering_Sales,
                'In_House_Sales': record.In_House_Sales,
                'Weekly_Plus_Minus': record.Weekly_Plus_Minus,
                'Net_Sales_1': record.Net_Sales_1,
                'Net_Sales': record.Net_Sales,
                'Orders': record.Orders,
                'Food_Cost': record.Food_Cost,
                'Johns': record.Johns,
                'Terra': record.Terra,
                'Metro': record.Metro,
                'Victory': record.Victory,
                'Central_Kitchen': record.Central_Kitchen,
                'Other': record.Other,
                'LPMH': record.LPMH,
                'SPMH': record.SPMH,
                'LB_Hours': record.LB_Hours,
                'Labor_Cost': record.Labor_Cost,
                'Labor_Pct_Cost': record.Labor_Pct_Cost,
                'Prime_Cost': record.Prime_Cost,
                'Prime_Pct_Cost': record.Prime_Pct_Cost,
                'Rent': record.Rent,
                'Opex_Cost': record.Opex_Cost,
                'TTL_Expense': record.TTL_Expense,
                'Net_Income': record.Net_Income,
                'Net_Pct_Income': record.Net_Pct_Income
            }
            budget_df_data.append(record_dict)
        
        # Create budget DataFrame
        df_budget = pd.DataFrame(budget_df_data) if budget_df_data else pd.DataFrame()
        print(f"Created budget DataFrame with shape: {df_budget.shape}")
        
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
                             'Tw_Orders', 'Lw_Orders', 'Ly_Orders', 'Tw_Avg_Tckt', 'Lw_Avg_Tckt', 'Ly_Avg_Tckt']
            for col in numeric_columns:
                if col in df_financials.columns:
                    df_financials[col] = pd.to_numeric(df_financials[col], errors='coerce').fillna(0)
        
        # ===== FIX DATA TYPES FOR BUDGET =====
        if not df_budget.empty:
            print("Converting budget data types...")
            
            # Convert string columns
            string_columns = ['Store', 'Date', 'Month']
            for col in string_columns:
                if col in df_budget.columns:
                    df_budget[col] = df_budget[col].astype(str)
            
            # Convert numeric columns
            numeric_columns = ['Week', 'Quarter', 'Year', 'Net_Sales', 'Orders', 'Food_Cost']
            for col in numeric_columns:
                if col in df_budget.columns:
                    df_budget[col] = pd.to_numeric(df_budget[col], errors='coerce').fillna(0)

        # print("i am here in the financials filter endpoint after converting the data types",    "\n", df_financials.head(), "\n", "df_budget","\n" ,  df_budget.head())

        print("i am checking the date afer converting the date type", start_date_original, end_date_original, type(start_date_original), type(end_date_original))

        # start_month = pd.to_datetime(start_date_original).day()
        # end_month = pd.to_datetime(end_date_original).day()

        # print("i am here in the financials filter endpoint after converting the data types",    "\n", start_month, end_month, type(start_month), type(end_month))

        print( " i am here in the financials filter financials_sales_df1", financials_sales_df1.head() )      

        (financials_weeks, 
         financials_years, 
         financials_stores, 
         financials_sales_table, 
         financials_orders_table, 
         financials_avg_ticket_table, 
         financials_tw_lw_bdg_table, 
         years, 
         dates, 
         stores, 
        #  weekly_sales_trends, 
        #  avg_ticket_by_day_df,
         kpi_vs_budget_df,
         financial_sales_table_df
         )  = process_financials_file(
                df1 = df_financials,
                df2 = df_budget,  
                location=location_filter, 
                start_date=start_date_original,
                end_date=end_date_original,
                year="All",
                week_range="All",
                )
            # Ensure the 'Metric' column is set as index
        tw_lw_bdg_df = financials_tw_lw_bdg_table.set_index("Metric")
        financials_result = {
       "table1": [{
        "financials_sales": float(tw_lw_bdg_df.loc["Net Sales", "This Week"]),
        "financials_labor_cost": float(tw_lw_bdg_df.loc["Lbr Pay", "This Week"]),
        "financials_avg_ticket": float(tw_lw_bdg_df.loc["Avg Ticket", "This Week"]),
        "financials_prime_cost": float(tw_lw_bdg_df.loc["Prime Cost %", "This Week"]),
        "financials_food_cost": float(tw_lw_bdg_df.loc["Food Cost %", "This Week"]),
        "financials_spmh": float(tw_lw_bdg_df.loc["SPMH", "This Week"]),
        "financials_lmph": float(tw_lw_bdg_df.loc["LPMH", "This Week"]),
        }],
       "table2": financials_sales_table.to_dict(orient='records'),
            "table3": financials_orders_table.to_dict(orient='records'),
            "table4": financials_avg_ticket_table.to_dict(orient='records'),
            "table5": financials_tw_lw_bdg_table.to_dict(orient='records'),
            "table6": financial_sales_table_df.to_dict(orient='records'),  
            "table7": financials_labor_df.to_dict(orient='records'),
            "table8": financials_avg_ticker_df.to_dict(orient='records'),
            "table9": financials_prime_cost_df.to_dict(orient='records'),
            "table10": financials_food_cost_df.to_dict(orient='records'),
            "table11": financials_spmh_df.to_dict(orient='records'),
            "table12": financials_lpmh_df.to_dict(orient='records'),
            # "table13": financials_weekly_sales_df.to_dict(orient='records'),
            # "table13": weekly_sales_trends.to_dict(orient='records'),
            "table14": financials_orders_by_day_df.to_dict(orient='records'),
            # "table15": financials_average_ticket_df.to_dict(orient='records'),
            # "table15": avg_ticket_by_day_df.to_dict(orient='records'),
            # "table16": financials_kpi_vs_budget_df.to_dict(orient='records'),
            "table16": kpi_vs_budget_df.to_dict(orient='records'),
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

