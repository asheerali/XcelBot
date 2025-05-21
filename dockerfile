FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Set working directory
WORKDIR /app

# Copy and install backend
COPY backend/ ./backend/
RUN pip install --upgrade pip && pip install -r ./backend/requirements.txt

# Copy and install frontend
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm install

# Back to /app
WORKDIR /app

# Expose frontend and backend ports
EXPOSE 5173 8000

# Start both servers
CMD bash -c "cd /app/frontend && npm run dev -- --host 0.0.0.0 & cd /app/backend && python app.py"
