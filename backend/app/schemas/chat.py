from __future__ import annotations  # Python 让类型注解延迟解析

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    conversation_id: str = Field(alias="conversationId")
    message: str
    model_name: str | None = Field(default=None, alias="modelName")
    associated_kb_ids: list[str] = Field(default_factory=list, alias="associatedKBIds")


class CreateConversationRequest(BaseModel):
    title: str = "新建会话"
    model: str = "DeepSeek-V3"
    associated_kb_ids: list[str] = Field(default_factory=list, alias="associatedKBIds")


class CreateModelConfigRequest(BaseModel):
    provider: str
    model_name: str = Field(alias="modelName")
    api_key: str = Field(default="", alias="apiKey")
    is_default: bool = Field(default=False, alias="isDefault")


class UpdateModelConfigRequest(BaseModel):
    provider: str | None = None
    model_name: str | None = Field(default=None, alias="modelName")
    api_key: str | None = Field(default=None, alias="apiKey")
    is_default: bool | None = Field(default=None, alias="isDefault")
