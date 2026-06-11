# Backend (FastAPI)

## Run

1. Create and activate a Python environment.
2. Install dependencies:
   pip install -r requirements.txt
3. Start service:
   uvicorn app.main:app --reload --port 8787

## Endpoints

- GET /health
- GET /api/conversations
- POST /api/conversations
- GET /api/conversations/{id}
- DELETE /api/conversations/{id}
- GET /api/model-configs
- POST /api/model-configs
- PATCH /api/model-configs/{id}
- DELETE /api/model-configs/{id}
- POST /api/chat
- POST /api/chat/stream (SSE)
- GET /api/knowledge-bases
- GET /api/tools
