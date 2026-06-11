import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Terminal, 
  Cpu, 
  Database, 
  CloudRain, 
  Play, 
  CheckCircle2,
  BrainCircuit,
  Settings,
  Clock
} from 'lucide-react';
import { ThoughtStep } from '../types';

interface ThoughtProcessProps {
  thoughtStep: ThoughtStep;
}

export default function ThoughtProcess({ thoughtStep }: ThoughtProcessProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getBadgeStyles = () => {
    switch (thoughtStep.state) {
      case 'thinking':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-600',
          dot: 'bg-amber-500',
          label: 'AGENT 串行思考中...',
          textColor: 'text-amber-700'
        };
      case 'calling':
        return {
          bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600',
          dot: 'bg-indigo-500',
          label: '正在请求外部插件/工具...',
          textColor: 'text-indigo-700'
        };
      case 'success':
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600',
          dot: 'bg-emerald-500',
          label: '推理已完毕，知识整合就绪',
          textColor: 'text-emerald-700'
        };
    }
  };

  const styles = getBadgeStyles();

  return (
    <div id="thought-process-container" className="mb-4 border border-amber-200/60 rounded-xl bg-amber-50/50 shadow-3xs overflow-hidden transition-all max-w-2xl text-xs text-amber-800">
      {/* Interactive Toggle Bar */}
      <button
        id="toggle-thought-btn"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 bg-amber-50/80 hover:bg-amber-100/60 transition-colors border-b border-amber-200/55 cursor-pointer text-amber-900"
      >
        <div className="flex items-center space-x-2.5">
          <BrainCircuit className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-bold font-sans tracking-wide">多维推理链 & 意图拆解 (Thinking Process)</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border ${styles.bg} font-sans`}>
            <span className={`h-1 w-1 rounded-full ${styles.dot} mr-1 animate-pulse`} />
            {styles.label}
          </span>
        </div>
        <div className="flex items-center text-amber-600/70">
          <span className="mr-2 text-[9px] sm:inline hidden font-sans">{isExpanded ? '折叠' : '展开'}</span>
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Structured Thought Process Panels */}
      {isExpanded && (
        <div id="thought-steps-body" className="p-4 space-y-3.5 bg-white/40 text-xs divide-y divide-amber-100/60 divide-dashed">
          
          {/* Step 1: Mind Thought (思考) */}
          <div className="flex space-x-3.5" id="thought-part-mind">
            <div className="flex flex-col items-center">
              <div className="p-1 px-1 rounded-lg bg-amber-50 text-amber-500 border border-amber-100">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div className="w-0.5 flex-1 bg-gray-100 mt-2" />
            </div>
            <div className="flex-1 pb-1">
              <h4 className="font-bold text-amber-600 font-sans tracking-wide">1. 状态评测与意图拆解 (Thought)</h4>
              <p className="mt-1.5 text-gray-600 leading-relaxed font-sans whitespace-pre-wrap translate-y-0 text-[11px]">
                {thoughtStep.thought}
              </p>
            </div>
          </div>

          {/* Step 2: Tool Action (调用) */}
          <div className="flex space-x-3.5 pt-3.5" id="thought-part-action">
            <div className="flex flex-col items-center">
              <div className="p-1 px-1 rounded-lg bg-indigo-50 text-indigo-500 border border-indigo-100">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <div className="w-0.5 flex-1 bg-gray-100 mt-2" />
            </div>
            <div className="flex-1 pb-1">
              <h4 className="font-bold text-indigo-600 font-sans tracking-wide">2. 触发工具调用与参数装载 (Action)</h4>
              <div className="mt-1.5 rounded-lg bg-slate-900 p-2.5 text-[11px] font-mono text-slate-300 border border-slate-800 leading-relaxed break-all">
                {thoughtStep.action}
              </div>
            </div>
          </div>

          {/* Step 3: Observation Feedback (观测) */}
          <div className="flex space-x-3.5 pt-3.5" id="thought-part-obs">
            <div className="flex flex-col items-center">
              <div className="p-1 px-1 rounded-lg bg-emerald-50 text-emerald-500 border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-emerald-600 font-sans tracking-wide">3. 工具执行完毕与关联返回 (Observation)</h4>
              <p className="mt-1.5 text-gray-600 leading-relaxed font-sans whitespace-pre-wrap text-[11px]">
                {thoughtStep.observation}
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
