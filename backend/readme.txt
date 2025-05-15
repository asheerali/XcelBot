python -m venv xcelbot
xcelbot\Scripts\activate
source xcelbot\Scripts\activate
source xcelbot/bin/activate

pip install -r requirements.txt


streamlit run app.py
uvicorn app:app --reload


