from __future__ import annotations

from .base import BaseLLMProvider


class MockProvider(BaseLLMProvider):
    async def generate(self, messages: list[dict], model_name: str) -> str:
        last_user = ""
        for message in reversed(messages):
            if message.get("role") == "user":
                last_user = message.get("content", "")
                break

        if any(token in last_user for token in ["北京", "差旅", "报销", "补贴"]):
            return (
                f"[{model_name}] 根据知识库示例：北京属于一类城市，住宿上限550元/夜，"
                "伙食补贴150元/天，市内交通80元/天；招待费2000-10000元需VP审批。"
            )

        if any(token in last_user for token in ["售后", "主板", "退换", "以旧换新"]):
            return (
                f"[{model_name}] 建议先走返厂检测流程；仅在确认非人为缺陷时，"
                "进入以旧换新并由公司承担相关费用。"
            )

        preview = last_user[:80]
        return f"[{model_name}] 已收到：{preview}。当前为MVP后端示例回复，可切换真实模型。"
