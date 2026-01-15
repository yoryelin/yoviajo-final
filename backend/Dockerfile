# Backend Dockerfile
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies (needed for some python packages like psycopg2 later)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port (Internal container port)
EXPOSE 8003

# Command to run the application
# Use shell form to allow expansion if needed, but array form is preferred
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8003"]
