An Automated Excel Processing & AI-Powered Analytics Web App
backend/
├── app.py               # Main FastAPI application with endpoints
├── models.py            # Pydantic data models
├── excel_processor.py   # Excel processing functions
├── table_calculator.py  # Table calculation functions
├── utils.py             # Utility functions
└── uploads/             # Directory for uploaded files

Frontend main components 
ExcelImport.tsx - Main component with file upload logic
FilterSection.tsx - Filter controls for date and location
TableDisplay.tsx - Table rendering with different view modes


for the stripesetup:
download strip cli 
in cmd:
stripe login
stripe listen --forward-to http://localhost:8000/billing/webhook
then put the  webhook signing secret in constansts.tsx

Share this link on your site or send directly to your customers (it is in the product catalog pricing tables)
https://billing.stripe.com/p/login/test_fZuaEP2V1fg1ewJeUsdEs00