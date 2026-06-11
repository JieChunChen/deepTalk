# AI Agent 智能助手平台 — MVP 开发计划

## 项目概述

一个支持多模型、RAG 知识库、工具调用的 AI Agent 对话平台。

**目标：** 2-3 周完成 MVP，作为简历项目展示 AI 全栈开发能力。

---

## 技术栈

| 层面       | 技术                                           | 说明                |
| ---------- | ---------------------------------------------- | ------------------- |
| 前端       | Next.js 14 (App Router) + Tailwind + Shadcn/ui | SSR + 流式渲染      |
| 后端       | Python FastAPI + SQLAlchemy + Pydantic         | 异步高性能          |
| AI 模型    | DeepSeek API + OpenAI 兼容格式                 | 多模型统一接口      |
| AI 框架    | LangChain                                      | RAG 链路 + Tool Use |
| 向量数据库 | PostgreSQL + pgvector (Supabase)               | 向量检索            |
| 业务数据库 | PostgreSQL (Supabase)                          | 同一实例            |
| 缓存       | Upstash Redis                                  | 会话缓存            |
| 文档处理   | LangChain Document Loaders + PyPDF             | PDF/Markdown 解析   |
| 部署       | Vercel (前端) + Railway (后端)                 | 全免费              |

---

## 架构设计

```
┌────────────────────────────────────────────┐
│            Next.js 14 前端                   │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ 对话界面  │ │ 知识库管理 │ │ 模型/工具配置│ │
│  └──────────┘ └──────────┘ └────────────┘ │
└──────────────────┬─────────────────────────┘
                   │ REST API + SSE (流式)
┌──────────────────▼─────────────────────────┐
│            FastAPI 后端                      │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         多模型适配层 (策略模式)        │   │
│  │  DeepSeek | OpenAI | Claude | 扩展   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌────────────┐ ┌───────────┐ ┌────────┐  │
│  │ RAG Engine │ │ Agent Core│ │Tool Hub│  │
│  │ 切片/检索   │ │ ReAct循环  │ │工具注册 │  │
│  └────────────┘ └───────────┘ └────────┘  │
└───┬──────────────┬──────────────┬──────────┘
    │              │              │
┌───▼───┐   ┌─────▼─────┐  ┌────▼────┐
│  PG   │   │ pgvector  │  │ Redis  │
│业务数据│   │ 向量存储   │  │会话缓存 │
└───────┘   └───────────┘  └─────────┘
```

---

## 数据库设计

### 核心表

```sql
-- 用户表 (简化版，可用 NextAuth)
users:
  id, email, name, created_at

-- 对话表
conversations:
  id, user_id, title, model_id, created_at, updated_at

-- 消息表
messages:
  id, conversation_id, role(user/assistant/system/tool),
  content, tool_calls(json), token_usage(json), created_at

-- 知识库
knowledge_bases:
  id, user_id, name, description, embedding_model,
  chunk_size, chunk_overlap, created_at

-- 文档
documents:
  id, knowledge_base_id, filename, file_type, file_size,
  chunk_count, status(processing/ready/failed), created_at

-- 文档切片 + 向量
chunks:
  id, document_id, content, metadata(json),
  embedding vector(1536), chunk_index

-- 模型配置
model_configs:
  id, user_id, provider(deepseek/openai/claude),
  model_name, api_key(encrypted), is_default, created_at

-- 工具注册
tools:
  id, name, description, parameters_schema(json),
  endpoint, is_enabled, created_at
```

---

## 开发计划（分阶段）

### 第一阶段：项目骨架 + 基础对话（第 1-3 天）

**目标：** 前后端跑通，能和 DeepSeek 基础对话

- [ ] 初始化项目结构
  - 前端: `npx create-next-app@latest` + Tailwind + Shadcn/ui
  - 后端: FastAPI 项目结构（routers/services/models/schemas）
- [ ] 后端搭建
  - FastAPI 基础框架 + CORS 配置
  - SQLAlchemy 数据库连接（Supabase PostgreSQL）
  - Alembic 数据库迁移
  - 基础表创建（users, conversations, messages）
- [ ] 多模型适配层
  - 定义统一接口 `BaseLLMProvider`
  - 实现 `DeepSeekProvider`（兼容 OpenAI 格式）
  - 预留 `OpenAIProvider` / `ClaudeProvider` 扩展点
  - 模型配置 API（CRUD）
- [ ] 基础对话 API
  - POST `/api/chat` — 非流式对话
  - POST `/api/chat/stream` — SSE 流式对话
  - GET `/api/conversations` — 对话历史列表
- [ ] 前端对话界面
  - 对话列表侧边栏
  - 聊天消息区（支持 Markdown 渲染）
  - 输入框 + 发送
  - SSE 流式接收 + 逐字渲染
  - 模型切换下拉框

**交付物：** 可以选择模型，流式对话，保存历史记录

---

### 第二阶段：RAG 知识库（第 4-8 天）

**目标：** 上传文档，Agent 能基于知识库回答问题

- [ ] 文档处理 Pipeline
  - 文件上传 API（PDF / Markdown）
  - PDF 解析（PyPDF2 / pdfplumber）
  - Markdown 解析
  - 文本切片（RecursiveCharacterTextSplitter）
    - chunk_size: 500-1000
    - chunk_overlap: 50-100
  - 向量化（DeepSeek Embedding 或 text-embedding-3-small）
  - 存入 pgvector
- [ ] 检索 API
  - 相似度检索（cosine similarity, top-k）
  - 混合检索（向量 + 关键词 BM25）— 面试加分项
  - 相关度阈值过滤
- [ ] RAG 对话集成
  - 用户提问 → 检索相关文档 → 构造 prompt → LLM 生成
  - 返回引用来源（哪个文档哪个片段）
  - 支持选择是否启用知识库
- [ ] 前端知识库管理
  - 知识库列表（创建/删除）
  - 文档上传（拖拽上传 + 进度条）
  - 文档列表（状态显示）
  - 对话中选择关联知识库
  - 回答中显示引用来源

**交付物：** 上传 PDF → 自动切片向量化 → 对话中检索增强回答 + 显示引用

---

### 第三阶段：Tool Use 工具调用（第 9-12 天）

**目标：** Agent 能自主决策调用工具，展示 ReAct 推理能力

- [ ] Agent 核心引擎
  - ReAct 循环实现（Thought → Action → Observation → ... → Answer）
  - 工具调用格式适配（DeepSeek Function Calling）
  - 最大迭代次数限制（防止死循环）
  - 执行过程可视化（前端展示思考链路）
- [ ] 内置工具实现（2-3 个足够）
  - **网页搜索** — 调用 SerpAPI / Tavily（有免费额度）
  - **天气查询** — 调用免费天气 API
  - **计算器/代码执行** — 安全沙箱内执行 Python 表达式
- [ ] 工具管理
  - 工具注册 API（定义名称、描述、参数 schema）
  - 工具启用/禁用
- [ ] 前端展示
  - 对话中展示 Agent 思考过程（折叠面板）
  - 工具调用状态（调用中/成功/失败）
  - 工具管理页面

**交付物：** 问 "北京今天天气如何" → Agent 自主调用天气工具 → 返回结果，前端展示推理过程

---

### 第四阶段：打磨 + 部署（第 13-16 天）

**目标：** 可演示，可访问，面试能 live demo

- [ ] 体验优化
  - 对话标题自动生成
  - 消息重新生成 / 编辑重发
  - 空状态引导
  - 响应式布局（移动端适配）
  - 暗色模式
- [ ] 部署上线
  - 前端部署到 Vercel
  - 后端部署到 Railway
  - Supabase 数据库配置
  - Upstash Redis 配置
  - 环境变量管理
  - HTTPS + 自定义域名（可选）
- [ ] 面试准备
  - README 文档（项目介绍、架构图、本地运行指南）
  - 录制 Demo 视频/GIF（备用，防止 live demo 翻车）
  - 准备技术深挖点的话术：
    - 多模型适配的设计模式
    - RAG chunking 策略选择依据
    - 向量检索 vs 混合检索的 trade-off
    - SSE 流式实现细节
    - ReAct Agent 循环的终止条件

---

## 面试话术要点

### 项目一句话介绍

> "我做了一个 AI Agent 平台，支持多模型切换、RAG 知识库问答和工具调用，后端 Python FastAPI，前端 Next.js，部署在 Vercel + Railway 上。"

### 可深挖的技术点

1. **多模型适配层**
   - 策略模式，统一 `generate()` / `stream()` 接口
   - DeepSeek 兼容 OpenAI 格式，但参数细节有差异（如 temperature 范围）
   - 如何做 fallback（主模型超时自动切换备用）

2. **RAG 检索质量优化**
   - 为什么选 RecursiveCharacterTextSplitter（保留语义完整性）
   - chunk_size 的权衡：太小丢上下文，太大检索噪音多
   - 混合检索：向量找语义相似 + BM25 找关键词精确匹配
   - 相关度阈值：过滤低质量检索结果

3. **流式输出实现**
   - 后端：FastAPI StreamingResponse + async generator
   - 前端：EventSource / fetch + ReadableStream
   - 为什么用 SSE 而非 WebSocket（单向足够、自动重连、更简单）

4. **Agent ReAct 循环**
   - Thought-Action-Observation 循环
   - 如何防止死循环（max_iterations + token 预算）
   - 工具描述的 prompt engineering 影响调用准确率

---

## 项目结构（参考）

```
ai-agent-platform/
├── frontend/                 # Next.js 14
│   ├── app/
│   │   ├── page.tsx         # 首页/对话页
│   │   ├── knowledge/       # 知识库管理
│   │   ├── tools/           # 工具管理
│   │   └── settings/        # 模型配置
│   ├── components/
│   │   ├── chat/            # 对话相关组件
│   │   ├── knowledge/       # 知识库相关组件
│   │   └── ui/              # Shadcn 组件
│   └── lib/
│       ├── api.ts           # API 调用封装
│       └── stream.ts        # SSE 流式处理
│
├── backend/                  # FastAPI
│   ├── app/
│   │   ├── main.py          # 入口
│   │   ├── routers/         # 路由
│   │   │   ├── chat.py
│   │   │   ├── knowledge.py
│   │   │   └── tools.py
│   │   ├── services/        # 业务逻辑
│   │   │   ├── llm/         # 多模型适配层
│   │   │   │   ├── base.py  # 抽象基类
│   │   │   │   ├── deepseek.py
│   │   │   │   └── openai_compat.py
│   │   │   ├── rag/         # RAG 引擎
│   │   │   │   ├── chunker.py
│   │   │   │   ├── embedder.py
│   │   │   │   └── retriever.py
│   │   │   └── agent/       # Agent 核心
│   │   │       ├── react.py
│   │   │       └── tools/
│   │   ├── models/          # SQLAlchemy 模型
│   │   └── schemas/         # Pydantic Schema
│   ├── alembic/             # 数据库迁移
│   └── requirements.txt
│
├── docker-compose.yml        # 本地开发
└── README.md
```

---

## 注意事项

1. **API Key 安全** — 永远不要前端暴露 key，全部走后端代理
2. **流式中断** — 用户取消生成时要正确关闭连接
3. **向量维度** — DeepSeek Embedding 和 OpenAI Embedding 维度不同，切换模型时注意
4. **成本控制** — 加 token 计数 + 限流，防止面试演示时账单爆炸
5. **错误处理** — 模型 API 超时/限流时给用户友好提示

---

## 快速启动命令（开发时参考）

```bash
# 后端
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 前端
cd frontend
pnpm install
pnpm dev

# 数据库迁移
cd backend
alembic upgrade head
```
