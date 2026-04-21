FROM python:3.11-slim

# Install system dependencies for OpenCV and psycop2
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/cache/*

WORKDIR /app

# Copy Agent requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Agent code
COPY . .

# Copy Backend models (needed for persistence)
# Note: In Railway, we might need a workaround or copy the Backend/app folder
# For now, we assume the Backend code is available or we copy only needed parts
# A better way is to move the persistence models to a shared 'common' package
# But for a graduation project, we'll just copy the app models here
COPY ../Backend/app/models/persistence.py ./app/models/persistence.py
COPY ../Backend/app/core/database.py ./app/core/database.py
COPY ../Backend/app/core/config.py ./app/core/config.py

# Set Python path
ENV PYTHONPATH=/app

# Start the worker
CMD ["python", "worker.py"]
