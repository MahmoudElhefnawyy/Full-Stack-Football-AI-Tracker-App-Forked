FROM python:3.11-slim

WORKDIR /backend

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Expose port
EXPOSE 8000

CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
