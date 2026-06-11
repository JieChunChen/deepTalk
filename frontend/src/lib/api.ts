import { ChatSession, KnowledgeBase, Message, ToolItem } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:8787';

type ApiResponse<T> = {
  data: T;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  const json = (await response.json()) as ApiResponse<T>;
  return json.data;
}

export async function fetchConversations(): Promise<ChatSession[]> {
  return request<ChatSession[]>('/api/conversations');
}

export async function createConversation(payload: {
  title: string;
  model: string;
  associatedKBIds: string[];
}): Promise<ChatSession> {
  return request<ChatSession>('/api/conversations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await request<ChatSession>(`/api/conversations/${conversationId}`, {
    method: 'DELETE',
  });
}

export async function fetchKnowledgeBases(): Promise<KnowledgeBase[]> {
  return request<KnowledgeBase[]>('/api/knowledge-bases');
}

export async function createKnowledgeBase(payload: { name: string; description: string }): Promise<KnowledgeBase> {
  return request<KnowledgeBase>('/api/knowledge-bases', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteKnowledgeBase(kbId: string): Promise<void> {
  await request<KnowledgeBase>(`/api/knowledge-bases/${kbId}`, {
    method: 'DELETE',
  });
}

export async function uploadKnowledgeDocument(params: {
  kbId: string;
  file: File;
}): Promise<KnowledgeBase> {
  const fileContentBase64 = await fileToBase64(params.file);
  return request<KnowledgeBase>(`/api/knowledge-bases/${params.kbId}/documents`, {
    method: 'POST',
    body: JSON.stringify({
      fileName: params.file.name,
      fileType: params.file.type || params.file.name.split('.').pop() || 'txt',
      contentBase64: fileContentBase64,
    }),
  });
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function fetchTools(): Promise<ToolItem[]> {
  return request<ToolItem[]>('/api/tools');
}

export async function streamChat(params: {
  conversationId: string;
  message: string;
  modelName: string;
  signal?: AbortSignal;
  onToken: (token: string) => void;
}): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversationId: params.conversationId,
      message: params.message,
      modelName: params.modelName,
    }),
    signal: params.signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Streaming failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let finalMessage: Message | null = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let separatorIndex = buffer.indexOf('\n\n');
    while (separatorIndex !== -1) {
      const eventBlock = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);

      const lines = eventBlock.split('\n');
      const eventLine = lines.find((line) => line.startsWith('event:')) || '';
      const dataLine = lines.find((line) => line.startsWith('data:')) || '';
      const eventName = eventLine.replace('event:', '').trim();
      const dataText = dataLine.replace('data:', '').trim();

      if (dataText) {
        const payload = JSON.parse(dataText) as { token?: string; message?: Message; error?: string };

        if (eventName === 'error' && payload.error) {
          throw new Error(payload.error);
        }

        if (eventName === 'token' && payload.token) {
          params.onToken(payload.token);
        }

        if (eventName === 'done' && payload.message) {
          finalMessage = payload.message;
        }
      }

      separatorIndex = buffer.indexOf('\n\n');
    }
  }

  if (!finalMessage) {
    throw new Error('Stream ended without final assistant message');
  }

  return finalMessage;
}
