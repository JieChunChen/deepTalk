import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Trash, 
  Trash2, 
  Paperclip, 
  Send, 
  Square, 
  HelpCircle, 
  Clock, 
  Database,
  ArrowRight,
  DatabaseZap,
  Bot,
  Zap,
  Info,
  Files,
  FileCheck
} from 'lucide-react';
import { ChatSession, Message, KnowledgeBase, ToolItem, Citation, ThoughtStep } from '../types';
import ChatMessage from './ChatMessage';
import HeaderControls from './HeaderControls';
import { streamChat } from '../lib/api';

interface ChatInterfaceProps {
  session: ChatSession;
  knowledgeBases: KnowledgeBase[];
  tools: ToolItem[];
  onUpdateSession: (updatedSession: ChatSession) => void;
  onToggleKB: (id: string) => void;
  onToggleMobileSidebar: () => void;
}

export default function ChatInterface({
  session,
  knowledgeBases,
  tools,
  onUpdateSession,
  onToggleKB,
  onToggleMobileSidebar
}: ChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tempFileStatus, setTempFileStatus] = useState<'none' | 'uploading' | 'added'>('none');
  const [tempFileName, setTempFileName] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRefs = useRef<any[]>([]);
  const activeStreamAbortRef = useRef<AbortController | null>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, isGenerating]);

  // Clean timers when component unmounts
  useEffect(() => {
    return () => {
      timerRefs.current.forEach(t => clearTimeout(t));
    };
  }, []);

  const handleClearChat = () => {
    if (isGenerating) {
      handleStopGeneration();
    }
    const updated = {
      ...session,
      messages: [],
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    onUpdateSession(updated);
    setTempFileStatus('none');
  };

  const handleStopGeneration = () => {
    timerRefs.current.forEach(t => clearTimeout(t));
    timerRefs.current = [];
    activeStreamAbortRef.current?.abort();
    activeStreamAbortRef.current = null;
    setIsGenerating(false);

    // If there is an unfinished response, mark it as interrupted
    if (session.messages.length > 0) {
      const lastMsg = session.messages[session.messages.length - 1];
      if (lastMsg.role === 'assistant' && lastMsg.isStreaming) {
        const updatedMessages = [...session.messages];
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMsg,
          isStreaming: false,
          content: lastMsg.content + '\n\n*(已手动停止回复生成...)*'
        };
        onUpdateSession({
          ...session,
          messages: updatedMessages
        });
      }
    }
  };

  const executeBackendStream = async (userQuery: string) => {
    setIsGenerating(true);

    const userMessageId = `msg-user-local-${Date.now()}`;
    const userMsg: Message = {
      id: userMessageId,
      role: 'user',
      content: userQuery,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    const initialMessages = [...session.messages, userMsg];
    
    const assistantMessageId = `msg-ai-local-${Date.now()}`;
    const emptyAssistantMsg: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
      thoughtStep: {
        thought: '已提交到后端模型服务，正在等待流式返回。',
        action: 'POST /api/chat/stream',
        observation: '连接建立中...',
        state: 'calling'
      }
    };

    onUpdateSession({
      ...session,
      messages: [...initialMessages, emptyAssistantMsg]
    });

    const controller = new AbortController();
    activeStreamAbortRef.current = controller;
    let streamedContent = '';

    try {
      const finalAssistantMessage = await streamChat({
        conversationId: session.id,
        message: userQuery,
        modelName: session.model,
        signal: controller.signal,
        onToken: (token) => {
          streamedContent += token;
          const streamingMsg: Message = {
            ...emptyAssistantMsg,
            content: streamedContent,
            isStreaming: true,
            thoughtStep: {
              thought: '后端正在流式返回内容。',
              action: 'POST /api/chat/stream',
              observation: '接收中...',
              state: 'success'
            }
          };
          onUpdateSession({
            ...session,
            messages: [...initialMessages, streamingMsg]
          });
        }
      });

      onUpdateSession({
        ...session,
        messages: [...initialMessages, { ...finalAssistantMessage, isStreaming: false }]
      });
    } catch (_error) {
      const failedMsg: Message = {
        ...emptyAssistantMsg,
        content: streamedContent || '请求失败，请稍后重试。',
        isStreaming: false,
        thoughtStep: {
          thought: '后端调用失败。',
          action: 'POST /api/chat/stream',
          observation: '请求中断或网络异常。',
          state: 'success'
        }
      };
      onUpdateSession({
        ...session,
        messages: [...initialMessages, failedMsg]
      });
    } finally {
      activeStreamAbortRef.current = null;
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || isGenerating) return;
    const query = inputText;
    setInputText('');
    void executeBackendStream(query);
  };

  const handleSuggestionClick = (query: string) => {
    if (isGenerating) return;
    void executeBackendStream(query);
  };

  const handleSimulateAttachmentUpload = () => {
    setTempFileStatus('uploading');
    setTempFileName('员工日常餐餐饮扣罚细则_补充附件.pdf');
    const tUpload = setTimeout(() => {
      setTempFileStatus('added');
      // Automatically toggle link or association
      if (!session.associatedKBIds.includes('kb-1')) {
        onToggleKB('kb-1');
      }
    }, 1500);
    timerRefs.current.push(tUpload);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSend();
    }
  };

  const suggestions = [
    {
      id: 's-1',
      title: '差旅报销限额查询',
      desc: '查询北京住宿上限及餐饮补助',
      prompt: '北京出差一天的定额补贴是多少钱？听说北京、上海的标准跟普通城市不一样，有独立的文件说明吗？',
      iconColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    },
    {
      id: 's-2',
      title: '主板售后换新流转',
      desc: '检验主板物理烧毁的返厂对策',
      prompt: '如果客户退回的主板烧了，主张要以旧换新，但怀疑是他们超频烧毁的，应该按照售后服务细则怎么对账核查？',
      iconColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    },
    {
      id: 's-3',
      title: '测试钉钉群API接口',
      desc: '触发群机器人高权重 markdown 发信',
      prompt: '能帮我调用后台的“钉钉通知推送接口”，群发一条标题为“【核心运维公告】中型业务迁移节点告警”、级别为high的消息吗？',
      iconColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
    },
    {
      id: 's-4',
      title: '互联网数据检索',
      desc: '运用 Google SERP 分析技术反馈',
      prompt: '帮我调研一下市场上关于 DeepSeek-R1 满血版对比传统大模型的具体性能痛点和真实学术反馈表现。',
      iconColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/40 relative" id="chat-interface-root">
      
      {/* Top Header - Model selector + KB association popover */}
      <HeaderControls
        selectedModel={session.model}
        onModelChange={(model) => onUpdateSession({ ...session, model })}
        knowledgeBases={knowledgeBases}
        associatedKBIds={session.associatedKBIds}
        onToggleKB={onToggleKB}
        onToggleMobileSidebar={onToggleMobileSidebar}
      />

      {/* Main Message Stream Box */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6" id="message-stream-scroll">
        
        {session.messages.length === 0 ? (
          
          /* RENDER HIGH-FIDELITY EMPTY STATE */
          <div id="chat-empty-state" className="max-w-3xl mx-auto py-10 md:py-16 text-center">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md mb-5 animate-bounce">
              <Bot className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-sans tracking-tight">
              智研 DeepCore RAG 客服脑力空间
            </h2>
            <p className="text-sm text-gray-500 mt-2.5 max-w-lg mx-auto font-sans leading-relaxed">
              关联本地 **嵌入式决策知识库** 或集成 **外部 GraphQL/Rest Tools** 接口。搭载多轮混合思维链，输出兼具深度和可溯源的安全应答。
            </p>

            <div className="mt-8 border border-gray-150 bg-white/70 backdrop-blur-xs rounded-2xl p-4 flex items-center justify-between text-left max-w-lg mx-auto shadow-3xs" id="rag-badge-info">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <DatabaseZap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">检索关联状态</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">当前在当前窗口关联了 {session.associatedKBIds.length} 份核心预训练库。</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 underline text-[10px] text-amber-600 cursor-pointer font-bold animate-pulse">
                <span>快速联动</span>
                <Zap className="w-3 h-3" />
              </div>
            </div>

            {/* Suggestions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 max-w-3xl text-left" id="suggestions-grid">
              {suggestions.map((s) => (
                <button
                  id={`suggestion-card-${s.id}`}
                  key={s.id}
                  onClick={() => handleSuggestionClick(s.prompt)}
                  disabled={isGenerating}
                  className="p-4 bg-white hover:bg-amber-50/20 border border-gray-200 hover:border-amber-300 rounded-2xl text-left transition-all duration-200 cursor-pointer shadow-3xs hover:shadow-sm hover:-translate-y-0.5 flex flex-col group"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg border text-xs shrink-0 ${s.iconColor}`}>
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-gray-800 font-sans">{s.title}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1.5 truncate w-full group-hover:text-gray-500 font-sans">{s.desc}</span>
                  <div className="flex items-center text-[10px] text-amber-600 font-bold mt-3 group-hover:underline">
                    <span>发送此指令</span>
                    <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          
          /* RENDER CONVERSATION DIALOGS */
          <div className="max-w-3xl mx-auto space-y-6">
            {session.messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                isGenerating={isGenerating && msg.id === session.messages[session.messages.length - 1].id}
              />
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Persistent Interrupt & Input Panel Bottom Area */}
      <div className="p-4 bg-white/80 border-t border-gray-100 backdrop-blur-md" id="input-chassis">
        <div className="max-w-3xl mx-auto">
          
          {/* STOP GENERATING OVERLAY BUTTON */}
          {isGenerating && (
            <div className="flex justify-center mb-3">
              <button
                id="stop-generation-btn"
                onClick={handleStopGeneration}
                className="inline-flex items-center space-x-2 px-4 py-1.5 bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 rounded-full text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer animate-fade-in"
              >
                <Square className="w-3.5 h-3.5 fill-current text-amber-500 animate-pulse" />
                <span className="font-sans">停止对话生成 (Stop Stream)</span>
              </button>
            </div>
          )}

          {/* Uploaded Temp Knowledge File Status Bar */}
          {tempFileStatus !== 'none' && (
            <div className="mb-2.5 flex items-center justify-between p-2 bg-amber-500/5 border border-amber-500/20 rounded-xl" id="temp-file-status-indicator">
              <div className="flex items-center space-x-2">
                <div className="p-1 px-1.5 bg-amber-500/10 text-amber-600 rounded-lg text-xs">
                  <Paperclip className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-gray-800 block truncate font-sans">{tempFileName}</span>
                  <span className="text-[9px] text-gray-500 font-mono">
                    {tempFileStatus === 'uploading' ? '正在加速写入关联索引...' : '切片向量完成！已临时加载至当前对话内存'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {tempFileStatus === 'uploading' ? (
                  <div className="w-16 bg-gray-200 rounded-full h-1">
                    <div className="bg-amber-500 h-1 rounded-full animate-pulse" style={{width: '65%'}}></div>
                  </div>
                ) : (
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full font-sans flex items-center">
                    <FileCheck className="w-3 h-3 mr-0.5" /> 已激活
                  </span>
                )}
                <button
                  id="remove-temp-file-btn"
                  onClick={() => setTempFileStatus('none')}
                  className="text-gray-400 hover:text-rose-500 p-0.5 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Actual Input Console Wrapper */}
          <div className="relative border border-gray-200 hover:border-gray-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/10 rounded-2xl bg-white p-2 transition-all shadow-3xs" id="chat-input-wrapper">
            <textarea
              id="chat-main-textarea"
              placeholder="发送企业政策咨询、知识查询，或让 AI 执行已对接工具..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={Math.max(1, Math.min(6, inputText.split('\n').length))}
              disabled={isGenerating}
              className="w-full resize-none border-0 bg-transparent px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 leading-relaxed font-sans"
            />

            <div className="flex items-center justify-between border-t border-gray-100/80 pt-2 px-1" id="chat-textarea-footer">
              <div className="flex items-center space-x-1.5 text-gray-400">
                <button
                  id="simulate-attachment-btn"
                  onClick={handleSimulateAttachmentUpload}
                  disabled={isGenerating || tempFileStatus !== 'none'}
                  className="p-1.5 hover:bg-gray-50 hover:text-gray-600 rounded-xl transition-all cursor-pointer text-xs shrink-0 inline-flex items-center space-x-1"
                  title="上传临时知识附件 (.pdf, .txt, .docx)"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-sans text-[10px]">添加本地附件</span>
                </button>

                <button
                  id="clear-chat-history-btn"
                  onClick={handleClearChat}
                  className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all text-xs shrink-0 inline-flex items-center space-x-1 cursor-pointer"
                  title="清除当前会话历史"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-sans text-[10px]">清空对话</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[9px] text-gray-400 hidden sm:inline font-mono">
                  Ctrl + Enter 发送
                </span>
                <button
                  id="submit-chat-btn"
                  onClick={handleSend}
                  disabled={!inputText.trim() || isGenerating}
                  className={`p-2 rounded-xl transition-all shadow-sm shrink-0 inline-flex items-center justify-center ${
                    inputText.trim() && !isGenerating
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white cursor-pointer hover:shadow-md active:scale-95'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2 text-[10px] text-center text-gray-400 block font-sans">
            智脑基于关联知识片段生成应答数据，所有引文可通过鼠标悬停 inline 序号 <b>[1]</b> 查看对应文献段落。
          </div>
        </div>
      </div>

    </div>
  );
}

/* HELPER CONSTANT VALUES TO DYNAMICALLY POPULATE RICH STREAMS RESPONSIVELY */

function getThinkingLog(type: string, query: string): string {
  switch (type) {
    case 'travel':
      return `用户核心诉求是咨询“北京出差补助限额以及业务招待审批条件”。\n逻辑步骤：\n1. 请求关联的行政知识库 [kb-1]。\n2. 计算与“北京”、“一类城市”、“差旅”、“招待费”、“审批”等高匹配度多层向量特征。\n3. 定位到“员工差旅及业务招待费报销管理规定(2026版).pdf”中的第1点、第2点与第3点。`;
    case 'aftersales':
      return `收到客户退货质量争端诉求。\n逻辑步骤：\n1. 调集知识库 [kb-2] (售后质检指南)。\n2. 扫描关于“主板烧毁”、“以旧换换”、“鉴定检测”、“人为损耗”核心规则。\n3. 定位到“售后退换货服务细则说明书.pdf”，准备提取工程师鉴定步骤与运费报销责任。`;
    case 'dingtalk':
      return `用户下达指令请求调用外部 API：【钉钉通知推送接口】。\n1. 提取参数：消息标题="中型业务迁移节点告警" 优先级="high"。\n2. 检查工具中心配置：[tool-2] 项目机器人已经部署并开启。\n3. 正在封装 JSON Payload 请求实体，进行第三方 webhook 推送。`;
    case 'internet':
      return `该提问属于时效性评测，需要启动互联网混合搜索 (Web Search)。\n1. 检查 Tools 状态：[tool-3] 谷歌 SERP 互联网搜索增强已预设启用。\n2. 将关键字整理为："DeepSeek-R1 满血版对比 大模型 性能痛点 学术反馈"。\n3. 启动外部网络抓取，进行多源对比归并。`;
    case 'default':
    default:
      return `无特定知识库强关联命中。采用自主思考决策对齐逻辑。\n基于通用企业文案助手，提取用户询问重点：“${query}”。\n正在生成针对性的行动大纲和细节梳理。`;
  }
}

function getActionEndpoint(type: string): string {
  switch (type) {
    case 'travel':
      return `SemanticQueryEngine.retrieve(\n  target_kb="kb-1", \n  keywords=["北京", "差旅补贴", "招待费", "VP审批"],\n  top_k=3\n)`;
    case 'aftersales':
      return `SemanticQueryEngine.retrieve(\n  target_kb="kb-2", \n  keywords=["售后换新", "主板烧毁", "人为故障鉴别"],\n  top_k=2\n)`;
    case 'dingtalk':
      return `POST https://oapi.dingtalk.com/robot/send?access_token=66ef92\n{\n  "chat_id": "corp_ops_channel",\n  "title": "【核心运维公告】中型业务迁移节点告警",\n  "content_markdown": "### 【核心运维公告】中型业务迁移节点告警 \\n - **级别**: High \\n - **通报时间**: 2026-06-11 \\n - **事件详情**: 服务器迁移进入收尾，请注意节点切换...",\n  "priority": "high"\n}`;
    case 'internet':
      return `GET https://serp.googleapi.com/query?search_query=DeepSeek-R1+full+model+performance+academic+feedback&search_type=finance\n{\n  "client_id": "corp_agent_hub"\n}`;
    case 'default':
    default:
      return `CoreExecutiveEngine.synthesize(\n  prompt="${type}",\n  temperature=0.3\n)`;
  }
}

function getObservationResult(type: string): string {
  switch (type) {
    case 'travel':
      return `检索结果：\n1. [员工差旅规定 ch-1]：北京、上海一类城市补贴 150 元/天；住宿上限 550 元。\n2. [员工差旅规定 ch-2]：市内定额交通费 80 元/天。\n3. [员工差旅规定 ch-3]：单次业务招待2000-10000元需分管VP签字审批。`;
    case 'aftersales':
      return `检测到2个切片：\n1. [售后细则 ch-1] 发生手机主板元器件烧坏要求退换，必须返厂检验，确属非人为制造缺陷才符合政策。\n2. [售后细则 ch-2] 如判定为不当超频人为烧毁，应行使拒绝权，并由消费者承担检测物流成本。`;
    case 'dingtalk':
      return `{"errcode":0,"errmsg":"ok","message_id":"ding_msg_uuid9087114b"}\n通知推送成功，集团客服大厅钉钉群内已收到报警卡片。`;
    case 'internet':
      return `抓取互联网资讯完成（共耗时720ms，抓取到5条主流技术分析文章）：\n1. 满血 R1 逻辑推理深度无与伦比，但在超大规模并发、冷启动时延（First Token Latency）方面在特定硬件集群下会产生一定偶发性瓶颈。\n2. 芯片断供环境下，混合FP8精度表现受到较多学者关注，是主要技术焦点。`;
    case 'default':
    default:
      return `思维推演结束。已从上下文以及模型长期记忆内存中，归整出符合专业规范的内容框架。`;
  }
}

function getCitations(type: string): Citation[] {
  switch (type) {
    case 'travel':
      return [
        { id: 'cit-1', index: 1, sourceDocName: '员工差旅及业务招待费报销管理规定(2026版).pdf', chunkText: '一类城市（北京、上海、广州等）国内住宿标准上限为 550 元/间/夜。' },
        { id: 'cit-2', index: 2, sourceDocName: '员工差旅及业务招待费报销管理规定(2026版).pdf', chunkText: '一类城市每人每天伙食限额补贴标准为 120 元（北京、上海特别执行 150 元/天标准）；市内交通定额 80 元。' },
        { id: 'cit-3', index: 3, sourceDocName: '员工差旅及业务招待费报销管理规定(2026版).pdf', chunkText: '单次招待费用在 2000 元以下由部门总监审批；2000元至 10000 元的需分管 VP 审批；超过 10000 元由 CEO 审批。' }
      ];
    case 'aftersales':
      return [
        { id: 'cit-10', index: 1, sourceDocName: '售后退换货服务细则说明书.pdf', chunkText: '经售后工程师远程核定或返厂检测确属主板组件、内部元器件非人为缺陷损坏方可申请以旧换新服务。' }
      ];
    case 'internet':
    case 'dingtalk':
    case 'default':
    default:
      return [];
  }
}

function getFinalAnswerText(type: string): string {
  switch (type) {
    case 'travel':
      return `您好！根据您关联的知识库 **《员工差旅及业务招待费报销管理规定(2026版).pdf》**，针对北京出差的标准及招待费审批层级说明如下：

### 1. 行程差旅补贴限额 (一类城市：北京)
*   **出差住宿上限：** 北京为一类城市，标准上限是 **550 元 / 间 / 夜** [1]。
*   **出差伙食补贴：** 通常一类城市每天 120 元，但**北京和上海特别执行 150 元 / 天** 的餐饮津贴标准 [2]。
*   **市内通勤交通费：** 每天固定交通报销额度是 **80 元 / 天**，凭发票打卡冲抵 [2]。

### 2. 招待餐费的VP核销界判
有关贵组的出差招待餐事关重大：
*   **总费用低于 2000 元：** 直接挂载在对应项目上，由您本部门的总监直接在系统勾选签字即可 [3]；
*   **单笔接待介于 2000元 至 10000元：** 属于必须上报阶段，报销时自动汇签流转 **由分管 VP 进行逐级审批** [3]；
*   **单笔接待高于 10000 元：** 需提供额外多方说明，且由 **CEO** 直接一签定审批准。

*小贴士：根据财务制度，以上所有招待费核销前需提前至少1天在OA发起接待单哦，否则直接报销将会被财务拒绝审单。*`;

    case 'aftersales':
      return `您好，对于您反馈的“客户退回手机主板损烧，并要求以旧换新却有超载超频嫌疑”的案件，根据关联知识库 **《售后退换货服务细则说明书.pdf》** 规定：

1.  **必须由工程师鉴定，不可直接通过退换：** 售后退换货流程首要步骤，是由驻点或返厂工程师检测主板状态，确非人为过载、超载、擅自刷机及超频造成的“非人为核心原件缺陷”才可在无质量纠纷情况下置换 [1]。
2.  **流转对策：**
    *   **步骤一：** 先在系统内冻结该客户的“以旧换新”急速绿色通道。
    *   **步骤二：** 指引客户将手机寄送至我们的检测基地。
    *   **步骤三：** 物理工程师切片提取元器件性能与烧损截面，并出具具有章戳的检测回执。
3.  **运费与报销费判定：**
    *   如果确属硬件天然缺陷，来回运费和第三方评估费由公司财务代缴。
    *   如果是人为操作异常击穿，则直接拒绝，通知客户返回退还，期间物流往返运费均需自理。`;

    case 'dingtalk':
      return `### 📢 自动化执行通报：钉钉卡片发信已成功
已调用 **[钉钉实时通知推送机器人]**，并连接地址：\`https://oapi.dingtalk.com/robot/send?access_token=66ef92\`
推送参数与接口返回内容汇总：

*   **信箱卡片标题：** 【中型数据库迁移就绪通知】
*   **安全发信级别：** **高优先级 (High Priority)**
*   **发件网关状态：** \`200 HTTP OK\` (延迟 120ms)

*通知内容预览：*
> **中型数据库运维小组：**
> 北京时间2026年06月11日，系统底层备份包已全部核实，定于今日夜间3:00重启高并发迁移哨。核心运营伙伴及chenjiechun73请及时跟进进度，保持网络开通。

群内管理员已经于秒级在移动端及PC收到智能弹窗，无任何报备错流问题。您可以继续测试其他 API 接口调用！`;

    case 'internet':
      return `根据您调用的 **[谷歌 SERP 互联网搜索增强]** 工具，实时抓取了目前互联网上对于 **DeepSeek-R1 满血版** 发布的学术和实践技术反馈，重点归整如下：

### 1. 核心极佳性能评价 (高热点)
*   **学术认命：** 各名校和LLM实验室高度赞扬 R1 的多轮连续深度推理机制（MCTS），在涉及极难离散数学、多行复杂算法补全、量子计算理论等静态基准测评中，直达 Sota 成绩。
*   **开源红利：** 其开源政策极大降低了本地化私有小数据模型的微调对齐成本。

### 2. 真实技术痛点与负面实践反馈
*   **首个 Token 延迟 (First Token Latency)：** 由于在生成正式回答时会开启超长的 reasoning chain（带标签的思维链过程），会造成首字吐出延迟较高（俗称“冷启动耗时”）。在要求即时响应的高频机器人客服对话中表现不够理想。
*   **高并发下的硬件开销：** 满血版在运行极致多维推理时对服务器显存矩阵负载要求巨大，云算力平台并发稍大时极易触发限流（Rate Limit）或显卡丢包。

您可以将这些痛点，放入您的调研白皮书中！`;

    case 'default':
    default:
      return `您好！我是智研 AI 助理。

我已经收到了您发送的信息。目前系统运行一切平稳，随时可以配合您做业务知识的调取及分析。
如果您想获得更精确和可追溯的回答，请确认您在顶部关联了相应的企业文档；如果想调取内部数据或推送信息，也可确保在**工具中心**内开启了相应的执行插件。

请问还有什么需要我帮您研究的吗？`;
  }
}
