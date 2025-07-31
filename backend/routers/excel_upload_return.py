# router/excel_upload_return.py

import io
from datetime import date
from dateutil.relativedelta import relativedelta

# Import dashboard processors
from financials_dashboard.financials_processor import process_financials_file
from companywide_dashboard.companywide_processor import process_companywide_file
from pmix_dashboard.pmix_processor import process_pmix_file
from sales_split_dashboard.sales_split_prcoessor import process_sales_split_file
from constants import *


def process_dashboard_data(request, df1, df2, file_name, company_id=None):
    """
    Process dashboard data based on the dashboard type specified in the request.
    
    Args:
        request: The ExcelUploadRequest object containing dashboard type and filters
        file_content: The decoded file content as bytes
        file_name: The saved file name
        
    Returns:
        List of dashboard data dictionaries
    """
    
    if request.dashboard in ["Financials and Sales Wide", "Financials", "Sales Wide", "Companywide"]:
        return process_financials_and_sales_wide(request, df1 = df1, df2 = df2, file_name = file_name, company_id = company_id)
        print(" i am here in Processing Financials and Sales Wide dashboard")
    
    elif request.dashboard in ["Sales Split and Product Mix", "Sales Split", "Product Mix"]:
        return process_sales_split_and_product_mix(request, df = df1, file_name = file_name, company_id = company_id)

    else:
        # Default case for unsupported dashboards
        return [{
            "table1": [],
            "table2": [],
            "table3": [],
            "table4": [],
            "table5": [],
            "table6": [],
            "table7": [],
            "table8": [],
            "table9": [],
            "locations": ["test"],
            "dateRanges": ["test"],
            "fileLocation": ["test"],
            "dashboardName": request.dashboard,
            "fileName": file_name,
            "data": f"{request.dashboard} Dashboard is not yet implemented."
        }]


def process_financials_and_sales_wide(request, df1, df2, file_name, company_id=None):
    """Process Financials and Sales Wide dashboard data."""
    
    print("Dashboard type:", request.dashboard)
    # excel_data_copy = io.BytesIO(file_content)

    # Process financials data
    (financials_weeks, financials_years, financials_stores, financials_sales_table, 
    financials_orders_table, financials_avg_ticket_table, financials_tw_lw_bdg_table, 
    years, dates, stores, 
    # weekly_sales_trends, 
    # avg_ticket_by_day_df,
    kpi_vs_budget_df,   
    financial_sales_table_df
         ) = process_financials_file(
        df1,
        df2,  
        year="All", 
        week_range="All", 
        location="All" 
    )
    
    # Ensure the 'Metric' column is set as index
    tw_lw_bdg_df = financials_tw_lw_bdg_table.set_index("Metric")
    financials_result = {
        "table1": [{
    "financials_sales": round(float(tw_lw_bdg_df.loc["Net Sales", "This Week"]), 2),
    "financials_labor_cost": round(float(tw_lw_bdg_df.loc["Lbr Pay", "This Week"]), 2),
    "financials_avg_ticket": round(float(tw_lw_bdg_df.loc["Avg Ticket", "This Week"]), 2),
    "financials_prime_cost": round(float(tw_lw_bdg_df.loc["Prime Cost %", "This Week"]), 2),
    "financials_food_cost": round(float(tw_lw_bdg_df.loc["Food Cost %", "This Week"]), 2),
    "financials_spmh": round(float(tw_lw_bdg_df.loc["SPMH", "This Week"]), 2),
    "financials_lmph": round(float(tw_lw_bdg_df.loc["LPMH", "This Week"]), 2),
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
        # "table13": weekly_sales_trends.to_dict(orient='records'),
        "table14": financials_orders_by_day_df.to_dict(orient='records'),
        # "table15": avg_ticket_by_day_df.to_dict(orient='records'),
       "table16": kpi_vs_budget_df.to_dict(orient='records'),
        "company_id": company_id,
        "fileName": file_name,
        "locations": stores,
        "years": years,
        "dates": dates,
        "dashboardName": "Financials",
        "data": "Financial Dashboard is not yet implemented."
    }
    # print("Result for the financials:", financials_result)
    
    startDate='2025-03-17' 
    endDate='2025-06-15'
    # Process companywide/sales wide data
    # excel_data_copy2 = io.BytesIO(file_content)
    (sales_df, order_df, avg_ticket_df, cogs_df, reg_pay_df, lb_hrs_df, 
     spmh_df, years, dates, stores) = process_companywide_file(
        df1, 
        store_filter='All', 
        year_filter=None, 
        quarter_filter='All', 
        helper4_filter='All',
        start_date=startDate,
        end_date=endDate
    )
    
    sales_wide_result = {
        "table1": sales_df.to_dict(orient='records'),
        "table2": order_df.to_dict(orient='records'),
        "table3": avg_ticket_df.to_dict(orient='records'),
        "table4": cogs_df.to_dict(orient='records'),
        "table5": reg_pay_df.to_dict(orient='records'),
        "table6": lb_hrs_df.to_dict(orient='records'),
        "table7": spmh_df.to_dict(orient='records'),
        "company_id": company_id,
        "locations": stores,
        "years": years,
        "dates": dates,
        # "fileLocation": ["test"],
        "dashboardName": "Sales Wide",
        "fileName": file_name,
        "data": "Sales Wide Dashboard data."
    }
    
    # print("Result for the sales wide:", financials_result)

    # Return appropriate result based on dashboard type
    if request.dashboard == "Financials and Sales Wide":
        return [financials_result, sales_wide_result]
    elif request.dashboard == "Financials":
        return [financials_result]
    elif request.dashboard in ["Sales Wide", "Companywide"]:
        return [sales_wide_result]


def process_sales_split_and_product_mix(request, df, file_name, company_id=None):
    """Process Sales Split and Product Mix dashboard data."""
    
    print("Dashboard type: Sales Split / Product Mix Dashboard", request.company_id)

    
    # Handle location filter
    if request.location == "Multiple Locations":
        location_filter = "All"
    else:
        location_filter = request.location if request.location else 'All'
        
    print("Location filter:", location_filter)
    server_filter = request.server if request.server else 'All'
    
    # Set dynamic dates
    default_end_date1 = date.today()
    default_end_date = default_end_date1.strftime('%Y-%m-%d')
    default_start_date = (default_end_date1 - relativedelta(months=2)).strftime('%Y-%m-%d')

    # Override with hardcoded dates for now
    default_start_date = "2025-01-01"
    default_end_date = "2025-05-31"

    start_date = request.startDate if request.startDate else None
    end_date = request.endDate if request.endDate else None
    category_filter = request.category if request.category else 'All'
    
    # Process Product Mix data
    (net_sales, orders, qty_sold, sales_by_category_df, sales_by_menu_group_df, 
     sales_by_server_df, top_selling_items_df, sales_by_location_df, 
     average_price_by_item_df, average_order_value, average_items_per_order, 
     price_changes_df, top_items_df, unique_orders, total_quantity, 
     locations, server, category, net_sales_change, orders_change, 
     qty_sold_change, average_order_value_change, average_items_per_order_change,
     unique_orders_change, total_quantity_change, sales_by_category_tables_df, 
     category_comparison_table_df, sales_by_category_by_day_table_df,
     top_vs_bottom_comparison_df, avg_orders_value_correct, avg_orders_value_change_correct) = process_pmix_file(
        # excel_data_copy,
        df, 
        start_date=start_date, 
        end_date=end_date,
        category_filter=category_filter,
        location_filter=location_filter, 
        server_filter=server_filter
    )

    pmix_dashboard = {
        "table1": [{
            "net_sales": [float(net_sales)],
            "orders": [int(orders)],
            "qty_sold": [int(qty_sold)],
            "average_order_value": [float(avg_orders_value_correct)],
            "average_items_per_order": [float(average_items_per_order)],
            "unique_orders": [int(unique_orders)],
            "total_quantity": [int(total_quantity)],
            "net_sales_change": [float(net_sales_change)],
            "orders_change": [int(orders_change)],
            "qty_sold_change": [int(qty_sold_change)],
            "average_order_value_change": [float(avg_orders_value_change_correct)],
            "average_items_per_order_change": [float(average_items_per_order_change)],
            "unique_orders_change": [int(unique_orders_change)],
            "total_quantity_change": [int(total_quantity_change)]
        }],
        "table2": sales_by_category_df.to_dict(orient='records'),
        "table3": sales_by_menu_group_df.to_dict(orient='records'),
        "table4": sales_by_server_df.to_dict(orient='records'),
        "table5": top_selling_items_df.to_dict(orient='records'),
        "table6": sales_by_location_df.to_dict(orient='records'),
        "table7": average_price_by_item_df.to_dict(orient='records'),
        "table8": price_changes_df.to_dict(orient='records'),
        "table9": top_items_df.to_dict(orient='records'),
        "table10": sales_by_category_tables_df.to_dict(orient='records'),
        "table11": category_comparison_table_df.to_dict(orient='records'),
        "table12": top_vs_bottom_comparison_df.to_dict(orient='records'),
        "table13": sales_by_category_by_day_table_df.to_dict(orient='records'),
        "company_id": company_id,
        "locations": locations,
        "servers": server,
        "categories": category,
        "dateRanges": [],
        "fileName": file_name,
        "dashboardName": "Product Mix",
        "data": "Dashboard is not yet implemented."
    }

    # Process Sales Split data
    # excel_data_copy2 = io.BytesIO(file_content)
    (sales_by_day_table, sales_by_category_table, category_comparison_table, 
     thirteen_week_category_table, pivot_table, in_house_table,
     week_over_week_table, category_summary_table, salesByWeek, 
     salesByDayOfWeek, salesByTimeOfDay, categories, locations) = process_sales_split_file(
        # excel_data_copy2,
        df, 
        start_date=start_date,
        end_date=end_date,
        location=location_filter
    )
    
    sales_split_dashboard = {
        "table1": pivot_table.to_dict(orient='records'),
        "table2": in_house_table.to_dict(orient='records'),
        "table3": week_over_week_table.to_dict(orient='records'),
        "table4": category_summary_table.to_dict(orient='records'),
        "table5": salesByWeek.to_dict(orient='records'),
        "table6": salesByDayOfWeek.to_dict(orient='records'),
        "table7": salesByTimeOfDay.to_dict(orient='records'),
        "table8": sales_by_day_table.to_dict(orient='records'),
        "table9": sales_by_category_table.to_dict(orient='records'),
        "table10": category_comparison_table.to_dict(orient='records'),
        "table11": thirteen_week_category_table.to_dict(orient='records'),
        "company_id": company_id,
        "locations": locations,
        "categories": categories,
        "dashboardName": "Sales Split",
        "fileName": file_name,
        "data": f"Sales Split Dashboard is not yet implemented."
    }
                   
    # Return appropriate result based on dashboard type
    if request.dashboard == "Sales Split and Product Mix":
        print("Returning sales_split_dashboard, pmix_dashboard")
        return [sales_split_dashboard, pmix_dashboard]
    elif request.dashboard == "Sales Split":
        print("Returning sales split result:", sales_split_dashboard)
        return [sales_split_dashboard]
    elif request.dashboard == "Product Mix":
        print("Returning product mix result:", pmix_dashboard)
        return [pmix_dashboard]