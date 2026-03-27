# Reporting-PlatForm

Phisudo VAPT Reporting Platform is a full-stack web application for managing VAPT engagements, findings lifecycle, CVSS scoring, AI-assisted narrative refinement, and PDF report export.

## Tech Stack

- Frontend: Next.js 15 + React + TypeScript
- Backend: FastAPI + Pydantic
- Rich Text Editor: TinyMCE (self-hosted assets)
- Report Export: ReportLab (PDF)

## Main Features

- Authentication flow (`/auth/login`, `/auth/my-profile`)
- Clients management
- Projects management
  - Client PIC name
  - Client PIC contact
  - Lead pentester contact
- Cases management
  - CVSS v4 matrix input (AV/AC/AT/PR/UI/VC/VI/VA/SC/SI/SA)
  - Auto-calculated severity, score, and vector
  - TinyMCE sections for Description, PoC, Threat/Risk, Recommendation, Reference, Retest
  - AI Refine with preview + cancel/apply workflow
- Notifications center
- PDF report export
  - Draft/Final status option
  - Watermark based on report status
  - Version input
  - Summary + finding details sections

## Project Structure

```text
.
├─ apps/
│  ├─ api/                 # FastAPI backend
│  │  └─ app/
│  │     ├─ main.py
│  │     ├─ store.py
│  │     ├─ modules/
│  │     │  ├─ auth/
│  │     │  ├─ clients/
│  │     │  ├─ projects/
│  │     │  ├─ cases/
│  │     │  ├─ notifications/
│  │     │  └─ reports/
│  │     └─ schemas/
│  └─ web/                 # Next.js frontend
│     ├─ app/
│     ├─ components/
│     ├─ lib/
│     ├─ public/tinymce/
│     └─ scripts/
├─ AGENTS.md
├─ PRD.md
└─ ARCHITECTURE.md
```

## Local Setup

### 1) Backend

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -e .
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2) Frontend

```bash
cd apps/web
npm install
npm run start -- -H 127.0.0.1 -p 3001
```

Open:
- Web: `http://127.0.0.1:3001`
- API health: `http://127.0.0.1:8000/health`

## Default Demo Account (Sanitized)

- Username: `analyst`
- Password: `ChangeMe123!`

These are placeholder demo credentials for local development only.

## Key API Endpoints

- Auth: `POST /auth/login`, `GET /auth/my-profile`
- Dashboard: `GET /dashboard/getSidebarItems`
- Clients: `GET /clients`, `POST /clients`
- Projects: `GET /projects`, `POST /projects`, `GET /projects/{id}`
- Cases: `GET /cases`, `GET /cases/{id}`, `POST /cases`, `PATCH /cases/{id}`, `POST /cases/refine`
- Notifications: `GET /notifications`, `GET /notifications/unread/count`, `POST /notifications/mark-all-read`
- Reports: `POST /reports/export`

## Notes

- Current backend uses in-memory store for rapid prototyping.
- For production, replace with persistent database and secure auth.
- Sensitive real-world reporting data has been removed from seeded demo content.
