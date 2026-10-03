# GradePath

GradePath is a comprehensive academic planning web application for college students, helping them calculate, track, and project their GPA and CGPA deterministically.

## Project Structure

* `/frontend` - React/Vite application (Stitch UI matched)
* `/backend` - Express.js REST API with SQLite
* `/ml` - Python FastAPI service for ML final marks prediction

## Quick Start

1. Copy `.env.example` to `.env` in the root, `frontend`, and `backend` as needed.
2. Ensure you have Node.js and Python installed.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**ML Service:**
```bash
cd ml
pip install -r requirements.txt
uvicorn ml_service:app --reload
```
