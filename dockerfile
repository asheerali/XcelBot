# Use Python base image which is more suitable for pandas
FROM python:3.9-slim

# Install Node.js
RUN apt-get update && apt-get install -y nodejs npm

# Set up frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./

# Set up backend
WORKDIR /app/backend
COPY backend/requirements.txt .

# Install Python dependencies - use binary wheels when possible
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --prefer-binary -r requirements.txt

COPY backend/ ./

# Expose both ports
EXPOSE 8000 5173

# Start both servers
CMD ["sh", "-c", "cd /app/frontend && npm run dev -- --host 0.0.0.0 & cd /app/backend && python app.py"]