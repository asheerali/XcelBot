python -m venv xcelbot
xcelbot\Scripts\activate
source xcelbot/bin/activate

pip install -r requirements.txt


streamlit run app.py
uvicorn app:app --reload


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
to show the list of entries in the db
/mails
to create emails only email and time in hours and minutes
/mails/createmails
Delete entries by emails
/mails/deleteschedule/{email}
to get the list of emails with in the companyid for the user suggestions
/mails/mailslist/{company_id}
to update the emails by mail id
mail/updatemail/{mail_id}


email schduller button shows list of enters from /mails

