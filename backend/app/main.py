#入口
from __future__ import annotations

from dotenv import load_dotenv

load_dotenv()  # Must be called before any app module imports so os.getenv() sees the .env values

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.chat import router as chat_router
from app.routers.conversations import router as conversations_router
from app.routers.knowledge import router as knowledge_router
from app.routers.model_configs import router as model_configs_router
from app.routers.resources import router as resources_router

app = FastAPI(title="AI Agent Pro Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "ai-agent-pro-backend",
    }


app.include_router(chat_router)
app.include_router(conversations_router)
app.include_router(knowledge_router)
app.include_router(model_configs_router)
app.include_router(resources_router)
