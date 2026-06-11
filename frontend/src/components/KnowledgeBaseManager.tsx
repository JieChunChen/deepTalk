import React, { useState, useRef } from 'react';
import { 
  FolderArchive, 
  Plus, 
  ChevronLeft, 
  UploadCloud, 
  Play, 
  Trash2, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Compass, 
  PlusCircle,
  FolderOpen,
  Eye,
  Info
} from 'lucide-react';
import { KnowledgeBase, DocItem, ChunkItem } from '../types';

interface KnowledgeBaseManagerProps {
  knowledgeBases: KnowledgeBase[];
  onAddKnowledgeBase: (kb: KnowledgeBase) => void;
  onUpdateKnowledgeBase: (kb: KnowledgeBase) => void;
  onDeleteKnowledgeBase: (id: string) => void;
}

export default function KnowledgeBaseManager({
  knowledgeBases,
  onAddKnowledgeBase,
  onUpdateKnowledgeBase,
  onDeleteKnowledgeBase
}: KnowledgeBaseManagerProps) {
  
  // States
  const [selectedKBId, setSelectedKBId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  
  // Creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKBName, setNewKBName] = useState('');
  const [newKBDesc, setNewKBDesc] = useState('');

  // Drag and drop states
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active KB
  const activeKB = knowledgeBases.find(k => k.id === selectedKBId) || null;
  // Active Doc for Chunking View
  const activeDoc = activeKB?.docs.find(d => d.id === selectedDocId) || null;

  const handleCreateKB = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKBName.trim()) return;

    const newKB: KnowledgeBase = {
      id: `kb-${Date.now()}`,
      name: newKBName.trim(),
      description: newKBDesc.trim() || '主要存储企业自定义相关的部门规章和数据文件。',
      docCount: 0,
      docs: [],
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onAddKnowledgeBase(newKB);
    setNewKBName('');
    setNewKBDesc('');
    setShowCreateModal(false);
    setSelectedKBId(newKB.id); // Go directly to details
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Simulate file addition
  const processUploadedFile = (file: File) => {
    if (!activeKB) return;

    const docId = `doc-${Date.now()}`;
    const newDocFilename = file.name;
    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    // Simulated parsing chunks after loading
    const simulatedChunks: ChunkItem[] = [
      {
        id: `chunk-${Date.now()}-1`,
        index: 1,
        charCount: 165,
        content: `【分块#1: ${newDocFilename} 导论信息】该核查材料涉及 ${newDocFilename}。文件创建人：运营部管理员。初始载入范围包含数据结构配置与核心流程参数，校验权重良好，建议作为语义回答的第一索引链路。`
      },
      {
        id: `chunk-${Date.now()}-2`,
        index: 2,
        charCount: 215,
        content: `【分块#2: 重点业务指导条款】在第三章第二节指出：凡涉及本系统所属之全部交易流程，当事人须保证账户信息的完全对齐与真实，并在发生可疑交易的 15 分钟内发起安全锁定，超时造成的分摊损耗由操作人承接。`
      },
      {
        id: `chunk-${Date.now()}-3`,
        index: 3,
        charCount: 180,
        content: `【分块#3: 报备补充说明】本细则自2026年6月起正式落地。任何与国家常规金融规范或信息双清审计产生冲突的部分，以本章程披露的最高安全额度为最终解决判定。财务部门保留一切解释权限。`
      }
    ];

    const newDocItem: DocItem = {
      id: docId,
      name: newDocFilename,
      size: sizeStr === '0.0 MB' ? '415 KB' : sizeStr,
      status: 'processing',
      progress: 5,
      chunks: [],
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updatedDocs = [newDocItem, ...activeKB.docs];
    const updatedKB: KnowledgeBase = {
      ...activeKB,
      docCount: updatedDocs.length,
      docs: updatedDocs,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onUpdateKnowledgeBase(updatedKB);
    setSelectedDocId(docId); // Auto focus for preview progress

    // Animate progress to simulate vector database ingestion
    let currentProgress = 5;
    const interval = setInterval(() => {
      currentProgress += 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Mark as Ready and populate chunks
        const finalDocs = updatedKB.docs.map(doc => {
          if (doc.id === docId) {
            return {
              ...doc,
              status: 'ready' as const,
              progress: 100,
              chunks: simulatedChunks
            };
          }
          return doc;
        });

        onUpdateKnowledgeBase({
          ...updatedKB,
          docs: finalDocs
        });
      } else {
        // Update fractional progress
        const trackingDocs = updatedKB.docs.map(doc => {
          if (doc.id === docId) {
            return { ...doc, progress: currentProgress };
          }
          return doc;
        });
        onUpdateKnowledgeBase({
          ...updatedKB,
          docs: trackingDocs
        });
      }
    }, 600);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleDeleteDoc = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeKB) return;

    const filteredDocs = activeKB.docs.filter(d => d.id !== docId);
    onUpdateKnowledgeBase({
      ...activeKB,
      docCount: filteredDocs.length,
      docs: filteredDocs,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    if (selectedDocId === docId) {
      setSelectedDocId(null);
    }
  };

  return (
    <div className="h-full bg-slate-50/40 p-4 md:p-6 overflow-y-auto" id="kb-manager-root">
      
      {!activeKB ? (
        
        /* 1. LIST VIEW OF ALL KBs */
        <div className="max-w-6xl mx-auto" id="kb-list-view">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-sans tracking-tight">企业知识库管理</h2>
              <p className="text-xs text-gray-500 mt-1 font-sans">
                在此处创建或升级特定垂直业务流程知识库，上传文档会自动进行 AI 切片、向量化语义建索。
              </p>
            </div>
            <button
              id="open-create-kb-modal-btn"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium text-xs transition-all shadow-md hover:shadow-amber-500/15"
            >
              <Plus className="w-4 h-4" />
              <span>新建知识库</span>
            </button>
          </div>

          {knowledgeBases.length === 0 ? (
            <div className="text-center p-12 bg-white border border-gray-100 rounded-3xl shadow-3xs" id="kb-list-empty">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-700">暂无知识库</h3>
              <p className="text-xs text-gray-400 mt-1.5 max-w-sm mx-auto">点击右上角按钮新建一个知识库，可以开始上传并分析您的首批核心业务规定与文档。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="kb-grid-layout">
              {knowledgeBases.map((kb) => (
                <div
                  key={kb.id}
                  id={`kb-card-${kb.id}`}
                  onClick={() => {
                    setSelectedKBId(kb.id);
                    setSelectedDocId(null);
                  }}
                  className="bg-white border border-slate-200/80 hover:border-amber-400 p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-3xs hover:shadow-md flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 border border-amber-100 group-hover:scale-105 transition-transform shrink-0">
                        <FolderArchive className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        更新于 {kb.updatedAt.split(' ')[0]}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-800 mt-4 group-hover:text-amber-600 transition-colors font-sans truncate">
                      {kb.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed font-sans min-h-[3.375rem]">
                      {kb.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs" id={`kb-card-footer-${kb.id}`}>
                    <span className="text-[10px] bg-slate-100 border border-slate-200/50 text-slate-500 rounded-full px-2 py-0.5 font-bold font-mono">
                      {kb.docCount} 份关联文档
                    </span>
                    <button
                      id={`delete-kb-btn-${kb.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`确定要彻底删除知识库“${kb.name}”及其中所有文档片段吗？`)) {
                          onDeleteKnowledgeBase(kb.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="删除此知识库"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        
        /* 2. DETAIL VIEW FOR SELECTED KB */
        <div className="max-w-6xl mx-auto" id="kb-detail-view">
          
          {/* Breadcrumb Header */}
          <div className="flex items-center justify-between mb-5">
            <button
              id="back-to-kb-list-btn"
              onClick={() => {
                setSelectedKBId(null);
                setSelectedDocId(null);
              }}
              className="inline-flex items-center space-x-1.5 text-xs text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-xl cursor-pointer shadow-3xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>返回知识库列表</span>
            </button>
            <div className="text-right text-[10px] text-gray-400 font-mono">
              知识空间ID: {activeKB.id}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 mb-6 shadow-3xs" id="kb-detail-banner">
            <h2 className="text-lg font-bold text-gray-900 font-sans">{activeKB.name}</h2>
            <p className="text-xs text-gray-500 mt-2 font-sans leading-relaxed">{activeKB.description}</p>
          </div>

          {/* Core Two-Columns Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="kb-two-column-workspace">
            
            {/* Left Frame: Document Drag & Drop FileUploader (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-4" id="kb-workspace-left">
              <h3 className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider font-sans">
                本地数据源接入 (FileUploader)
              </h3>
              
              {/* Drag drop box */}
              <div
                id="kb-drag-drop-box"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                  isDragOver 
                    ? 'border-amber-500 bg-amber-500/5' 
                    : 'border-slate-300 hover:border-amber-400 bg-white hover:bg-slate-50/20'
                }`}
              >
                <input
                  id="kb-file-input"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.txt,.doc,.docx"
                  className="hidden"
                />
                
                <UploadCloud className={`w-10 h-10 mx-auto mb-3.5 ${isDragOver ? 'text-amber-500 bounce' : 'text-slate-400'}`} />
                <h4 className="text-xs font-bold text-slate-700">
                  {isDragOver ? '松开鼠标即可载入' : '拖拽文件到这里，或点击选择'}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-normal font-sans">
                  支持 PDF, TXT, DOCX 格式格式。<br />单文件大小最大 15MB，系统将自适应切片。
                </p>
              </div>

              {/* Ingestion Tip */}
              <div className="rounded-2xl border border-gray-100 bg-amber-500/5 p-4 flex items-start space-x-2.5 text-xs text-gray-600" id="kb-ingest-tips">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="font-sans leading-tight">
                  <span className="font-bold block text-gray-800">关于向量化分块(Chunking)流程</span>
                  <span className="text-[10px] block text-gray-500 mt-1 leading-normal">
                    文档上传后，后台引擎会将文本按 <b>“200字符重叠滑窗”</b> 进行语义分块，注入企业向量存储（Vector Vault）。在右侧文档列表中，点击文档卡片切片即可即时预览最终解构出的段落。
                  </span>
                </div>
              </div>
            </div>

            {/* Right Frame: Documents list (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-4" id="kb-workspace-right">
              <h3 className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider font-sans">
                文档仓库状态监控 ({activeKB.docs.length} 份数据源)
              </h3>

              {activeKB.docs.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center text-xs text-gray-400" id="kb-docs-empty">
                  <span>该知识空间暂无关联数据，请在左侧拖动您的首份文档上传。</span>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto" id="kb-docs-rendered-list">
                  {activeKB.docs.map((doc) => {
                    const isSelected = selectedDocId === doc.id;
                    return (
                      <div
                        id={`doc-row-${doc.id}`}
                        key={doc.id}
                        onClick={() => {
                          if (doc.status === 'ready') {
                            setSelectedDocId(doc.id);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected 
                            ? 'bg-amber-50/40 border-amber-400 shadow-3xs' 
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-start space-x-3 min-w-0">
                            <div className={`p-2 rounded-xl shrink-0 ${
                              doc.status === 'ready' 
                                ? 'bg-emerald-50 text-emerald-500' 
                                : doc.status === 'failed' 
                                ? 'bg-rose-50 text-rose-500' 
                                : 'bg-sky-50 text-sky-500 animate-pulse'
                            }`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 font-sans truncate break-all pr-4 text-[11px]">{doc.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {doc.size} • 上传于 {doc.uploadedAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            {/* Parser Status Badges */}
                            {doc.status === 'ready' && (
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 font-sans flex items-center">
                                <CheckCircle2 className="w-3 h-3 mr-0.5" /> 准备就绪
                              </span>
                            )}
                            {doc.status === 'failed' && (
                              <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5 font-sans flex items-center">
                                <AlertCircle className="w-3 h-3 mr-0.5" /> 处理失败
                              </span>
                            )}
                            {doc.status === 'processing' && (
                              <span className="text-[9px] font-bold text-sky-600 bg-sky-50 border border-sky-200 rounded-full px-2 py-0.5 font-sans flex items-center animate-pulse">
                                <Clock className="w-3 h-3 mr-0.5" /> 切片中 {doc.progress}%
                              </span>
                            )}

                            <button
                              id={`delete-doc-btn-${doc.id}`}
                              onClick={(e) => handleDeleteDoc(doc.id, e)}
                              className="p-1 hover:bg-slate-100 rounded text-gray-400 hover:text-rose-500 transition-colors"
                              title="删除此文档"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Rendering simulated processing bar inside each processing items */}
                        {doc.status === 'processing' && (
                          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div 
                              className="bg-sky-500 h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${doc.progress}%` }}
                            />
                          </div>
                        )}

                        {/* Inform view details switch if ready */}
                        {doc.status === 'ready' && (
                          <div className="mt-2.5 pt-2 border-t border-gray-100/60 flex items-center justify-between text-[10px] text-gray-400 font-sans">
                            <span>切片总数: <b>{doc.chunks.length} 个语义分块</b></span>
                            <span className="text-sky-600 font-bold hover:underline inline-flex items-center text-[9px] cursor-pointer">
                              <Eye className="w-3 h-3 mr-0.5" /> {isSelected ? '正在预览切片' : '点击查看切片大纲'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Vectorized Chunk Slices Preview Box (shown underneath when selectedDocId is loaded) */}
          {activeDoc && activeDoc.status === 'ready' && (
            <div id="vector-chunk-analyzer-box" className="mt-6 border border-amber-300 rounded-3xl bg-amber-500/5 p-5 md:p-6 shadow-xs animate-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between pb-3.5 border-b border-amber-200/50 mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-amber-500/10 text-amber-700 rounded-lg">
                    <Compass className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-amber-900 font-sans">
                      向量分快详情分析 (Chunk Preview) — {activeDoc.name}
                    </h3>
                    <p className="text-[10px] text-amber-700/80 mt-0.5 font-sans">预览经本地嵌入式 Embedding 模型索引存储的块状数据</p>
                  </div>
                </div>
                <button
                  id="close-chunk-analyzer-btn"
                  onClick={() => setSelectedDocId(null)}
                  className="text-amber-700 hover:text-amber-900 font-bold text-xs font-sans hover:underline cursor-pointer"
                >
                  关闭切片预览
                </button>
              </div>

              {activeDoc.chunks.length === 0 ? (
                <div className="text-center p-6 text-gray-400 text-xs font-sans">
                  无可展示的向量分块。可能有解析未尽事宜。
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="chunks-preview-grid">
                  {activeDoc.chunks.map((chk, i) => (
                    <div
                      key={chk.id}
                      id={`chunk-preview-card-${chk.index}`}
                      className="bg-white border border-amber-200 rounded-2xl p-4 flex flex-col justify-between shadow-3xs"
                    >
                      <div>
                        <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 mb-2 text-[10px] text-gray-500 font-sans">
                          <span className="font-bold text-amber-700 font-mono">嵌入编码指数 Chunk #{chk.index}</span>
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono font-bold text-[9px]">
                            {chk.charCount} 字符
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-600 leading-relaxed font-sans line-clamp-6 select-all select-none">
                          “{chk.content}”
                        </p>
                      </div>
                      <div className="mt-3.5 pt-2 border-t border-gray-100 text-[9px] text-gray-400 font-mono text-right">
                        Interval: [{i * 200} - {i * 200 + chk.charCount}]
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* NEW KNOWLEDGE BASE CREATION MODAL */}
      {showCreateModal && (
        <div id="create-kb-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div id="create-kb-modal-card" className="bg-white rounded-3xl w-full max-w-lg p-5 border border-slate-100 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-800 mb-1 font-sans">新建 RAG 企业知识关联库</h3>
            <p className="text-[11px] text-slate-400 mb-4 font-sans">创建后，可直接关联上传对应业务的 PDF/DOC 文档，配合在对话顶栏绑定即可实现智能搜索。</p>
            
            <form onSubmit={handleCreateKB} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 font-sans">知识库名称*</label>
                <input
                  id="new-kb-name-input"
                  type="text"
                  required
                  placeholder="如：企业海外双清退换货及关税规范"
                  value={newKBName}
                  onChange={(e) => setNewKBName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 font-sans">内容简介*</label>
                <textarea
                  id="new-kb-desc-input"
                  rows={3}
                  required
                  placeholder="在此写明本知识库面向什么业务，方便他人理解引入。例如：收录了财务和审计组共同制订的跨国代收退费机制..."
                  value={newKBDesc}
                  onChange={(e) => setNewKBDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-sans resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-gray-100" id="create-kb-form-buttons">
                <button
                  id="cancel-create-kb-btn"
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold hover:bg-gray-50 focus:outline-none cursor-pointer"
                >
                  取消
                </button>
                <button
                  id="submit-create-kb-btn"
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 focus:outline-none shadow-md hover:shadow-emerald-500/20 cursor-pointer"
                >
                  创建并前往添加文档
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
