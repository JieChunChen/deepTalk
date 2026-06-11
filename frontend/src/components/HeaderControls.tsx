import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Layers, 
  Menu, 
  Check, 
  Database, 
  HelpCircle,
  HelpCircle as InfoIcon,
  Sparkles,
  Link2
} from 'lucide-react';
import { ModelType, KnowledgeBase } from '../types';

interface HeaderControlsProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
  knowledgeBases: KnowledgeBase[];
  associatedKBIds: string[];
  onToggleKB: (id: string) => void;
  onToggleMobileSidebar: () => void;
}

export default function HeaderControls({
  selectedModel,
  onModelChange,
  knowledgeBases,
  associatedKBIds,
  onToggleKB,
  onToggleMobileSidebar
}: HeaderControlsProps) {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isKBDropdownOpen, setIsKBDropdownOpen] = useState(false);

  const modelRef = useRef<HTMLDivElement>(null);
  const kbRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
      if (kbRef.current && !kbRef.current.contains(event.target as Node)) {
        setIsKBDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const models: { value: ModelType; label: string; tag: string; tagColor: string; bullet: string; desc: string }[] = [
    { 
      value: 'DeepSeek-V3', 
      label: 'DeepSeek-V3', 
      tag: '高性价比', 
      tagColor: 'bg-emerald-50 text-emerald-600 border-emerald-200', 
      bullet: 'bg-emerald-500',
      desc: '专为通用问答与企业综合文字工作优化'
    },
    { 
      value: 'DeepSeek-R1', 
      label: 'DeepSeek-R1', 
      tag: '深度推理', 
      tagColor: 'bg-purple-50 text-purple-600 border-purple-200', 
      bullet: 'bg-purple-500',
      desc: '支持超长思考，擅长高级算法、编程和逻辑链'
    },
    { 
      value: 'GPT-4o', 
      label: 'GPT-4o', 
      tag: '全能旗舰', 
      tagColor: 'bg-blue-50 text-blue-600 border-blue-200', 
      bullet: 'bg-blue-500',
      desc: '全球公认的最强生产力模型之一'
    },
    { 
      value: 'Claude-3.5-Sonnet', 
      label: 'Claude 3.5 Sonnet', 
      tag: '极致文笔', 
      tagColor: 'bg-amber-50 text-amber-600 border-amber-200', 
      bullet: 'bg-amber-500',
      desc: '长文本写作与专业学术研究的首选'
    },
    { 
      value: 'Gemini-1.5-Pro', 
      label: 'Gemini 1.5 Pro', 
      tag: '百万上下文', 
      tagColor: 'bg-rose-50 text-rose-600 border-rose-200', 
      bullet: 'bg-rose-500',
      desc: '支持超大文档甚至整个代码库的深入检索与关联'
    }
  ];

  const currentModelInfo = models.find(m => m.value === selectedModel) || models[0];

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur-md shadow-sm" id="header-bar">
      
      {/* Mobile Toggle & Left details */}
      <div className="flex items-center space-x-3">
        <button
          id="mobile-sidebar-toggle-btn"
          onClick={onToggleMobileSidebar}
          className="p-1 px-1.5 inline-flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Model Selector dropdown container */}
        <div className="relative" ref={modelRef} id="model-selector-wrapper">
          <button
            id="model-dropdown-trigger"
            onClick={() => {
              setIsModelDropdownOpen(!isModelDropdownOpen);
              setIsKBDropdownOpen(false); // Close other
            }}
            className="flex items-center space-x-2 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500/10 cursor-pointer transition-all"
          >
            <span className={`h-2 w-2 rounded-full ${currentModelInfo.bullet} inline-block animate-pulse`} />
            <span className="font-sans font-semibold text-gray-800">{currentModelInfo.label}</span>
            <span className={`hidden sm:inline-block px-1.5 py-0.2 rounded border text-[10px] ${currentModelInfo.tagColor}`}>
              {currentModelInfo.tag}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {isModelDropdownOpen && (
            <div id="model-dropdown-menu" className="absolute left-0 mt-2 w-72 origin-top-left rounded-2xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">选择对话模型</span>
              </div>
              <div className="space-y-0.5 max-h-80 overflow-y-auto">
                {models.map((m) => {
                  const isSelected = selectedModel === m.value;
                  return (
                    <button
                      id={`model-option-${m.value}`}
                      key={m.value}
                      onClick={() => {
                        onModelChange(m.value);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full flex flex-col p-2.5 rounded-xl text-left transition-all ${
                        isSelected 
                          ? 'bg-amber-50/70 border border-amber-250/20' 
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span className={`h-2 w-2 rounded-full ${m.bullet}`} />
                          <span className="text-xs font-semibold text-gray-800 font-sans">{m.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-1.5 py-0.2 rounded border text-[9px] ${m.tagColor}`}>
                            {m.tag}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1 pl-4 leading-relaxed font-sans">{m.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Knowledge Base association switch & details */}
      <div className="flex items-center space-x-2.5" ref={kbRef} id="kb-association-wrapper">
        <div className="relative">
          <button
            id="kb-dropdown-trigger"
            onClick={() => {
              setIsKBDropdownOpen(!isKBDropdownOpen);
              setIsModelDropdownOpen(false); // Close other
            }}
            className={`flex items-center space-x-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs border ${
              associatedKBIds.length > 0
                ? 'bg-amber-500/10 text-amber-700 border-amber-300'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Database className={`w-3.5 h-3.5 ${associatedKBIds.length > 0 ? 'text-amber-500' : 'text-gray-400'}`} />
            <span className="font-sans font-semibold">检索知识库:</span>
            <span className="bg-amber-500/20 text-amber-800 rounded-full px-1.5 py-0.2 text-[10px] font-mono">
              {associatedKBIds.length} 项
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {isKBDropdownOpen && (
            <div id="kb-dropdown-menu" className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl border border-gray-100 bg-white p-3.5 shadow-xl ring-1 ring-black/5 z-50">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                <div className="flex items-center space-x-1.5">
                  <Link2 className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-bold text-gray-800 font-sans">关联 RAG 知识库</span>
                </div>
                <span className="text-[10px] text-gray-400 font-sans">支持多选关联</span>
              </div>

              {knowledgeBases.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  <span>检测到数据库中目前还没有可用的知识库，请先前往 <b>“知识库管理”</b> 创建或上传文档。</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {knowledgeBases.map((kb) => {
                    const isChecked = associatedKBIds.includes(kb.id);
                    return (
                      <label
                        key={kb.id}
                        id={`kb-checkbox-row-${kb.id}`}
                        className={`flex items-start p-2 rounded-xl border text-left cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-amber-50/50 border-amber-200 text-amber-900 shadow-3xs' 
                            : 'hover:bg-gray-50 border-gray-100 text-gray-700'
                        }`}
                      >
                        <input
                          id={`kb-checkbox-${kb.id}`}
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleKB(kb.id)}
                          className="mt-0.5 rounded border-gray-300 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                        />
                        <div className="ml-2.5 min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate leading-tight font-sans">{kb.name}</p>
                          <p className="text-[10px] text-gray-500 truncate mt-0.5 font-sans">
                            {kb.docCount} 份文档 • 更新于{kb.updatedAt}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              
              <div className="mt-3.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-sans">
                <span>勾选后，AI 将自动调用语义关联匹配。</span>
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
