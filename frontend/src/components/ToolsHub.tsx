import React, { useState } from 'react';
import { 
  Database, 
  Send, 
  Globe, 
  Languages, 
  Settings, 
  Wrench, 
  X, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Code,
  Plus
} from 'lucide-react';
import { ToolItem } from '../types';

interface ToolsHubProps {
  tools: ToolItem[];
  onUpdateTool: (updatedTool: ToolItem) => void;
  onAddTool: (tool: ToolItem) => void;
}

// Solid icon dictionary lookup
const ToolIcon = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case 'Database': 
      return <Database className={className} />;
    case 'Send': 
      return <Send className={className} />;
    case 'Globe': 
      return <Globe className={className} />;
    case 'Languages': 
      return <Languages className={className} />;
    default: 
      return <Wrench className={className} />;
  }
};

export default function ToolsHub({ tools, onUpdateTool, onAddTool }: ToolsHubProps) {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  
  // Drawer Editing States
  const [editEndpoint, setEditEndpoint] = useState('');
  const [editSchema, setEditSchema] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newToolName, setNewToolName] = useState('');
  const [newToolDesc, setNewToolDesc] = useState('');
  const [newToolIcon, setNewToolIcon] = useState('Wrench');

  const activeTool = tools.find(t => t.id === selectedToolId) || null;

  const handleOpenEditDrawer = (tool: ToolItem) => {
    setSelectedToolId(tool.id);
    setEditEndpoint(tool.endpoint);
    setEditSchema(tool.schema);
    setEditDesc(tool.description);
    setJsonError(null);
    setSaveSuccess(false);
  };

  const handleToggleEnable = (tool: ToolItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening drawer
    const updated = { ...tool, enabled: !tool.enabled };
    onUpdateTool(updated);
  };

  const checkJsonAndSave = () => {
    if (!activeTool) return;
    try {
      // Validate JSON Schema
      JSON.parse(editSchema);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(`JSON 格式无效: ${err.message}`);
      return;
    }

    const updated: ToolItem = {
      ...activeTool,
      endpoint: editEndpoint.trim(),
      schema: editSchema,
      description: editDesc.trim()
    };

    onUpdateTool(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCreateTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolName.trim()) return;

    const defaultSchema = JSON.stringify({
      type: "object",
      properties: {
        keyword: { type: "string", description: "默认检索词" }
      },
      required: ["keyword"]
    }, null, 2);

    const newTool: ToolItem = {
      id: `tool-${Date.now()}`,
      name: newToolName.trim(),
      icon: newToolIcon,
      description: newToolDesc.trim() || '定制配置接口服务',
      enabled: true,
      endpoint: 'https://api.internal/custom-tool',
      schema: defaultSchema
    };

    onAddTool(newTool);
    setNewToolName('');
    setNewToolDesc('');
    setShowCreateModal(false);
    handleOpenEditDrawer(newTool); // Go straight to edit drawer
  };

  return (
    <div className="h-full bg-slate-50/40 p-4 md:p-6 overflow-y-auto relative" id="tools-hub-root">
      
      <div className="max-w-6xl mx-auto" id="tools-space-center">
        {/* Page title info segment */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-sans tracking-tight">智能工具与 Action 插件中心</h2>
            <p className="text-xs text-gray-500 mt-1 font-sans">
              为 Agent 微调执行层！在这里配置 API 端点或定义参数大纲（JSON Schema），让模型在推理流中智选执行。
            </p>
          </div>
          <button
            id="register-new-tool-btn"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 py-2 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium text-xs transition-all shadow-md hover:shadow-violet-500/15"
          >
            <Plus className="w-4 h-4" />
            <span>接入自定义 Action</span>
          </button>
        </div>

        {/* Informative tips widget */}
        <div className="mb-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-100 flex items-start space-x-3 text-xs text-gray-600" id="tools-function-intro">
          <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
          <div className="font-sans leading-relaxed">
            <span className="font-bold block text-gray-800">何谓 Tool-Use（工具函数调用模式）？</span>
            <span className="text-[10px] block text-gray-500 mt-1">
              当用户发起诉求需查询库存、调用发件或查问热点时，AI 将自动分析已开启工具中的 Parameter Schema。一旦参数匹配，会首先输出 \`Thought\`与 \`Action\` 参数块交由前端调用对应 API，观察（\`Observation\`）返回结果再行输出。可以直接在会话空间中发出相关的指令进行联动测试！
            </span>
          </div>
        </div>

        {/* Tools Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="tools-grid-layout">
          {tools.map((tool) => (
            <div
              key={tool.id}
              id={`tool-card-${tool.id}`}
              onClick={() => handleOpenEditDrawer(tool)}
              className={`p-5 rounded-3xl bg-white border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-3xs hover:shadow-md flex flex-col justify-between group ${
                tool.enabled 
                  ? 'border-slate-200/80 hover:border-violet-400' 
                  : 'border-slate-200/40 bg-slate-100/30 opacity-75 hover:opacity-100 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between w-full">
                  <div className={`p-2.5 rounded-xl border group-hover:scale-105 transition-transform shrink-0 ${
                    tool.enabled 
                      ? 'bg-violet-50 text-violet-600 border-violet-100' 
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}>
                    <ToolIcon name={tool.icon} className="w-5 h-5" />
                  </div>

                  {/* Turn On/Off overall Switch */}
                  <div className="flex items-center space-x-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className={`text-[10px] font-sans ${tool.enabled ? 'text-violet-600 font-bold' : 'text-gray-400'}`}>
                      {tool.enabled ? '已激活' : '已停用'}
                    </span>
                    <button
                      id={`tool-switch-btn-${tool.id}`}
                      onClick={(e) => handleToggleEnable(tool, e)}
                      type="button"
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        tool.enabled ? 'bg-violet-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          tool.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-gray-800 mt-4 font-sans group-hover:text-violet-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed font-sans min-h-[3.375rem]">
                  {tool.description}
                </p>
              </div>

              {/* Endpoint signature at card footer */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-mono" id={`tool-card-footer-${tool.id}`}>
                <span className="truncate max-w-[70%]" title={tool.endpoint}>{tool.endpoint}</span>
                <span className="text-xs text-violet-600 hover:underline group-hover:translate-x-0.5 transition-transform flex items-center font-sans font-bold">
                  配置结构 <ExternalLink className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DETAILED DRAWERS VIEW (SIDE PANEL FROM RIGHT) */}
      {activeTool && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedToolId(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 transition-opacity"
            id="drawer-backdrop"
          />

          {/* Drawer Body Canvas */}
          <div 
            id="tool-drawer-canvas"
            className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl border-l border-slate-100 z-50 transform transition-transform duration-300 translate-x-0 flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50" id="tool-drawer-header">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-violet-100 text-violet-600 rounded-xl">
                  <ToolIcon name={activeTool.icon} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-800 font-sans">{activeTool.name}</h3>
                  <span className="text-[10px] text-gray-400 block -mt-0.5">唯一配置代号: {activeTool.id}</span>
                </div>
              </div>
              <button
                id="close-tool-drawer-btn"
                onClick={() => setSelectedToolId(null)}
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content Workspace */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4" id="tool-drawer-workspace-scroller">
              
              {/* Description View/Edit */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 font-sans">工具简介 (AI语义配准)</label>
                <textarea
                  id="tool-edit-desc-input"
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-sans resize-none"
                />
              </div>

              {/* Endpoint Address */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 font-sans">
                  核心服务器端点 (API Webhook Endpoint)
                </label>
                <input
                  id="tool-edit-endpoint-input"
                  type="url"
                  value={editEndpoint}
                  onChange={(e) => setEditEndpoint(e.target.value)}
                  placeholder="请输入用于接收 Action 回执的公网 API 路由"
                  className="w-full text-xs px-3/5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-mono text-slate-800"
                />
              </div>

              {/* Parameter Definition JSON Schema */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans flex items-center">
                    <Code className="w-3.5 h-3.5 mr-1 text-slate-500" /> 入参结构 (Parameter JSON Schema)
                  </label>
                  <span className="text-[9px] text-gray-400 font-sans">遵守 OpenAPI 3.0 标准</span>
                </div>
                
                <textarea
                  id="tool-edit-schema-textarea"
                  rows={11}
                  value={editSchema}
                  onChange={(e) => {
                    setEditSchema(e.target.value);
                    setJsonError(null);
                  }}
                  className="w-full text-xs px-3.5 py-2.5 rounded-2xl bg-slate-900 text-slate-100 placeholder-slate-500 font-mono border border-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all whitespace-pre leading-relaxed"
                />

                {/* Validation Info alerts */}
                {jsonError ? (
                  <div className="mt-2 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-xl flex items-start space-x-1" id="schema-json-error">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{jsonError}</span>
                  </div>
                ) : (
                  <div className="mt-2 text-[10px] text-slate-400 font-sans leading-tight">
                    大语言模型将借由上方定义的 Schema 信息进行参数转码封装。如果入参配置有误，决策链路会偏轨。
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Bottom Action Console */}
            <div className="p-4 border-t border-gray-100 bg-slate-50/50 flex items-center justify-end space-x-2.5" id="tool-drawer-footer-actions">
              {saveSuccess && (
                <div className="flex items-center text-xs text-emerald-600 pr-2 font-sans" id="tool-save-success-indicator">
                  <CheckCircle className="w-4 h-4 mr-1 animate-ping" style={{animationDuration: '2s'}} />
                  <span>参数配对成功，已同步全局 Agent</span>
                </div>
              )}
              
              <button
                id="cancel-tool-drawer-btn"
                type="button"
                onClick={() => setSelectedToolId(null)}
                className="px-4 py-2 border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold hover:bg-gray-100 cursor-pointer"
              >
                关闭
              </button>
              <button
                id="save-tool-drawer-btn"
                onClick={checkJsonAndSave}
                type="button"
                className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                保存配置并升级
              </button>
            </div>
          </div>
        </>
      )}

      {/* NEW TOOL CREATION MODAL */}
      {showCreateModal && (
        <div id="create-tool-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div id="create-tool-modal-card" className="bg-white rounded-3xl w-full max-w-lg p-5 border border-slate-100 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-800 mb-1 font-sans">绑定外部自定义 Action API</h3>
            <p className="text-[11px] text-slate-400 mb-4 font-sans">绑定全新的网关后，AI 大模型便能自动获取互联网或关联自研平台的关键接口。</p>
            
            <form onSubmit={handleCreateTool} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 font-sans">工具 / 插件名称*</label>
                <input
                  id="new-tool-name-input"
                  type="text"
                  required
                  placeholder="如：财务数据库多轮核销对账机器人"
                  value={newToolName}
                  onChange={(e) => setNewToolName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 font-sans">Icon 图像分类</label>
                <select
                  id="new-tool-icon-select"
                  value={newToolIcon}
                  onChange={(e) => setNewToolIcon(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-sans cursor-pointer"
                >
                  <option value="Wrench">常规扳手设备 (Wrench)</option>
                  <option value="Database">数据库容器 (Database)</option>
                  <option value="Send">即时推送发信 (Send)</option>
                  <option value="Globe">世界网页检索 (Globe)</option>
                  <option value="Languages">语义及语种聚合 (Languages)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 font-sans">功能详情描述*</label>
                <textarea
                  id="new-tool-desc-input"
                  rows={2}
                  required
                  placeholder="写明用途：如查询本期项目所有账单报损金额，以便大模型对齐执行时机..."
                  value={newToolDesc}
                  onChange={(e) => setNewToolDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-sans resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-gray-100" id="create-tool-form-buttons">
                <button
                  id="cancel-create-tool-btn"
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold hover:bg-gray-50 focus:outline-none cursor-pointer"
                >
                  取消
                </button>
                <button
                  id="submit-create-tool-btn"
                  type="submit"
                  className="px-4 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700 focus:outline-none shadow-md hover:shadow-violet-500/20 cursor-pointer"
                >
                  建立并配置 Schema 细节
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
