import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  HelpCircle,
  FileSpreadsheet,
  Link,
  ChevronRight
} from 'lucide-react';
import { Message, Citation } from '../types';
import ThoughtProcess from './ThoughtProcess';

interface ChatMessageProps {
  key?: string;
  message: Message;
  isGenerating?: boolean;
}

export default function ChatMessage({ message, isGenerating }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [hoveredCitationIndex, setHoveredCitationIndex] = useState<number | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to parse text with inline formatting, blockquotes, headings, lists and [N] citation badges
  const parseMarkdownAndCitations = (text: string) => {
    if (!text && isGenerating) {
      return (
        <span className="text-gray-400 italic flex items-center space-x-1.5">
          <span className="cursor-blink" />
          <span>正在编译内容中...</span>
        </span>
      );
    }

    const lines = text.split('\n');
    let inList = false;
    let listType: 'ul' | 'ol' | null = null;

    return lines.map((line, lineIdx) => {
      // Check head elements
      if (line.startsWith('### ')) {
        return <h3 key={lineIdx} className="text-sm font-bold text-gray-800 mt-3 mb-1.5 font-sans flex items-center"><ChevronRight className="w-3.5 h-3.5 text-amber-500 mr-1" />{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={lineIdx} className="text-base font-bold text-gray-900 mt-4 mb-2 border-b border-gray-100 pb-1 font-sans">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={lineIdx} className="text-lg font-bold text-gray-900 mt-5 mb-2.5 font-sans">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('> ')) {
        return <blockquote key={lineIdx} className="border-l-4 border-gray-200 pl-3 italic text-gray-500 my-2.5 text-xs bg-gray-50 py-1 rounded-r-lg font-sans">{line.replace('> ', '')}</blockquote>;
      }

      // Check bullet list items
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const itemText = line.trim().substring(2);
        return (
          <li key={lineIdx} className="ml-4 list-disc text-xs text-gray-600 mb-1 leading-relaxed font-sans">
            {renderInlineSpans(itemText)}
          </li>
        );
      }

      // Check ordered list items
      const orderedMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (orderedMatch) {
        const itemText = orderedMatch[2];
        return (
          <li key={lineIdx} className="ml-4 list-decimal text-xs text-gray-600 mb-1 leading-relaxed font-sans">
            {renderInlineSpans(itemText)}
          </li>
        );
      }

      // Default paragraph
      if (line.trim() === '') {
        return <div key={lineIdx} className="h-2" />;
      }

      return (
        <p key={lineIdx} className="text-xs text-gray-600 leading-relaxed mb-2 font-sans">
          {renderInlineSpans(line)}
        </p>
      );
    });
  };

  // Helper parsing bolding (**text**), inline code (`code`), and [N] badges
  const renderInlineSpans = (text: string) => {
    const parts: React.ReactNode[] = [];
    let currentText = text;

    // We search sequentially for bolding, inline code, and citation brackets [1], [2]
    // Let's first parse with regex for general simplicity
    // Pattern to capture citations like [1], [2] OR bolding **text** OR code \`code\`
    const regex = /(\*\*.*?\*\*|`.*?`|\[\d+\])/g;
    const splitParts = currentText.split(regex);

    return splitParts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-gray-800">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="bg-gray-100 text-gray-800 font-mono text-[10px] px-1.5 py-0.5 rounded border border-gray-200">{part.slice(1, -1)}</code>;
      }
      
      // Citations detection e.g. [1]
      const citationMatch = part.match(/^\[(\d+)\]$/);
      if (citationMatch && message.citations) {
        const citationIndex = parseInt(citationMatch[1], 10);
        const relatedCitation = message.citations.find(c => c.index === citationIndex);

        if (relatedCitation) {
          return (
            <span
              key={index}
              id={`citation-badge-${message.id}-${citationIndex}`}
              className="relative inline-block mx-0.5"
              onMouseEnter={() => setHoveredCitationIndex(citationIndex)}
              onMouseLeave={() => setHoveredCitationIndex(null)}
            >
              <button
                type="button"
                className="inline-flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20 rounded-full h-4.5 min-w-4.5 px-1 text-[9px] font-bold font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500/30 cursor-help"
              >
                {citationIndex}
              </button>

              {/* Hover Tooltip Citation Block */}
              {hoveredCitationIndex === citationIndex && (
                <div 
                  id={`citation-tooltip-${message.id}-${citationIndex}`}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-900 border border-slate-800 text-slate-100 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 pointer-events-none"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-[10px] font-bold text-slate-200 truncate font-sans">
                        {relatedCitation.sourceDocName}
                      </span>
                    </div>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded-full font-mono">
                      切片 #{citationIndex}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-normal font-sans italic line-clamp-4 select-none">
                    “{relatedCitation.chunkText}”
                  </p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                </div>
              )}
            </span>
          );
        }
      }

      return part;
    });
  };

  const isAssistant = message.role === 'assistant';

  if (!isAssistant) {
    return (
      <div 
        id={`message-${message.id}`}
        className="flex flex-col items-end space-y-1.5 my-3"
      >
        <div className="flex items-center space-x-1.5 text-[10px] text-gray-400 font-mono pr-1">
          <span className="font-sans font-bold text-gray-500">企业伙伴 (chenjiechun73)</span>
          <span>•</span>
          <span>{message.timestamp}</span>
        </div>
        <div className="bg-gradient-to-tr from-amber-500 to-orange-500 text-white p-4 rounded-2xl rounded-tr-none max-w-xl text-xs sm:text-sm shadow-md font-sans leading-relaxed selection:bg-orange-650 selection:text-white">
          {message.content}
        </div>
        
        <div className="pr-1 flex items-center space-x-2">
          <button
            id={`copy-msg-btn-${message.id}`}
            onClick={handleCopy}
            className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center space-x-1 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600 font-sans">已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="font-sans">复制</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`message-${message.id}`}
      className="flex items-start space-x-4 p-2 sm:p-4 rounded-2xl transition-all bg-transparent"
    >
      {/* Avatar column */}
      <div className="shrink-0">
        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shrink-0 shadow-xs border border-slate-800">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
        </div>
      </div>

      {/* Main Content column */}
      <div className="flex-1 min-w-0">
        {/* AI signature */}
        <div className="flex items-center space-x-2 mb-1.5">
          <span className="text-xs font-bold text-gray-900 font-sans">
            智研 AI Agent
          </span>
          <span className="text-[9px] text-gray-400 font-mono">
            {message.timestamp}
          </span>
        </div>

        {/* Render collaspsible Thought Steps for AI responses first if present */}
        {message.thoughtStep && (
          <ThoughtProcess thoughtStep={message.thoughtStep} />
        )}

        {/* Text Area */}
        <div className="markdown-body transition-all relative text-slate-800 text-xs sm:text-sm leading-relaxed max-w-2xl">
          {parseMarkdownAndCitations(message.content)}
          
          {/* Pulsating typing cursor if text is generating */}
          {message.isStreaming && (
            <span className="cursor-blink text-amber-600 inline-block align-middle ml-1" />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center space-x-3 mt-3 border-t border-slate-100 pt-2 text-[10px] text-gray-400">
          <button
            id={`copy-msg-btn-${message.id}`}
            onClick={handleCopy}
            className="inline-flex items-center space-x-1 hover:text-gray-700 transition-colors cursor-pointer"
            title="复制文本"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-sans">已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="font-sans">复制内容</span>
              </>
            )}
          </button>

          {message.citations && message.citations.length > 0 && (
            <div className="flex items-center space-x-1.5 shrink-0" id="message-citation-summary">
              <span className="font-sans text-gray-400 border-l border-gray-200 pl-3">检索文档引用:</span>
              <div className="flex items-center space-x-1">
                {message.citations.map((cit) => (
                  <span 
                    key={cit.id}
                    className="inline-flex items-center px-1.5 py-0.5 text-[8px] bg-slate-200 text-slate-600 hover:bg-slate-300 rounded font-bold font-sans cursor-pointer transition-colors"
                  >
                    [{cit.index}] {cit.sourceDocName.split('(')[0]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
