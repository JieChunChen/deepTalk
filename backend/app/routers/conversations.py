from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.core.store import store
from app.schemas.chat import CreateConversationRequest

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("")
def list_conversations() -> dict:
    return {"data": store.conversations}


@router.post("")
def create_conversation(payload: CreateConversationRequest) -> dict:
    item = {
        "id": store.gen_id("chat"),
        "title": payload.title,
        "model": payload.model,
        "associatedKBIds": payload.associated_kb_ids,
        "messages": [],
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat(),
    }
    store.conversations.insert(0, item)
    return {"data": item}


@router.get("/{conversation_id}")
def get_conversation(conversation_id: str) -> dict:
    for conversation in store.conversations:
        if conversation["id"] == conversation_id:
            return {"data": conversation}
    raise HTTPException(status_code=404, detail="Conversation not found")


@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: str) -> dict:
    for idx, conversation in enumerate(store.conversations):
        if conversation["id"] == conversation_id:
            deleted = store.conversations.pop(idx)
            return {"data": deleted}
    raise HTTPException(status_code=404, detail="Conversation not found")
