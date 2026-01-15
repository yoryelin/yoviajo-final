# YoViajoGemini

> **Status**: Development Phase (Dockerized)

## 🚀 Quick Start (Docker)

The easiest way to run the application is using Docker. This ensures you have the correct environment for both Backend and Frontend.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Run

```bash
docker-compose up --build
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8003/docs](http://localhost:8003/docs)

### Stop

Press `Ctrl+C` in the terminal.

---

## 🛠️ Manual Setup (Legacy)

### Backend

```bash
cd backend
python -m venv venv
# Activate venv
pip install -r requirements.txt
python run.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
