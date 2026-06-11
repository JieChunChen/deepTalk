import React, { useEffect, useState } from 'react';
import { initialKnowledgeBases, initialTools, initialHistoryChats } from './mockData';
import { ChatSession, KnowledgeBase, ToolItem, ModelType } from './types';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import KnowledgeBaseManager from './components/KnowledgeBaseManager';
import ToolsHub from './components/ToolsHub';
import SettingsPage from './components/SettingsPage';
import { Menu, Sparkles } from 'lucide-react';
import {
  createConversation,
  createKnowledgeBase,
  deleteConversation,
  deleteKnowledgeBase,
  fetchConversations,
  fetchKnowledgeBases,
  fetchTools,
} from './lib/api';

export default function App() {
  
  // CENTRALIZED STATE
  const [activeView, setActiveView] = useState<'chat' | 'knowledge' | 'tools' | 'settings'>('chat');
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(initialKnowledgeBases);
  const [tools, setTools] = useState<ToolItem[]>(initialTools);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(initialHistoryChats);
  const [activeSessionId, setActiveSessionId] = useState<string>(
    initialHistoryChats.length > 0 ? initialHistoryChats[0].id : ''
  );
  
  // Mobile UI Sidebar Drawer Overlay Toggle
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [conversationData, knowledgeData, toolData] = await Promise.all([
          fetchConversations(),
          fetchKnowledgeBases(),
          fetchTools(),
        ]);

        if (knowledgeData.length > 0) {
          setKnowledgeBases(knowledgeData);
        }
        if (toolData.length > 0) {
          setTools(toolData);
        }
        if (conversationData.length > 0) {
          const nextSessions = conversationData.map((session) => ({
            ...session,
            model: toModelType(session.model),
          }));
          setChatSessions(nextSessions);
          setActiveSessionId(nextSessions[0].id);
        }
      } catch (_error) {
        // Keep local mock data as fallback if backend is temporarily unavailable.
      }
    };

    void loadInitialData();
  }, []);

  // Active Session Resolution
  const activeSession = chatSessions.find(s => s.id === activeSessionId) || null;

  // HANDLERS
  
  // 1. View selector
  const handleViewChange = (view: 'chat' | 'knowledge' | 'tools' | 'settings') => {
    setActiveView(view);
  };

  // 2. Create New Chat Session
  const handleNewChat = async () => {
    try {
      const created = await createConversation({
        title: '新建会话空间',
        model: 'DeepSeek-V3',
        associatedKBIds: knowledgeBases.length > 0 ? [knowledgeBases[0].id] : [],
      });

      const createdSession: ChatSession = {
        ...created,
        model: toModelType(created.model),
      };
      setChatSessions((prev) => [createdSession, ...prev]);
      setActiveSessionId(createdSession.id);
      setActiveView('chat');
    } catch (_error) {
      const newId = `chat-${Date.now()}`;
      const newSession: ChatSession = {
        id: newId,
        title: '新建会话空间',
        model: 'DeepSeek-V3',
        associatedKBIds: knowledgeBases.length > 0 ? [knowledgeBases[0].id] : [],
        messages: [],
        updatedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      setChatSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newId);
      setActiveView('chat');
    }
  };

  // 3. Delete Session
  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid activating the session as active
    const filtered = chatSessions.filter(s => s.id !== id);
    setChatSessions(filtered);

    try {
      await deleteConversation(id);
    } catch (_error) {
      // Keep UI responsive even when delete sync fails.
    }

    // If we delete the currently selected session, select the next available one or create a new empty one
    if (activeSessionId === id) {
      if (filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
      } else {
        const fallbackId = `chat-fallback-${Date.now()}`;
        const newSession: ChatSession = {
          id: fallbackId,
          title: '新建会话空间',
          model: 'DeepSeek-V3',
          associatedKBIds: knowledgeBases.length > 0 ? [knowledgeBases[0].id] : [],
          messages: [],
          updatedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };
        setChatSessions([newSession]);
        setActiveSessionId(fallbackId);
      }
    }
  };

  // 4. Update Chat Session details (messages, titles, etc.)
  const handleUpdateSession = (updatedSession: ChatSession) => {
    // If the session has messages and the title is still default, dynamically name it after the first 14 characters of the first user query!
    let sessionToSave = { ...updatedSession };
    if (updatedSession.messages.length > 0 && 
       (updatedSession.title === '新建会话空间' || updatedSession.title === '')) {
      const firstUserMsg = updatedSession.messages.find(m => m.role === 'user');
      if (firstUserMsg && firstUserMsg.content.trim()) {
        const rawContent = firstUserMsg.content.trim();
        sessionToSave.title = rawContent.length > 18 ? rawContent.substring(0, 18) + '...' : rawContent;
      }
    }

    setChatSessions((prev) => prev.map((session) => 
      session.id === sessionToSave.id ? sessionToSave : session
    ));
  };

  // 5. Toggle Knowledge Base association with the CURRENT ACTIVE session in top-header
  const handleToggleKB = (kbId: string) => {
    if (!activeSession) return;

    const currentlyAssociated = activeSession.associatedKBIds;
    let nextAssociated: string[];

    if (currentlyAssociated.includes(kbId)) {
      nextAssociated = currentlyAssociated.filter(id => id !== kbId);
    } else {
      nextAssociated = [...currentlyAssociated, kbId];
    }

    handleUpdateSession({
      ...activeSession,
      associatedKBIds: nextAssociated
    });
  };

  // 6. Tools catalog controllers
  const handleUpdateTool = (updatedTool: ToolItem) => {
    const nextTools = tools.map(t => t.id === updatedTool.id ? updatedTool : t);
    setTools(nextTools);
  };

  const handleAddTool = (newTool: ToolItem) => {
    setTools([...tools, newTool]);
  };

  // 7. Knowledge base space configurations
  const handleAddKB = (newKB: KnowledgeBase) => {
    setKnowledgeBases((prev) => [newKB, ...prev]);
  };

  const handleUpdateKB = (updatedKB: KnowledgeBase) => {
    setKnowledgeBases((prev) => prev.map((k) => (k.id === updatedKB.id ? updatedKB : k)));
  };

  const handleDeleteKB = (kbId: string) => {
    // 1. Delete KB from general database
    setKnowledgeBases((prev) => prev.filter((k) => k.id !== kbId));
    
    // 2. Deselect this association from all chat histories so it won't crash
    const sanitizedHistories = chatSessions.map(session => ({
      ...session,
      associatedKBIds: session.associatedKBIds.filter(id => id !== kbId)
    }));
    setChatSessions(sanitizedHistories);
  };

  // Switch workspace content views
  const renderActiveView = () => {
    switch (activeView) {
      case 'knowledge':
        return (
          <KnowledgeBaseManager
            knowledgeBases={knowledgeBases}
            onAddKnowledgeBase={handleAddKB}
            onUpdateKnowledgeBase={handleUpdateKB}
            onDeleteKnowledgeBase={handleDeleteKB}
          />
        );
      case 'tools':
        return (
          <ToolsHub
            tools={tools}
            onUpdateTool={handleUpdateTool}
            onAddTool={handleAddTool}
          />
        );
      case 'settings':
        return <SettingsPage />;
      case 'chat':
      default:
        if (activeSession) {
          return (
            <ChatInterface
              session={activeSession}
              knowledgeBases={knowledgeBases}
              tools={tools}
              onUpdateSession={handleUpdateSession}
              onToggleKB={handleToggleKB}
              onToggleMobileSidebar={() => setIsOpenMobile(true)}
            />
          );
        } else {
          return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 text-xs">
              <Sparkles className="w-10 h-10 text-gray-300 animate-pulse mb-2" />
              <span>载入会话空间失败，请在侧边栏点击 “新建对话”</span>
            </div>
          );
        }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-800" id="app-root-container">
      
      {/* 1. Sidebar element on the left side */}
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        chatSessions={chatSessions}
        activeSessionId={activeSessionId}
        onSessionSelect={setActiveSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* 2. Main content view block on the right side */}
      <main className="flex-1 flex flex-col min-w-0 md:ml-64 h-full relative" id="main-content-canvas">
        
        {/* Mobile top navigation rail (only handles opening the responsive drawer when NOT in 'chat' model because chat model embeds its own mobile header!) */}
        {activeView !== 'chat' && (
          <div className="md:hidden sticky top-0 z-35 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur-md shadow-3xs" id="mobile-view-nav">
            <button
              id="mobile-view-sidebar-open-btn"
              onClick={() => setIsOpenMobile(true)}
              className="p-1 px-1.5 inline-flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs font-bold text-gray-800 font-sans tracking-wide">
              {activeView === 'knowledge' && '📁 企业知识库管理'}
              {activeView === 'tools' && '🛠️ 插件与 Action 插件中心'}
              {activeView === 'settings' && '⚙️ 个人设置与策略'}
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center font-bold text-xs">
              CJ
            </div>
          </div>
        )}

        {/* Dynamic active visual output component */}
        {renderActiveView()}

      </main>
    </div>
  );
}

function toModelType(model: string): ModelType {
  const supported: ModelType[] = ['DeepSeek-V3', 'DeepSeek-R1', 'GPT-4o', 'Claude-3.5-Sonnet', 'Gemini-1.5-Pro'];
  if (supported.includes(model as ModelType)) {
    return model as ModelType;
  }
  return 'DeepSeek-V3';
}
