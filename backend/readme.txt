python -m venv xcelbot
xcelbot\Scripts\activate

pip install -r requirements.txt


streamlit run app.py
uvicorn app:app --reload
