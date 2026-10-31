import React, { useState } from 'react';

export default function CopilotWidget() {
  const [query, setQuery] = useState("");
  const [chatLog, setChatLog] = useState([
    { sender: "ai", text: "Hello! I am your SubFlow AI Business Copilot. Ask me about your live revenue, overdue invoices, or renewals!" }[cite: 7, 8]
  ]);

  const handleAsk = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setChatLog(prev => [...prev, { sender: "user", text: userText }]);
    setQuery("");

    // Simulate Live Data Grounded Query Parsing[cite: 7, 8]
    setTimeout(async () => {
      let aiResponse = "";
      const lower = userText.toLowerCase();

      if (lower.includes("overdue") || lower.includes("outstanding")) {[cite: 8]
        const res = await fetch('http://localhost:5000/api/analytics/dashboard');
        const data = await res.json();
        aiResponse = `Based on live data, you currently have ${data.overdueCount} overdue invoice(s) totaling $${data.totalOutstanding}.`;[cite: 8]
      } else if (lower.includes("mrr") || lower.includes("revenue")) {[cite: 8]
        const res = await fetch('http://localhost:5000/api/analytics/dashboard');
        const data = await res.json();
        aiResponse = `Your current Monthly Recurring Revenue (MRR) stands at $${data.mrr} across ${data.activeSubscriptions} active subscriptions.`;[cite: 8]
      } else {
        aiResponse = "I can analyze live application data! Try asking: 'How much is currently outstanding?' or 'Which invoices are overdue?'";[cite: 8]
      }

      setChatLog(prev => [...prev, { sender: "ai", text: aiResponse }]);
    }, 400);
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-50">
      {/* Header */}
      <div className="bg-indigo-950 p-4 text-white flex justify-between items-center">[cite: 8]
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
          <h3 className="font-bold text-sm">SubFlow AI Business Copilot</h3>[cite: 7, 8]
        </div>
      </div>

      {/* Chat History */}
      <div className="p-4 h-72 overflow-y-auto space-y-3 bg-slate-50 text-xs">
        {chatLog.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-xl max-w-[85%] ${
              msg.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleAsk} className="p-3 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask AI about live revenue..."[cite: 8]
          className="flex-1 bg-slate-100 text-slate-800 px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className="bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg font-bold">
          Send
        </button>
      </form>
    </div>
  );
}