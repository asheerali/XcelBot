import pandas as pd

# Creating dummy data based on the table in the image
sales_data = {
    "Time Period": ["Tw", "Lw", "L4wt", "Ly", "Bdg"],
    "% Change": ["0%", "5.00%", "15.00%", "25.00%", "-12.00%"],
    "In-House": ["50.00%", "50.00%", "45.00%", "50.00%", "50.00%"],
    "% (+/-)_In-House": ["3.00%", "3.00%", "-4.00%", "3.00%", "-14.00%"],
    "1p": ["25.00%", "25.00%", "23.00%", "25.00%", "25.00%"],
    "% (+/-)_1p": ["3.00%", "3.00%", "-5.00%", "3.00%", "-14.00%"],
    "3p": ["17.00%", "17.00%", "22.00%", "17.00%", "17.00%"],
    "% (+/-)_3p": ["3.00%", "3.00%", "-4.00%", "3.00%", "-14.00%"],
    "Catering": ["8.00%", "8.00%", "10.00%", "8.00%", "8.00%"],
    "% (+/-)_Catering": ["3.00%", "3.00%", "-4.00%", "3.00%", "-14.00%"],
    "TTL": ["100.00%", "100.00%", "100.00%", "100.00%", "100.00%"]
}

# Creating DataFrame
financials_sales_df = pd.DataFrame(sales_data)

# Creating dummy data for the second table from the image
data2 = {
    "Time Period": ["Tw", "Lw", "L4wt", "Ly", "Bdg"],
    "% Change": ["0%", "5.00%", "-15.00%", "25.00%", "-12.00%"],
    "Manager": ["15.25%", "15.25%", "18.25%", "15.25%", "15.25%"],
    "% (+/-)_Manager": ["3.00%", "3.00%", "-5.00%", "3.00%", "-14.00%"],
    "FOH": ["15.25%", "15.25%", "15.25%", "15.25%", "15.25%"],
    "% (+/-)_FOH": ["3.00%", "3.00%", "-5.00%", "3.00%", "-14.00%"],
    "BOH": ["15.25%", "15.25%", "16.25%", "15.25%", "16.25%"],
    "% (+/-)_BOH": ["3.00%", "3.00%", "-5.00%", "3.00%", "-14.00%"],
    "Training": ["15.25%", "15.25%", "19.25%", "15.25%", "15.25%"],
    "% (+/-)_Training": ["3.00%", "3.00%", "-4.00%", "3.00%", "-14.00%"],
    "Other": ["15.25%", "18.25%", "18.25%", "18.25%", "15.25%"]
}

# Creating DataFrame
financials_labor_df = pd.DataFrame(data2)


# Creating dummy data for the third table from the image (Average Ticket)
data3 = {
    "Time Period": ["Tw", "Lw", "L4wt", "Ly", "Bdg"],
    "% Change": ["0%", "5.00%", "-15.00%", "25.00%", "-12.00%"],
    "In-House": ["$16.25", "$16.25", "$16.57", "$14.50", "$19.50"],
    "% (+/-)_In-House": ["3.00%", "3.00%", "-5.00%", "3.00%", "-14.00%"],
    "1p": ["$16.25", "$16.25", "$16.57", "$14.50", "$19.50"],
    "% (+/-)_1p": ["3.00%", "3.00%", "-5.00%", "3.00%", "-14.00%"],
    "3p": ["$16.25", "$16.25", "$16.57", "$14.50", "$19.50"],
    "% (+/-)_3p": ["3.00%", "3.00%", "-5.00%", "3.00%", "-14.00%"],
    "Catering": ["$16.25", "$16.25", "$16.57", "$14.50", "$19.50"],
    "% (+/-)_Catering": ["3.00%", "3.00%", "-5.00%", "3.00%", "-14.00%"],
    "Avg": ["$16.25", "$16.25", "$16.57", "$14.50", "$19.50"]
}

# Creating DataFrame
financials_avg_ticker_df = pd.DataFrame(data3)

# Creating dummy data for the fourth table from the image (Prime Cost)
data4 = {
    "Time Period": ["Tw", "Lw", "L4wt", "Ly", "Bdg"],
    "% Change": ["0%", "5.00%", "-15.00%", "25.00%", "-12.00%"],
    "Labor": ["15.25%", "15.25%", "18.25%", "15.25%", "15.25%"],
    "% (+/-)_Labor": ["3.00%", "3.00%", "-5.00%", "3.00%", "-14.00%"],
    "Food": ["15.25%", "15.25%", "15.25%", "15.25%", "15.25%"],
    "% (+/-)_Food": ["3.00%", "3.00%", "-5.00%", "3.00%", "-14.00%"],
    "Paper": ["15.25%", "15.25%", "16.25%", "15.25%", "16.25%"],
    "% (+/-)_Paper": ["3.00%", "3.00%", "-5.00%", "3.00%", "-14.00%"],
    "OK": ["15.25%", "15.25%", "19.25%", "15.25%", "15.25%"],
    "% (+/-)_OK": ["3.00%", "3.00%", "-4.00%", "3.00%", "-14.00%"],
    "Other": ["15.25%", "15.25%", "18.25%", "15.25%", "15.25%"]
}

# Creating DataFrame
financials_prime_cost_df = pd.DataFrame(data4)

# Creating dummy data for the fifth table from the image (Food Cost)
data5 = {
    "Time Period": ["Tw", "Lw", "L4wt", "Ly", "Bdg"],
    "% Change": ["-", "5.00%", "-15.00%", "25.00%", "-12.00%"],
    "Johns": ["15.25%", "15.25%", "16.25%", "15.25%", "15.25%"],
    "% (+/-)_Johns": ["3.00%", "3.00%", "-5.00%", "3.00%", "-14.00%"],
    "Terra": ["15.25%", "15.25%", "16.25%", "15.25%", "15.25%"],
    "% (+/-)_Terra": ["3.00%", "3.00%", "-5.00%", "3.00%", "-14.00%"],
    "Metro": ["15.25%", "15.25%", "16.25%", "15.25%", "15.25%"],
    "% (+/-)_Metro": ["3.00%", "3.00%", "-5.00%", "3.00%", "-14.00%"],
    "Victory": ["15.25%", "15.25%", "16.25%", "15.25%", "15.25%"],
    "% (+/-)_Victory": ["3.00%", "3.00%", "-5.00%", "3.00%", "-14.00%"],
    "Ck": ["15.25%", "15.25%", "16.25%", "15.25%", "15.25%"]
}

# Creating DataFrame
financials_food_cost_df = pd.DataFrame(data5)

# Creating dummy data for the sixth table from the image (SPMH)
data6 = {
    "Time Period": ["Tw", "Lw", "L4wt", "Ly", "Bdg"],
    "$ Change": ["$65.15", "$66.15", "$64.25", "$44.25", "$64.29"],
    "% Change": ["5.00%", "6.00%", "-15.00%", "25.00%", "-12.00%"]
}

# Creating DataFrame
financials_spmh_df = pd.DataFrame(data6)


# Creating dummy data for the seventh table from the image (LPMH)
data7 = {
    "Time Period": ["Tw", "Lw", "L4wt", "Ly", "Bdg"],
    "$ Change": ["$17.25", "$17.25", "$15.25", "$14.66", "$18.25"],
    "% Change": ["5.00%", "5.00%", "-15.00%", "25.00%", "-12.00%"]
}

# Creating DataFrame
financials_lpmh_df = pd.DataFrame(data7)

weekly_sales_data = {
    "Day": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "This Week": [8.4, 8.7, 9.2, 8.0, 8.8, 8.6, 8.5],
    "Last Week": [8.2, 8.1, 8.8, 8.7, 8.3, 8.2, 8.1],
    "Last Year": [7.8, 7.5, 8.1, 7.9, 8.2, 8.0, 7.7],
    "L4wt": [8.6, 8.9, 9.1, 8.2, 9.0, 8.7, 8.4],
    "Bdg": [7.9, 8.0, 8.2, 7.8, 8.0, 7.9, 7.8]
}

# Updated Orders by Day of Week with L4wt and Bdg added
orders_by_day_data = {
    "Day": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "This Week": [220, 240, 210, 190, 200, 230, 225],
    "Last Week": [210, 230, 210, 185, 195, 225, 220],
    "Last Year": [200, 220, 205, 180, 190, 215, 210],
    "L4wt": [215, 235, 220, 200, 210, 240, 230],
    "Bdg": [205, 215, 200, 190, 200, 220, 215]
}

# Creating DataFrames
financials_weekly_sales_df = pd.DataFrame(weekly_sales_data)
financials_orders_by_day_df = pd.DataFrame(orders_by_day_data)

# Updated Average Ticket data with L4wt and Bdg included
average_ticket_data_ext = {
    "Day": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "This Week": [8.4, 8.7, 9.2, 8.0, 8.8, 8.6, 8.5],
    "Last Week": [8.2, 8.1, 8.8, 8.7, 8.3, 8.2, 8.1],
    "Last Year": [7.8, 7.5, 8.1, 7.9, 8.2, 8.0, 7.7],
    "L4wt": [8.6, 8.9, 9.1, 8.2, 9.0, 8.7, 8.4],
    "Bdg": [7.9, 8.0, 8.2, 7.8, 8.0, 7.9, 7.8]
}

# Updated KPI vs Budget with dummy L4wt and Bdg values
kpi_vs_budget_data_ext = {
    "Metric": ["Net Sales", "Orders", "Avg Ticket", "Food Cost %"],
    "This Week": ["3,406,791", "152,562", "22.93", "32.8%"],
    "Budget": ["3,178,203", "423,065", "21.69", "29.6%"],
    "L4wt": ["3,210,000", "148,000", "22.75", "30.5%"],
    "Bdg": ["3,000,000", "155,000", "23.10", "31.0%"],
    "Tw/Bdg (+/-)": ["-61.5", "-63.9", "+3.7", "+3.0"],
    "Percent Change": ["8%", "89%", "5%", "6%"]
}

# Creating extended DataFrames
financials_average_ticket_df = pd.DataFrame(average_ticket_data_ext)
financials_kpi_vs_budget_df = pd.DataFrame(kpi_vs_budget_data_ext)


# Creating dummy data based on the table in the image
sales_data1 = {
    "Time Period": ["Tw", "Lw", "L4wt", "Ly", "Bdg"],
    "% Change": ["1%", "1%", "1.00%", "1.00%", "-1.00%"],
    "In-House": ["1.00%", "1.00%", "1.00%", "1.00%", "1.00%"],
    "% (+/-)_In-House": ["1.00%", "1.00%", "-1.00%", "1.00%", "-1.00%"],
    "1p": ["1.00%", "1.00%", "1.00%", "1.00%", "1.00%"],
    "% (+/-)_1p": ["1.00%", "1.00%", "-1.00%", "1.00%", "-1.00%"],
    "3p": ["1.00%", "1.00%", "1.00%", "1.00%", "1.00%"],
    "% (+/-)_3p": ["1.00%", "1.00%", "-1.00%", "1.00%", "-1.00%"],
    "Catering": ["1.00%", "1.00%", "1.00%", "1.00%", "1.00%"],
    "% (+/-)_Catering": ["1.00%", "1.00%", "-1.00%", "1.00%", "-1.00%"],
    "TTL": ["1.00%", "1.00%", "1.00%", "1.00%", "1.00%"]
}

# Creating DataFrame
financials_sales_df1 = pd.DataFrame(sales_data1)
