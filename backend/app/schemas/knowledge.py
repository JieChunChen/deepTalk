from __future__ import annotations

from pydantic import BaseModel, Field

# 创建知识库接口
class CreateKnowledgeBaseRequest(BaseModel):
    name: str
    description: str = ""   # 可选参数  默认值为空字符串  description: str = Field(default="")

# 上传知识库文档
class UploadKnowledgeDocumentRequest(BaseModel):
    file_name: str = Field(alias="fileName")
    file_type: str = Field(alias="fileType")
    content_base64: str = Field(alias="contentBase64")


class SearchKnowledgeRequest(BaseModel):
    query: str
    top_k: int = Field(default=3, alias="topK")
