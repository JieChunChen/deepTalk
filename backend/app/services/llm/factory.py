from __future__ import annotations

from .base import BaseLLMProvider
from .gemini import GeminiProvider
from .mock import MockProvider


def create_provider(provider: str, api_key: str | None = None) -> BaseLLMProvider:
    if provider == "gemini":
        return GeminiProvider(api_key=api_key)
    return MockProvider()
