import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle, Quote, Copy, Check, MessageSquare } from 'lucide-react';
import { summarizeTextStream } from '@/lib/minimax';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface TextSummaryProps {
  question: string;
  answers: string[];
  totalRespondents: number;
}

export const TextSummary: React.FC<TextSummaryProps> = ({ question, answers, totalRespondents }) => {
  const responseRate = totalRespondents > 0 ? ((answers.length / totalRespondents) * 100).toFixed(1) : '0.0';
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'summary' | 'raw'>('summary');
  const [prevAnswers, setPrevAnswers] = useState<string[]>(answers);
  const [prevTotal, setPrevTotal] = useState<number>(totalRespondents);

  // Reset state when answers or total respondents change (e.g., when filters are applied)
  useEffect(() => {
    const hasChanged = 
      totalRespondents !== prevTotal || 
      answers.length !== prevAnswers.length || 
      answers.some((a, i) => a !== prevAnswers[i]);
      
    if (hasChanged) {
      setSummary(null);
      setError(null);
      setLoading(false);
      setPrevAnswers(answers);
      setPrevTotal(totalRespondents);
    }
  }, [answers, prevAnswers, totalRespondents, prevTotal]);

  const handleSummarize = async () => {
    setLoading(true);
    setError(null);
    setSummary(''); // Clear previous summary and show the streaming area
    
    try {
      await summarizeTextStream(question, answers, (chunk) => {
        setSummary((prev) => (prev || '') + chunk);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "发生了未知错误。");
      if (!summary) setSummary(null); // If it failed before any text arrived, hide the summary area
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (summary) {
      try {
        await navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  return (
    <div className="modern-card p-8 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
        <Quote className="w-32 h-32 rotate-12" />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="space-y-1">
          <h3 className="text-lg font-display font-bold text-slate-800 leading-tight" title={question}>
            {question}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {answers.length} 条定性回答 ({responseRate}% 回答率)
            </span>
          </div>
        </div>
        
        {answers.length > 0 && (
          <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 ml-4">
            <button 
              onClick={() => setViewMode('summary')}
              className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5", viewMode === 'summary' ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI 总结
            </button>
            <button 
              onClick={() => setViewMode('raw')}
              className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5", viewMode === 'raw' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              原始反馈
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-[200px] relative z-10">
        {answers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm font-light italic">
              当前视图中没有可供分析的回答。
            </p>
          </div>
        ) : viewMode === 'raw' ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full overflow-y-auto custom-scrollbar space-y-3 pr-2"
          >
            {answers.slice(0, 10).map((ans, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
                {ans}
              </div>
            ))}
            {answers.length > 10 && (
              <div className="text-center text-xs text-slate-400 py-3 font-medium">
                仅显示前 10 条反馈
              </div>
            )}
          </motion.div>
        ) : (
          <>
            {summary === null && !loading && !error && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-violet-500" />
                </div>
                <p className="text-slate-500 font-light mb-6 max-w-xs">
                  使用 AI 将 {answers.length} 条独立回答综合成简洁、可操作的总结。
                </p>
                <button
                  onClick={handleSummarize}
                  className="btn-primary !bg-violet-600 hover:!bg-violet-700 flex items-center gap-2 shadow-lg shadow-violet-100"
                >
                  <Sparkles className="w-4 h-4" />
                  使用 MiniMax 分析
                </button>
              </div>
            )}

            {error && !summary && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <button
                  onClick={handleSummarize}
                  className="text-violet-600 text-sm font-bold uppercase tracking-widest hover:underline"
                >
                  重试分析
                </button>
              </div>
            )}

            {summary !== null && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-slate prose-sm max-w-none text-slate-600 bg-violet-50/30 p-6 rounded-2xl border border-violet-100 h-full overflow-y-auto custom-scrollbar relative group/summary"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-violet-700 font-bold text-[10px] uppercase tracking-[0.2em]">
                    <Sparkles className={cn("w-3 h-3", loading && "animate-pulse")} />
                    执行摘要 {loading && <span className="text-violet-400 normal-case tracking-normal ml-1">(生成中...)</span>}
                  </div>
                  {!loading && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/50 hover:bg-white text-violet-600 border border-violet-200/50 transition-all shadow-sm opacity-0 group-hover/summary:opacity-100 focus:opacity-100"
                      title="复制 Markdown"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">复制</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="font-light leading-relaxed">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                  {loading && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-violet-400 animate-pulse align-middle" />
                  )}
                </div>
              </motion.div>
            )}
            
            {error && summary && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>生成过程中断：{error}</span>
                <button onClick={handleSummarize} className="ml-auto text-xs font-bold underline hover:text-red-700">重试</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
