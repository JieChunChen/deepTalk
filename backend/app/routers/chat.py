# 聊天路由
from __future__ import annotations

import json
from datetime import datetime
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.core.store import store
from app.schemas.chat import ChatRequest
from app.services.llm.factory import create_provider
from app.services.rag import build_rag_system_message, search_knowledge_chunks

router = APIRouter(prefix="/api/chat", tags=["chat"])


def _find_conversation(conversation_id: str) -> dict:
    for item in store.conversations:
        if item["id"] == conversation_id:
            return item
    raise HTTPException(status_code=404, detail="Conversation not found")


def _find_model_config(model_name: str | None) -> dict:
    if model_name:
        for item in store.model_configs:
            if item.get("model_name") == model_name:
                return item
    for item in store.model_configs:
        if item.get("is_default"):
            return item
    if not store.model_configs:
        raise HTTPException(status_code=500, detail="No model config available")
    return store.model_configs[0]


def _find_conversation_kb_ids(conversation: dict) -> list[str]:
    return list(conversation.get("associatedKBIds", []))


def _build_citations(results: list[dict]) -> list[dict]:
    citations: list[dict] = []
    for index, result in enumerate(results, start=1):
      citations.append(
          {
              "id": f"cit-{result['chunkId']}",
              "sourceDocName": result["documentName"],
              "chunkText": result["content"],
              "index": index,
          }
      )
    return citations


@router.post("")
async def chat(payload: ChatRequest) -> dict:
    conversation = _find_conversation(payload.conversation_id)
    model_config = _find_model_config(payload.model_name)
    provider = create_provider(model_config["provider"], model_config.get("api_key"))

    user_msg = {
        "id": store.gen_id("msg-user"),
        "role": "user",
        "content": payload.message,
        "timestamp": datetime.utcnow().isoformat(),
    }

    kb_ids = _find_conversation_kb_ids(conversation)
    rag_results = search_knowledge_chunks(store, payload.message, kb_ids, top_k=3)
    rag_system_message = build_rag_system_message(rag_results)

    history = [{"role": "system", "content": rag_system_message}, *conversation.get("messages", []), user_msg]
    answer_text = await provider.generate(history, model_config.get("model_name", "DeepSeek-V3"))

    assistant_msg = {
        "id": store.gen_id("msg-assistant"),
        "role": "assistant",
        "content": answer_text,
        "timestamp": datetime.utcnow().isoformat(),
        "citations": _build_citations(rag_results),
    }

    conversation["messages"].extend([user_msg, assistant_msg])
    conversation["updatedAt"] = datetime.utcnow().isoformat()

    return {
        "data": {
            "conversationId": conversation["id"],
            "message": assistant_msg,
            "model": model_config.get("model_name", "DeepSeek-V3"),
        }
    }


@router.post("/stream")
async def chat_stream(payload: ChatRequest) -> StreamingResponse:
    conversation = _find_conversation(payload.conversation_id)
    model_config = _find_model_config(payload.model_name)
    provider = create_provider(model_config["provider"], model_config.get("api_key"))

    user_msg = {
        "id": store.gen_id("msg-user"),
        "role": "user",
        "content": payload.message,
        "timestamp": datetime.utcnow().isoformat(),
    }

    kb_ids = _find_conversation_kb_ids(conversation)
    rag_results = search_knowledge_chunks(store, payload.message, kb_ids, top_k=3)
    rag_system_message = build_rag_system_message(rag_results)

    history = [{"role": "system", "content": rag_system_message}, *conversation.get("messages", []), user_msg]

    async def event_generator() -> AsyncGenerator[str, None]:
        full_text = ""
        try:
            async for token in provider.stream(history, model_config.get("model_name", "DeepSeek-V3")):
                full_text += token
                yield f"event: token\ndata: {json.dumps({'token': token}, ensure_ascii=False)}\n\n"
        except Exception as exc:  # noqa: BLE001
            yield f"event: error\ndata: {json.dumps({'error': str(exc)}, ensure_ascii=False)}\n\n"
            return

        assistant_msg = {
            "id": store.gen_id("msg-assistant"),
            "role": "assistant",
            "content": full_text,
            "timestamp": datetime.utcnow().isoformat(),
            "citations": _build_citations(rag_results),
        }
        conversation["messages"].extend([user_msg, assistant_msg])
        conversation["updatedAt"] = datetime.utcnow().isoformat()

        payload_done = {
            "conversationId": conversation["id"],
            "message": assistant_msg,
            "model": model_config.get("model_name", "DeepSeek-V3"),
        }
        yield f"event: done\ndata: {json.dumps(payload_done, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
