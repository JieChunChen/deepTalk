export type ModelType = 'DeepSeek-V3' | 'DeepSeek-R1' | 'GPT-4o' | 'Claude-3.5-Sonnet' | 'Gemini-1.5-Pro';

export interface Citation {
  id: string;
  sourceDocName: string;
  chunkText: string;
  index: number;
}

export interface ThoughtStep {
  thought: string;
  action: string;
  observation: string;
  state: 'thinking' | 'calling' | 'success'; // thinking=yellow, calling=blue, success=green
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  thoughtStep?: ThoughtStep; // For Tool Use "Thinking..."
  citations?: Citation[];
}

export interface ChatSession {
  id: string;
  title: string;
  model: ModelType;
  associatedKBIds: string[];
  messages: Message[];
  updatedAt: string;
}

export interface ChunkItem {
  id: string;
  content: string;
  charCount: number;
  index: number;
}

export interface DocItem {
  id: string;
  name: string;
  size: string;
  status: 'processing' | 'ready' | 'failed';
  progress: number; // 0-100 upload / parsing progress
  chunks: ChunkItem[];
  uploadedAt: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  docCount: number;
  docs: DocItem[];
  updatedAt: string;
}

export interface ToolItem {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
  enabled: boolean;
  endpoint: string;
  schema: string; // JSON Schema definition
}
