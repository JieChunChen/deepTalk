from __future__ import annotations

from abc import ABC, abstractmethod
from typing import AsyncGenerator


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate(self, messages: list[dict], model_name: str) -> str:
        raise NotImplementedError

    async def stream(self, messages: list[dict], model_name: str) -> AsyncGenerator[str, None]:
        text = await self.generate(messages, model_name)
        chunk_size = 20
        for i in range(0, len(text), chunk_size):
            yield text[i : i + chunk_size]
