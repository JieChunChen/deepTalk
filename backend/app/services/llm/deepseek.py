from __future__ import annotations

import asyncio
import json
import os
from typing import AsyncGenerator

import httpx

from .base import BaseLLMProvider

DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"


class DeepSeekProvider(BaseLLMProvider):
    def __init__(self, api_key: str | None) -> None:
        self.api_key = api_key or os.getenv("DEEPSEEK_API_KEY", "")

    def _build_messages(self, messages: list[dict]) -> list[dict]:
        result = []
        for m in messages:
            role = m.get("role", "user")
            # Only keep roles supported by OpenAI-compatible format
            if role not in ("system", "user", "assistant"):
                role = "user"
            result.append({"role": role, "content": m.get("content", "")})
        return result

    async def generate(self, messages: list[dict], model_name: str) -> str:
        if not self.api_key:
            raise ValueError("Missing DEEPSEEK_API_KEY for DeepSeek provider")

        payload = {
            "model": model_name or "deepseek-chat",
            "messages": self._build_messages(messages),
            "stream": False,
        }

        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                DEEPSEEK_API_URL,
                json=payload,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def stream(self, messages: list[dict], model_name: str) -> AsyncGenerator[str, None]:  # type: ignore[override]
        if not self.api_key:
            raise ValueError("Missing DEEPSEEK_API_KEY for DeepSeek provider")

        payload = {
            "model": model_name or "deepseek-chat",
            "messages": self._build_messages(messages),
            "stream": True,
        }

        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream(
                "POST",
                DEEPSEEK_API_URL,
                json=payload,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith("data:"):
                        continue
                    raw = line[len("data:"):].strip()
                    if raw == "[DONE]":
                        break
                    try:
                        chunk = json.loads(raw)
                        delta = chunk["choices"][0]["delta"].get("content", "")
                        if delta:
                            yield delta
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue
