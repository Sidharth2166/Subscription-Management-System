import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Loader2, ArrowUpRight } from 'lucide-react';
import { api } from '../../api/client';
import { StatusChip } from '../ui/StatusChip';
import { formatINR } from '../../utils/format';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  structuredData?: any;
  timestamp: string;
}

export const FloatingCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your SubFlow Revenue Copilot. Ask me about overdue invoices, payment failures, MRR growth, or upcoming renewals.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await api.queryCopilot(text);
      const asstMsg: Message = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        structuredData: res.structured_data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, asstMsg]);
    } catch {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I couldn't reach the revenue engine right now. Please verify backend connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQueries = [
    "How much is overdue?",
    "Which accounts failed payments?",
    "Revenue this month vs last month",
    "Subscriptions expiring next week",
  ];

  return (
    <>
      {/* Floating Orb Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-green-500 via-neon to-lime-glow text-black shadow-[0_0_30px_rgba(85,255,118,0.55)] flex items-center justify-center cursor-pointer border-2 border-white/30 backdrop-blur-md"
        aria-label="Open SubFlow Copilot"
      >
        <Bot className="w-7 h-7 fill-current" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white animate-ping" />
      </motion.button>

      {/* Floating Chat Drawer Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-md h-[560px] bg-card/95 border border-glass-border-strong rounded-hero shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_35px_rgba(85,255,118,0.2)] backdrop-blur-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-glass-border bg-surface/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-card border border-green-500/40 flex items-center justify-center text-neon shadow-[0_0_12px_rgba(85,255,118,0.25)]">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs tracking-tight">SubFlow Copilot</h4>
                  <p className="text-[10px] text-neon flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
                    <span>Real-time Financial BI</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-text-3 hover:text-white hover:bg-surface transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl ${
                      m.role === 'user'
                        ? 'bg-surface border border-glass-border text-white'
                        : 'bg-card border border-green-500/30 text-text-1 shadow-[0_0_15px_rgba(85,255,118,0.08)]'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>

                    {/* Rich Structured Data Rendering */}
                    {m.structuredData && (
                      <div className="mt-3 pt-2.5 border-t border-glass-border space-y-2">
                        {m.structuredData.type === 'metric_and_table' && (
                          <div className="p-2.5 rounded-xl bg-surface/80 border border-glass-border">
                            <div className="text-[10px] text-text-3 uppercase">{m.structuredData.metric.label}</div>
                            <div className="text-lg font-bold text-neon tabular-nums">{m.structuredData.metric.value}</div>
                          </div>
                        )}

                        {m.structuredData.table && (
                          <div className="rounded-lg bg-surface/60 border border-glass-border overflow-x-auto">
                            <table className="w-full text-[11px] text-left">
                              <thead className="text-[9px] uppercase tracking-wider text-text-3 border-b border-glass-border bg-card/60">
                                <tr>
                                  {m.structuredData.table.columns.map((col: string, idx: number) => (
                                    <th key={idx} className="p-1.5">{col}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {m.structuredData.table.rows.map((row: any, rIdx: number) => (
                                  <tr key={rIdx} className="border-b border-glass-border/40">
                                    {Object.values(row).map((val: any, cIdx: number) => (
                                      <td key={cIdx} className="p-1.5 font-medium">
                                        {typeof val === 'number' ? formatINR(val) : String(val)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    <span className="block text-[9px] text-text-3 mt-1.5 text-right">{m.timestamp}</span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-card border border-green-500/30 flex items-center gap-2 text-text-3 text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-neon" />
                    <span>Querying revenue ledger...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Question Chips */}
            <div className="px-3 py-2 border-t border-glass-border/60 bg-surface/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {suggestedQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 rounded-full bg-card hover:bg-surface border border-glass-border hover:border-neon/40 text-[10px] text-text-2 hover:text-white whitespace-nowrap transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-glass-border bg-surface/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask your financial data..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-card border border-glass-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-text-3 outline-none focus:border-neon transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2 rounded-xl bg-neon text-black font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-lime-glow transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
