from __future__ import annotations

import os

from google import genai

from .base import BaseLLMProvider


class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str | None) -> None:
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")

    async def generate(self, messages: list[dict], model_name: str) -> str:
        if not self.api_key:
            raise ValueError("Missing GEMINI_API_KEY for Gemini provider")

        client = genai.Client(api_key=self.api_key)
        prompt = "\n\n".join([f"{m.get('role', 'user')}: {m.get('content', '')}" for m in messages])

        response = client.models.generate_content(model=model_name or "gemini-1.5-pro", contents=prompt)
        return response.text or ""
