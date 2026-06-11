from __future__ import annotations

import base64
import math
import re
from collections import Counter
from io import BytesIO
from typing import Any

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover - optional dependency for local PDF support
    PdfReader = None


DEFAULT_CHUNK_SIZE = 800
DEFAULT_CHUNK_OVERLAP = 120
EMBEDDING_DIMENSION = 128


def _tokenize(text: str) -> list[str]:
    lowered = text.lower()
    tokens = re.findall(r"[a-z0-9]+|[\u4e00-\u9fff]", lowered)
    return tokens


def embed_text(text: str, dimensions: int = EMBEDDING_DIMENSION) -> list[float]:
    vector = [0.0] * dimensions
    tokens = _tokenize(text)
    if not tokens:
        return vector

    for token in tokens:
        index = hash(token) % dimensions
        vector[index] += 1.0

    norm = math.sqrt(sum(value * value for value in vector))
    if norm == 0:
        return vector
    return [value / norm for value in vector]


def cosine_similarity(left: list[float], right: list[float]) -> float:
    if len(left) != len(right):
        return 0.0
    return sum(l * r for l, r in zip(left, right))


def chunk_text(text: str, chunk_size: int = DEFAULT_CHUNK_SIZE, chunk_overlap: int = DEFAULT_CHUNK_OVERLAP) -> list[str]:
    cleaned = re.sub(r"\s+", " ", text).strip()
    if not cleaned:
        return []

    if len(cleaned) <= chunk_size:
        return [cleaned]

    step = max(1, chunk_size - chunk_overlap)
    chunks: list[str] = []
    start = 0
    while start < len(cleaned):
        end = min(len(cleaned), start + chunk_size)
        chunks.append(cleaned[start:end].strip())
        if end >= len(cleaned):
            break
        start += step
    return [chunk for chunk in chunks if chunk]


def _extract_text_from_pdf(content_bytes: bytes) -> str:
    if PdfReader is None:
        return content_bytes.decode("utf-8", errors="ignore")

    reader = PdfReader(BytesIO(content_bytes))
    pages: list[str] = []
    for page in reader.pages:
        pages.append(page.extract_text() or "")
    return "\n".join(pages)


def extract_text_from_upload(file_name: str, file_type: str, content_bytes: bytes) -> str:
    normalized_type = (file_type or file_name.split(".")[-1]).lower()

    if normalized_type in {"pdf"} or file_name.lower().endswith(".pdf"):
        return _extract_text_from_pdf(content_bytes)

    return content_bytes.decode("utf-8", errors="ignore")


def _build_chunk_items(source_chunks: list[str], document_id: str, document_name: str) -> list[dict[str, Any]]:
    chunk_items: list[dict[str, Any]] = []
    for index, chunk in enumerate(source_chunks, start=1):
        chunk_items.append(
            {
                "id": f"chunk-{document_id}-{index}",
                "index": index,
                "charCount": len(chunk),
                "content": chunk,
                "documentId": document_id,
                "documentName": document_name,
                "embedding": embed_text(chunk),
            }
        )
    return chunk_items


def ingest_document(file_name: str, file_type: str, content_base64: str, document_id: str, chunk_size: int = DEFAULT_CHUNK_SIZE, chunk_overlap: int = DEFAULT_CHUNK_OVERLAP) -> tuple[str, list[dict[str, Any]]]:
    content_bytes = base64.b64decode(content_base64)
    raw_text = extract_text_from_upload(file_name, file_type, content_bytes)
    chunks = chunk_text(raw_text, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return raw_text, _build_chunk_items(chunks, document_id, file_name)


def search_knowledge_chunks(store: Any, query: str, kb_ids: list[str], top_k: int = 3) -> list[dict[str, Any]]:
    query_vector = embed_text(query)
    results: list[dict[str, Any]] = []

    for kb in store.knowledge_bases:
        if kb_ids and kb["id"] not in kb_ids:
            continue

        for doc in kb.get("docs", []):
            for chunk in doc.get("chunks", []):
                chunk_vector = chunk.get("embedding") or embed_text(chunk.get("content", ""))
                score = cosine_similarity(query_vector, chunk_vector)
                results.append(
                    {
                        "kbId": kb["id"],
                        "kbName": kb["name"],
                        "documentId": doc["id"],
                        "documentName": doc["name"],
                        "chunkId": chunk["id"],
                        "chunkIndex": chunk.get("index", 0),
                        "content": chunk.get("content", ""),
                        "score": round(score, 4),
                    }
                )

    results.sort(key=lambda item: item["score"], reverse=True)
    return [item for item in results[:top_k] if item["content"]]


def build_rag_system_message(results: list[dict[str, Any]]) -> str:
    if not results:
        return "你是企业知识库助手。当前没有检索到相关知识片段，请基于常识作答，并明确说明没有找到可引用的知识库依据。"

    lines = ["你是企业知识库助手。请优先基于下面检索到的知识片段回答，并在回答中尽量引用来源："]
    for index, result in enumerate(results, start=1):
        lines.append(
            f"[{index}] {result['documentName']} / chunk #{result['chunkIndex']}：{result['content']}"
        )
    lines.append("如果片段不足以支撑结论，请明确说明。不要编造知识库中没有的内容。")
    return "\n".join(lines)
