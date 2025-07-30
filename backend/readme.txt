python -m venv xcelbot
xcelbot\Scripts\activate
source xcelbot/bin/activate

pip install -r requirements.txt


streamlit run app.py
<<<<<<< HEAD
uvicorn app:app --reload


<<<<<<< HEAD
=======



How Dashboard Data Routing Works
1. File Upload Phase
When a user uploads an Excel file, they select:

Location: e.g., "New York"
Dashboard Type: e.g., "Sales Split", "Financials", or "Sales Wide"

2. Backend Processing
The backend receives the request with dashboard type and returns data with dashboardName:
javascript// Backend Response Example for Different Dashboards
{
  // Financial Dashboard Response
  dashboardName: "Financials",
  table1: [{"financials_weeks": ["Week 1"], "financials_stores": ["New York"]}],
  table2: [{"netSales": "$50,000", "laborCost": "30%"}],
  table5: [{"netSales": "$50,000", "netSalesChange": "+5%"}],
  locations: ["New York"],
  data: "Financial data for New York"
}

// Sales Split Dashboard Response
{
  dashboardName: "Sales Split",
  table1: [{"Week": 1, "Sales": "$30,000", "In-House": "$20,000"}],
  table2: [{"Week": 1, "1P": "+10%", "DD": "+5%"}],
  locations: ["Midtown East"],
  data: "Sales split data for Midtown East"
}
3. Frontend Routing (ExcelUploadPage.tsx)
The upload page checks dashboardName in the response and routes data to the appropriate store:
javascript// In uploadFile function
if (response.data) {
  const dashboardName = response.data.dashboardName || fileInfo.dashboard;
  
  // Route based on dashboard type
  if (dashboardName === 'Financials') {
    dispatch(addFinancialData({
      fileName: fileInfo.file.name,
      location: fileInfo.location,
      data: response.data
    }));
  } else if (dashboardName === 'Sales Split') {
    dispatch(addSalesData({
      fileName: fileInfo.file.name,
      location: fileInfo.location,
      data: response.data
    }));
  }
  // Add for Sales Wide...
}
4. Redux Store Structure
The Redux store maintains separate arrays for each dashboard type:
javascriptstate = {
  excel: {
    // General files
    files: [],
    allLocations: ["New York", "Midtown East", "Los Angeles"],
    
    // Sales Split Dashboard
    salesFiles: [
      {
        fileName: "midtown_sales.xlsx",
        location: "Midtown East",
        data: {/* sales split data */}
      }
    ],
    salesLocations: ["Midtown East"],
    currentSalesLocation: "Midtown East",
    
    // Financial Dashboard  
    financialFiles: [
      {
        fileName: "ny_financials.xlsx",
        location: "New York",
        data: {/* financial data */}
      }
    ],
    financialLocations: ["New York"],
    currentFinancialLocation: "New York",
    
    // Sales Wide Dashboard (when added)
    salesWideFiles: [],
    salesWideLocations: [],
    currentSalesWideLocation: ""
  }
}
Adding Sales Wide Dashboard
To add a third dashboard (Sales Wide), you would:
1. Update Redux Slice
javascript// excelSlice.ts - Add Sales Wide state
interface ExcelState {
  // ... existing state
  salesWideFiles: SalesWideData[];
  salesWideLocations: string[];
  currentSalesWideLocation: string;
}

// Add action handlers
addSalesWideData: (state, action) => {
  const existingIndex = state.salesWideFiles.findIndex(
    f => f.location === action.payload.location
  );
  
  if (existingIndex >= 0) {
    state.salesWideFiles[existingIndex] = action.payload;
  } else {
    state.salesWideFiles.push(action.payload);
  }
  
  if (!state.salesWideLocations.includes(action.payload.location)) {
    state.salesWideLocations.push(action.payload.location);
  }
},
2. Update ExcelUploadPage
javascript// Add Sales Wide routing
if (dashboardName === 'Sales Wide') {
  dispatch(addSalesWideData({
    fileName: fileInfo.file.name,
    location: fileInfo.location,
    data: response.data
  }));
}

// Update navigation logic
const salesWideFiles = successfulFiles.filter(f => f.dashboard === 'Sales Wide');

if (salesWideFiles.length > 0 && financialFiles.length === 0 && salesFiles.length === 0) {
  navigate('/sales-wide');
}
3. Backend Response Example
python# app.py - Sales Wide dashboard handler
elif request.dashboard == "Sales Wide":
    result = {
        "table1": [
            {
                "location": request.location,
                "totalSales": "$500,000",
                "topProduct": "Cheeseburger",
                "growth": "+15%"
            }
        ],
        "table2": [
            {"location": "New York", "sales": "$200,000"},
            {"location": "Los Angeles", "sales": "$150,000"},
            {"location": "Chicago", "sales": "$150,000"}
        ],
        "locations": ["New York", "Los Angeles", "Chicago"],
        "dashboardName": "Sales Wide",
        "data": "Sales Wide analysis data"
    }
    return result
Complete Example Flow
Step 1: User uploads 3 files
javascript// File 1: Sales Split for Midtown East
{
  file: "midtown_sales.xlsx",
  location: "Midtown East",
  dashboard: "Sales Split"
}

// File 2: Financials for New York
{
  file: "ny_financials.xlsx",
  location: "New York", 
  dashboard: "Financials"
}

// File 3: Sales Wide for Company
{
  file: "company_sales.xlsx",
  location: "All Locations",
  dashboard: "Sales Wide"
}
Step 2: Backend processes each file
javascript// Response 1 (Sales Split)
{
  dashboardName: "Sales Split",
  table1: [{"Week": 1, "Sales": "$30,000"}],
  locations: ["Midtown East"]
}

// Response 2 (Financials)
{
  dashboardName: "Financials",
  table1: [{"financials_weeks": ["Week 1"]}],
  locations: ["New York"]
}

// Response 3 (Sales Wide)
{
  dashboardName: "Sales Wide",
  table1: [{"totalSales": "$500,000"}],
  locations: ["All Locations"]
}
Step 3: Redux Store Updated
javascriptstate.excel = {
  salesFiles: [{
    fileName: "midtown_sales.xlsx",
    location: "Midtown East",
    data: {/* sales data */}
  }],
  salesLocations: ["Midtown East"],
  
  financialFiles: [{
    fileName: "ny_financials.xlsx",
    location: "New York",
    data: {/* financial data */}
  }],
  financialLocations: ["New York"],
  
  salesWideFiles: [{
    fileName: "company_sales.xlsx",
    location: "All Locations",
    data: {/* sales wide data */}
  }],
  salesWideLocations: ["All Locations"]
}
Step 4: Dashboard Display
Each dashboard only sees its relevant data:

Sales Split Dashboard: Shows only "Midtown East" in location dropdown
Financials Dashboard: Shows only "New York" in location dropdown
Sales Wide Dashboard: Shows only "All Locations" in location dropdown

The key is that each dashboard has:

Its own files array in Redux
Its own locations array
Its own current location state
Complete isolation from other dashboards
>>>>>>> deploy
=======
MAIL_USERNAME=asheerali1997@gmail.com
MAIL_PASSWORD=qbsfjbwrjabcisbe
MAIL_FROM=asheerali1997@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_FROM_NAME=XcelBot

FRONTEND_URL=http://localhost:5173
# DATABASE_URL= postgresql://postgres:admin@localhost:5432/testdb
DATABASE_URL=sqlite:///./app.db


also send compnay id modify it to first name , last name , phone number 
post /users 
delete /users
put / users

post /stors 
delete/ stores
put /stores

post / companes
delete / companes
put / companes


api/master/upload
api/masterfile/details/{company_id}/{location_id}/{filename}
api/masterfile/updatefile


for getting the companies with locations
company-locations/all

for the reports page
api/logs/details/{company_id}

for the store orders page to show the available items 
api/masterfile/availableitems/{company_id}/{location_id}


for submitting the orders 
/api/storeorders/orderitems


for getting the details of recent orders
/api/storeorders/detailsrecent/{company_id}/{location_id}

for updating the recent orders
/api/storeorders/orderupdate/{order_id}

to get the 
avg daily -  order total order - top 2 items
/api/storeorders/analytics/{company_id}/{location_id}


for the analytics dashboard
/api/storeorders/analyticsdashboard/{company_id}/{location_id}


for the store summary dashboard
/api/storeorders/allordersinvoices/{company_id}/{location_id}
/api/storeorders/consolidatedproduction/{company_id}


for the financila summary dashboard
/api/storeorders/financialsummary/{company_id}/{location_id}
/api/storeorders/companysummary/{company_id}


for the mails schedule logic:
to show the list of entries in the db (just change this to add company_id)
/mails/{company_id}
to create emails only email and time in hours and minutes
/mails/createmails
Delete entries by emails
/mails/deleteschedule/{email}
to get the list of emails with in the companyid for the user suggestions
/mails/mailslist/{company_id}
/mails/remainingmails/{company_id}

to update the emails by mail id
mail/updatemail/{mail_id}


ai suggestions
/api/storeorders/aisuggestions/{company_id}/{location_id}



>>>>>>> integrations_v41
