from __future__ import annotations

from fastapi import APIRouter

from app.core.store import store

router = APIRouter(tags=["resources"])


@router.get("/api/knowledge-bases")
def list_knowledge_bases() -> dict:
    return {"data": store.knowledge_bases}


@router.get("/api/tools")
def list_tools() -> dict:
    return {"data": store.tools}
