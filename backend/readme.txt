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
/api/storeorders/orderupdate
