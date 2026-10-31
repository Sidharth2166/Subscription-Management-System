import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { StatusChip } from '../components/ui/StatusChip';
import { formatINR } from '../utils/format';
import { api } from '../api/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  structuredData?: any;
  timestamp: string;
}

export const CopilotPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Welcome to the SubFlow Revenue Copilot. I analyze your live SQLite/PostgreSQL billing ledger in real-time. What business intelligence would you like to explore today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(`session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await api.queryCopilot(text, sessionId);
      const asstMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        structuredData: res.structured_data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, asstMsg]);
    } catch {
      const err: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: "I encountered an error querying the database. Please verify backend service status.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, err]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setSessionId(`session_${Date.now()}`);
    setMessages([
      {
        id: 'welcome_new',
        role: 'assistant',
        content: "New chat session started. Ready to query live revenue data.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const sampleQuestions = [
    "How much is overdue?",
    "Which customers have repeated payment failures?",
    "Revenue this month vs last month",
    "Subscriptions expiring next week",
    "Top plans by recurring revenue",
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col select-none">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between pb-3 border-b border-glass-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface border border-green-500/40 flex items-center justify-center text-neon shadow-[0_0_18px_rgba(85,255,118,0.25)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white font-display">SubFlow AI Copilot</h1>
            <p className="text-xs text-neon flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
              <span>Safe, parameterized queries over live database</span>
            </p>
          </div>
        </div>

        <GlowButton variant="secondary" size="sm" onClick={startNewChat}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          New Chat
        </GlowButton>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-shrink-0">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-full bg-card hover:bg-surface border border-glass-border hover:border-neon/40 text-xs text-text-2 hover:text-white whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-neon" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <GlassCard className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl space-y-3 ${
                m.role === 'user'
                  ? 'bg-surface border border-glass-border text-white'
                  : 'bg-card border border-green-500/30 text-text-1 shadow-[0_0_20px_rgba(85,255,118,0.08)]'
              }`}
            >
              <div className="flex items-center justify-between pb-1 border-b border-glass-border/40 text-[10px] text-text-3">
                <span className="font-bold uppercase text-neon">
                  {m.role === 'user' ? 'You' : 'Revenue Intelligence'}
                </span>
                <span>{m.timestamp}</span>
              </div>

              <div className="leading-relaxed whitespace-pre-wrap text-sm">{m.content}</div>

              {/* Rich Structured Data: Tables, Metric Cards */}
              {m.structuredData && (
                <div className="mt-2 space-y-2 pt-2 border-t border-glass-border/60">
                  {m.structuredData.type === 'metric_card' && m.structuredData.metric && (
                    <div className="p-4 rounded-xl bg-surface border border-glass-border flex items-baseline justify-between">
                      <span className="text-xs text-text-3 uppercase font-semibold">{m.structuredData.metric.label}</span>
                      <span className="text-2xl font-extrabold text-neon tabular-nums">{m.structuredData.metric.value}</span>
                    </div>
                  )}

                  {m.structuredData.table && (
                    <div className="rounded-xl border border-glass-border overflow-hidden bg-surface/60">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-card text-text-3 text-[10px] uppercase border-b border-glass-border">
                          <tr>
                            {m.structuredData.table.columns.map((col: string, idx: number) => (
                              <th key={idx} className="p-2.5 font-bold">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border/40">
                          {m.structuredData.table.rows.map((row: any, rIdx: number) => (
                            <tr key={rIdx}>
                              {Object.values(row).map((val: any, cIdx: number) => (
                                <td key={cIdx} className="p-2.5 font-medium">
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

              {/* Actions Footer on Assistant Messages */}
              {m.role === 'assistant' && (
                <div className="flex items-center justify-end gap-3 pt-1 text-text-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(m.content)}
                    className="hover:text-neon transition-colors p-1"
                    title="Copy response"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button className="hover:text-neon transition-colors p-1" title="Helpful">
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button className="hover:text-danger transition-colors p-1" title="Not helpful">
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="p-4 rounded-2xl bg-card border border-green-500/30 flex items-center gap-3 text-text-3 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-neon" />
              <span>Analyzing live database and aggregating financial metrics...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </GlassCard>

      {/* Input Bar */}
      <div className="flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3 p-2 bg-surface/90 border border-glass-border rounded-2xl backdrop-blur-md"
        >
          <input
            type="text"
            placeholder="Ask anything about MRR, customers, invoices, or payment retries..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent px-4 py-2.5 text-xs text-white placeholder-text-3 outline-none"
          />
          <GlowButton type="submit" variant="primary" size="sm" disabled={!inputValue.trim() || isLoading}>
            <Send className="w-3.5 h-3.5 mr-1" />
            Ask Copilot
          </GlowButton>
        </form>
      </div>
    </div>
  );
};
