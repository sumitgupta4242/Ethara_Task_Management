# Ethara Task Manager

A professional team task management system with role-based access control (Admin → QL → Member), built with **FastAPI** + **React**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy 2.0, SQLite/MySQL |
| Auth | JWT + Google OAuth2 |
| Frontend | React 18, Vite, Vanilla CSS |
| Icons | Custom SVG (no emojis) |

## Quick Start

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.seed        # Seed demo data
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ethara.com | admin123 |
| QL | ql1@ethara.com | ql12345 |
| QL | ql2@ethara.com | ql12345 |
| Member | member1@ethara.com | member123 |

## Features

- **Role-Based Access**: Admin, Quality Lead, Member
- **Kanban Board**: Visual task management with drag columns
- **Task Lifecycle**: Backlog → Assigned → In Progress → Ready for Review → Completed
- **Team Management**: QL assigns/transfers tasks within their team
- **Dark/Light Theme**: Professional Slate/Navy design
- **Google Sign-In**: OAuth2 with mandatory password setup
- **API Documentation**: Auto-generated at `/docs`

## API Endpoints

- `POST /api/auth/login` — JWT login
- `POST /api/auth/register` — Register user
- `POST /api/auth/google` — Google OAuth
- `GET /api/tasks` — List tasks (role-filtered)
- `PATCH /api/tasks/{id}/assign` — Assign/reassign task
- `PATCH /api/tasks/{id}/status` — Update status

Full Swagger docs at **http://localhost:8000/docs**
