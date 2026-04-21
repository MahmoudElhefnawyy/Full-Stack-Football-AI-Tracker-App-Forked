FROM python:3.11-slim

# Install system dependencies for OpenCV and psycop2
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/cache/*

WORKDIR /app

# Install CPU version of PyTorch to save space (avoid CUDA)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Copy Agent requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Agent code
COPY . .

# Note: We've already copied necessary Backend/app files into Agent/app/
# so they are included in the COPY . . above.

# Set Python path
ENV PYTHONPATH=/app:/app/football_analysis

# Start the worker
CMD ["python", "worker.py", "--concurrency=1"]
