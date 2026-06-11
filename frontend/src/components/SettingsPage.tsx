import React, { useState } from 'react';
import { 
  User, 
  Key, 
  Cpu, 
  HelpCircle, 
  Check, 
  ShieldCheck, 
  SlidersHorizontal, 
  Database, 
  Fingerprint,
  Info
} from 'lucide-react';

export default function SettingsPage() {
  const [temperature, setTemperature] = useState(0.4);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [systemPrompt, setSystemPrompt] = useState('你是一位高大上的企业级AI专家，熟悉公司政策与RAG知识库，精通Tool Use逻辑，始终用专业且客气的语调进行深度回应。');

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full bg-slate-50/40 p-4 md:p-6 overflow-y-auto" id="settings-page-root">
      
      <div className="max-w-3xl mx-auto space-y-6" id="settings-page-container">
        
        {/* Title segment */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-sans tracking-tight">个人设置与系统高级策略</h2>
          <p className="text-xs text-gray-500 mt-1 font-sans">
            管理您的企业伙伴信息，配置大语言模型推理底温（Temperature）、核心提示词（System Prompt）及安全调用阈值。
          </p>
        </div>

        {/* Part 1: User details card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 shadow-3xs" id="user-details-card">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 font-sans flex items-center">
            <Fingerprint className="w-4 h-4 mr-1.5 text-slate-500" /> 企业账号档案 (Profile Detail)
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" id="user-info-row">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white text-base font-bold shadow-sm">
                CJ
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">陈杰春 (Chen Jiechun)</h4>
                <p className="text-xs text-gray-500 font-mono mt-0.5">chenjiechun73@gmail.com</p>
              </div>
            </div>
            
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 font-sans font-semibold flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> 集团金牌管理员/企业顾问已授权
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-gray-100" id="user-tier-grid">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200/50">
              <span className="text-[10px] text-gray-400 font-sans font-semibold block">企业订阅级别</span>
              <span className="text-xs font-bold text-slate-800 block mt-1">Enterprise Plus Standard</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200/50">
              <span className="text-[10px] text-gray-400 font-sans font-semibold block">已配属向量空间上限</span>
              <span className="text-xs font-bold text-slate-800 block mt-1">10 个关联 RAG 分空间 (已用 2)</span>
            </div>
          </div>
        </div>

        {/* Part 2: Hyperparameters tweaking sliders */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 shadow-3xs space-y-4" id="model-hyperparams-card">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-sans flex items-center">
            <SlidersHorizontal className="w-4 h-4 mr-1.5 text-slate-500" /> AI 模型推理微调 (Hyperparameters)
          </h3>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-gray-700">随机采样温度 (Temperature): <b className="font-mono text-sky-600">{temperature}</b></span>
              <span className="text-[10px] text-gray-400">[0.0=严谨精确, 1.0=高度发散]</span>
            </div>
            <input
              id="temp-slider"
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-ew-resize accent-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-gray-700">最大单次生成 tokens 限制 (Max Tokens): <b className="font-mono text-sky-600">{maxTokens}</b></span>
              <span className="text-[10px] text-gray-400">[范围: 128 - 16384]</span>
            </div>
            <input
              id="tokens-slider"
              type="range"
              min="128"
              max="16384"
              step="128"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-ew-resize accent-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 font-sans mb-1">系统全局指导词 (System Prompt Template)</label>
            <textarea
              id="system-prompt-textarea"
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-sans resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Part 3: API keys notice compliance inside environment constraint */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 shadow-3xs space-y-3.5 animate-pulse" style={{animationDuration: '6s'}} id="api-keys-secrets-card">
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 mb-1">
            <h3 className="text-xs font-bold text-gray-800 font-sans flex items-center">
              <Key className="w-4 h-4 mr-1.5 text-amber-500" /> 企业 API 密钥及托管策略说明 (Secrets Instruction)
            </h3>
            <span className="text-[9px] bg-sky-50 text-sky-600 rounded px-1.5 py-0.2 border border-sky-200 font-bold font-mono">
              SYSTEM LEVEL
            </span>
          </div>

          <p className="text-xs text-gray-500 font-sans leading-relaxed">
            为了全方位保证 API Keys（如 Google Gemini API、DeepSeek 核心证书、第三方支付等密钥）的机密不流向浏览器公端：
          </p>
          
          <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc pl-4 font-sans">
            <li><b>服务端代发机制：</b> 平台内置采用高稳态 Express 后台与 Vite Middleware 代发请求，前端绝不保留任何明文凭证。</li>
            <li><b>高级密钥存储：</b> 如果您需要更换或载入生产环境真实的 \`GEMINI_API_KEY\` 或自定义 API 端口凭据，请切勿在此硬编码，请即前往本工作区顶端菜单 <b>【Settings -&gt; Secrets】</b> 项目中直接录入。平台会在打包布线时自动读取注入安全通道。</li>
          </ul>

          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 flex items-start space-x-2.5 text-[11px] text-blue-800" id="secrets-panel-tip">
            <Info className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
            <span className="font-sans leading-tight">
              <b>免密提醒：</b>目前系统正运行于 AI Studio 开发调试代理模式，已为您安全虚拟对齐好了 Gemini 满血大模型所必需的测试鉴权，开发者可畅享流畅极好的流式回应体验。
            </span>
          </div>
        </div>

        {/* Footer controller */}
        <div className="flex items-center justify-end space-x-2" id="settings-page-footer">
          {saved && (
            <span className="text-xs text-emerald-600 font-sans font-bold flex items-center mr-2 animate-bounce" id="settings-save-success">
              <Check className="w-4 h-4 mr-1" /> 已保存最新模型配置系数
            </span>
          )}
          <button
            id="save-settings-btn"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-600 hover:to-indigo-700 font-medium text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            保存并应用以上策略
          </button>
        </div>

      </div>

    </div>
  );
}
