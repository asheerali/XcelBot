python -m venv xcelbot
xcelbot\Scripts\activate

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



