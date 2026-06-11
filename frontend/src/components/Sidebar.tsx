import React, { useState } from 'react';
import { 
  MessageSquareText, 
  FolderArchive, 
  Wrench, 
  Sliders, 
  Plus, 
  Trash2, 
  Menu, 
  X,
  Sparkles,
  Search,
  MessageCircleQuestion,
  User,
  LogOut,
  Layers
} from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  activeView: 'chat' | 'knowledge' | 'tools' | 'settings';
  onViewChange: (view: 'chat' | 'knowledge' | 'tools' | 'settings') => void;
  chatSessions: ChatSession[];
  activeSessionId: string;
  onSessionSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export default function Sidebar({
  activeView,
  onViewChange,
  chatSessions,
  activeSessionId,
  onSessionSelect,
  onNewChat,
  onDeleteSession,
  isOpenMobile,
  setIsOpenMobile
}: SidebarProps) {
  const [historySearch, setHistorySearch] = useState('');

  const filteredSessions = chatSessions.filter(session => 
    session.title.toLowerCase().includes(historySearch.toLowerCase()) ||
    (session.messages[0] && session.messages[0].content.toLowerCase().includes(historySearch.toLowerCase()))
  );

  const navItems = [
    { id: 'chat', label: '对话空间', icon: MessageSquareText, color: 'text-sky-500' },
    { id: 'knowledge', label: '知识库管理', icon: FolderArchive, color: 'text-amber-500' },
    { id: 'tools', label: '工具中心', icon: Wrench, color: 'text-violet-500' },
    { id: 'settings', label: '个人设置', icon: Sliders, color: 'text-teal-500' },
  ] as const;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-50/95 text-slate-800 border-r border-slate-200/80 shadow-3xs" id="sidebar-container">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-200/50" id="sidebar-header">
        <div className="w-8 h-8 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl flex items-center justify-center font-extrabold text-white text-sm shadow-xs">
          AI
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold tracking-tight text-slate-900 font-sans">智研 DeepCore</h1>
          <span className="text-[10px] text-slate-500 font-semibold block -mt-0.5">RAG 混合算力脑</span>
        </div>
        {isOpenMobile && (
          <button 
            id="close-sidebar-mobile-btn"
            onClick={() => setIsOpenMobile(false)}
            className="p-1 hover:bg-slate-200/80 rounded-lg text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="px-4 py-4" id="sidebar-action">
        <button
          id="new-chat-btn"
          onClick={() => {
            onNewChat();
            onViewChange('chat');
            setIsOpenMobile(false);
          }}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs hover:shadow-sm transition-all active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white stroke-[2.5]" />
          <span>新建对话</span>
        </button>
      </div>

      {/* Main Core Views Navigation */}
      <div className="px-2.5 space-y-1" id="sidebar-core-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              id={`nav-link-${item.id}`}
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                setIsOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs rounded-xl transition-all duration-150 cursor-pointer group ${
                isActive 
                  ? 'bg-amber-100/50 text-amber-800 font-bold border-l-4 border-amber-600 shadow-3xs' 
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${isActive ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.label}</span>
              </div>
              {item.id === 'knowledge' && (
                <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200 font-mono font-bold">V2.4</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-slate-200/60" />

      {/* History Chats Section */}
      <div className="flex flex-col flex-1 min-h-0" id="sidebar-histories">
        <div className="px-4 py-2 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">历史对话列表</span>
          <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono font-semibold">
            {chatSessions.length}
          </span>
        </div>

        {/* Search History */}
        <div className="px-3 mb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              id="history-search-input"
              type="text"
              placeholder="搜寻历史会话..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200/80 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all font-sans shadow-3xs"
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 no-scrollbar" id="history-scrollable-container">
          {filteredSessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              <MessageCircleQuestion className="w-6 h-6 mx-auto mb-1 text-slate-350" />
              <span>无匹配相关会话</span>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isSelected = activeSessionId === session.id && activeView === 'chat';
              return (
                <div
                  key={session.id}
                  id={`history-item-${session.id}`}
                  onClick={() => {
                    onSessionSelect(session.id);
                    onViewChange('chat');
                    setIsOpenMobile(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-all duration-150 group relative ${
                    isSelected 
                      ? 'bg-amber-100/40 text-amber-950 font-semibold border-l-4 border-amber-500 shadow-3xs' 
                      : 'hover:bg-slate-200/40 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-6">
                    <span className="font-semibold truncate font-sans text-slate-700 group-hover:text-slate-950">{session.title}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 truncate font-mono">
                      {session.updatedAt} • {session.model}
                    </span>
                  </div>
                  <button
                    id={`delete-chat-btn-${session.id}`}
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-rose-500 transition-all"
                    title="删除此会话"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* User Segment Footer */}
      <div className="mt-auto p-4 border-t border-slate-200 bg-slate-100/40" id="sidebar-footer">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-extrabold text-xs font-mono">
                CJ
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate font-sans">陈杰春</p>
              <p className="text-[10px] text-slate-400 font-semibold truncate font-mono">chenjiechun73@gmail.com</p>
            </div>
          </div>
          <button 
            id="sidebar-logout-btn"
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            title="退出账号"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col fixed top-0 bottom-0 left-0 z-20">
        {sidebarContent}
      </div>

      {/* Mobile drawer overlay */}
      {isOpenMobile && (
        <div 
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Mobile drawer canvas */}
      <div className={`fixed top-0 bottom-0 left-0 w-72 z-50 md:hidden transition-transform duration-300 transform ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </div>
    </>
  );
}
