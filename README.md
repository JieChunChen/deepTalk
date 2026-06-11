<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# AI Agent Pro

This repository is split into two folders:

- `frontend`: Vite + React UI
- `backend`: Python FastAPI service

## Run Locally

**Prerequisites:** Node.js + Python 3.11+

1. Start frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
2. Start backend:
   - `cd backend`
   - `pip install -r requirements.txt`
   - `uvicorn app.main:app --reload --port 8787`

## Backend API (MVP)

The backend is implemented with FastAPI and currently uses in-memory storage for MVP development.

Available endpoints:

- `GET /health`
- `GET /api/conversations`
- `POST /api/conversations`
- `GET /api/conversations/{id}`
- `DELETE /api/conversations/{id}`
- `GET /api/model-configs`
- `POST /api/model-configs`
- `PATCH /api/model-configs/{id}`
- `DELETE /api/model-configs/{id}`
- `POST /api/chat` (non-stream)
- `POST /api/chat/stream` (SSE stream)
- `GET /api/knowledge-bases`
- `GET /api/tools`

`/api/chat/stream` returns SSE events:

- `event: token` incremental text chunks
- `event: done` final assistant message payload
