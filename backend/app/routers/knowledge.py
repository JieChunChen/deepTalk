from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.core.store import store
from app.schemas.knowledge import CreateKnowledgeBaseRequest, SearchKnowledgeRequest, UploadKnowledgeDocumentRequest
from app.services.rag import ingest_document, search_knowledge_chunks

router = APIRouter(prefix="/api/knowledge-bases", tags=["knowledge-bases"])


def _find_kb(kb_id: str) -> dict:
    for kb in store.knowledge_bases:
        if kb["id"] == kb_id:
            return kb
    raise HTTPException(status_code=404, detail="Knowledge base not found")


def _touch_kb(kb: dict) -> None:
    kb["updatedAt"] = datetime.utcnow().isoformat()
    kb["docCount"] = len(kb.get("docs", []))


@router.get("")
def list_knowledge_bases() -> dict:
    return {"data": store.knowledge_bases}


@router.post("")
def create_knowledge_base(payload: CreateKnowledgeBaseRequest) -> dict:
    kb = {
        "id": store.gen_id("kb"),
        "name": payload.name,
        "description": payload.description,
        "docCount": 0,
        "docs": [],
        "updatedAt": datetime.utcnow().isoformat(),
    }
    store.knowledge_bases.insert(0, kb)
    return {"data": kb}


@router.get("/{kb_id}")
def get_knowledge_base(kb_id: str) -> dict:
    return {"data": _find_kb(kb_id)}


@router.delete("/{kb_id}")
def delete_knowledge_base(kb_id: str) -> dict:
    for index, kb in enumerate(store.knowledge_bases):
        if kb["id"] == kb_id:
            deleted = store.knowledge_bases.pop(index)
            return {"data": deleted}
    raise HTTPException(status_code=404, detail="Knowledge base not found")


@router.post("/{kb_id}/documents")
def upload_knowledge_document(kb_id: str, payload: UploadKnowledgeDocumentRequest) -> dict:
    kb = _find_kb(kb_id)
    document_id = store.gen_id("doc")

    document = {
        "id": document_id,
        "name": payload.file_name,
        "size": "uploaded",
        "status": "processing",
        "progress": 45,
        "chunks": [],
        "uploadedAt": datetime.utcnow().isoformat(),
    }

    try:
        _, chunks = ingest_document(payload.file_name, payload.file_type, payload.content_base64, document_id)
        document["status"] = "ready"
        document["progress"] = 100
        document["chunks"] = chunks
        document["size"] = f"{len(payload.content_base64)} bytes"
    except Exception as exc:  # noqa: BLE001
        document["status"] = "failed"
        document["progress"] = 100
        document["error"] = str(exc)

    kb.setdefault("docs", []).insert(0, document)
    _touch_kb(kb)
    return {"data": kb}


@router.delete("/{kb_id}/documents/{doc_id}")
def delete_knowledge_document(kb_id: str, doc_id: str) -> dict:
    kb = _find_kb(kb_id)
    docs = kb.get("docs", [])
    for index, doc in enumerate(docs):
        if doc["id"] == doc_id:
            deleted = docs.pop(index)
            _touch_kb(kb)
            return {"data": kb, "deleted": deleted}
    raise HTTPException(status_code=404, detail="Document not found")


@router.post("/search")
def search_knowledge_bases(payload: SearchKnowledgeRequest) -> dict:
    results = search_knowledge_chunks(store, payload.query, [], top_k=payload.top_k)
    return {"data": results}
