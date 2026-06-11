from __future__ import annotations

import os
from datetime import datetime
from typing import Any


def now_iso() -> str:
    return datetime.utcnow().isoformat()


class InMemoryStore:
    def __init__(self) -> None:
        self.conversations: list[dict[str, Any]] = [
            {
                "id": "chat-seed-1",
                "title": "示例会话",
                "model": "DeepSeek-V3",
                "associatedKBIds": ["kb-1"],
                "messages": [],
                "createdAt": now_iso(),
                "updatedAt": now_iso(),
            }
        ]
        self.model_configs: list[dict[str, Any]] = [
            {
                "id": "model-deepseek-v3",
                "provider": "deepseek",
                "model_name": "deepseek-chat",
                "api_key": os.getenv("DEEPSEEK_API_KEY", ""),
                "is_default": True,
                "created_at": now_iso(),
            },
            {
                "id": "model-deepseek-r1",
                "provider": "deepseek",
                "model_name": "deepseek-reasoner",
                "api_key": os.getenv("DEEPSEEK_API_KEY", ""),
                "is_default": False,
                "created_at": now_iso(),
            },
            {
                "id": "model-gemini-1-5-pro",
                "provider": "gemini",
                "model_name": "gemini-1.5-pro",
                "api_key": os.getenv("GEMINI_API_KEY", ""),
                "is_default": False,
                "created_at": now_iso(),
            },
        ]
        self.knowledge_bases: list[dict[str, Any]] = [
            {
                "id": "kb-1",
                "name": "企业财务与行政管理规范",
                "description": "示例知识库",
                "docCount": 1,
                "docs": [
                    {
                        "id": "doc-seed-1",
                        "name": "员工差旅及业务招待费报销管理规定(2026版).pdf",
                        "size": "1.2 MB",
                        "status": "ready",
                        "progress": 100,
                        "uploadedAt": now_iso(),
                        "chunks": [
                            {
                                "id": "chunk-seed-1",
                                "content": "北京是一类城市，住宿上限550元/夜，伙食补贴150元/天。",
                                "charCount": 31,
                                "index": 1,
                            }
                        ],
                    }
                ],
                "updatedAt": now_iso(),
            }
        ]
        self.tools: list[dict[str, Any]] = [
            {
                "id": "tool-1",
                "name": "企业 ERP 数据库检索",
                "icon": "Database",
                "description": "示例工具",
                "enabled": True,
                "endpoint": "https://api.example.com/erp",
                "schema": "{\"type\":\"object\",\"properties\":{\"query\":{\"type\":\"string\"}}}",
            }
        ]

    @staticmethod
    def gen_id(prefix: str) -> str:
        suffix = int(datetime.utcnow().timestamp() * 1000)
        return f"{prefix}-{suffix}"


store = InMemoryStore()
