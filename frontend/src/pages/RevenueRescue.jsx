import React, { useEffect, useState } from 'react';

export default function RevenueRescue() {
  const [metrics, setMetrics] = useState({ mrr: 0, activeSubscriptions: 0, totalOutstanding: 0 });
  const [queue, setQueue] = useState([]);
  const [guardianError, setGuardianError] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/api/analytics/dashboard')
      .then(res => res.json())
      .then(data => setMetrics(data));

    fetch('http://localhost:5000/api/rescue/queue')
      .then(res => res.json())
      .then(data => setQueue(data));
  }, []);

  // Trigger Smart Billing Guardian Test[cite: 7, 10]
  const triggerDuplicateBillingTest = () => {
    fetch('http://localhost:5000/api/invoices/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subId: 1, period: '2026-10', amount: 1060 }) // Already exists![cite: 7, 10]
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        setGuardianError(data.error); // Display Billing Guardian Flag![cite: 7]
      }
    });
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-800 font-sans">[cite: 8]
      {/* Top Navbar Header */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-indigo-950">SubFlow Revenue Control</h1>[cite: 5, 8]
          <p className="text-slate-500 text-sm">Real-time subscription & billing intelligence</p>[cite: 5]
        </div>
        <button 
          onClick={triggerDuplicateBillingTest}
          className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2 rounded-lg shadow transition">
          Test Smart Billing Guardian 🛡️[cite: 7]
        </button>
      </header>

      {/* Smart Billing Guardian Warning Banner */}
      {guardianError && (
        <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-lg shadow-sm">
          <h3 className="font-bold text-rose-800">🛡️ Smart Billing Guardian Intercepted Action</h3>[cite: 7]
          <p className="text-rose-700 text-sm">{guardianError}</p>[cite: 7]
        </div>
      )}

      {/* Business Pulse Metrics */}[cite: 8, 9]
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs uppercase text-slate-400 font-bold">Monthly Recurring Revenue (MRR)</p>[cite: 7, 8, 9]
          <p className="text-3xl font-extrabold text-indigo-900 mt-2">${metrics.mrr}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs uppercase text-slate-400 font-bold">Active Subscriptions</p>[cite: 7, 8, 9]
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">{metrics.activeSubscriptions}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs uppercase text-slate-400 font-bold">Outstanding At Risk Revenue</p>[cite: 7, 8, 9]
          <p className="text-3xl font-extrabold text-rose-600 mt-2">${metrics.totalOutstanding}</p>
        </div>
      </div>

      {/* Revenue Rescue Action Queue */}[cite: 7, 9]
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>⚡ Revenue Rescue Engine Queue</span>[cite: 7]
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-semibold">{queue.length} Action Items</span>
        </h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase">
              <th className="py-3">Invoice</th>
              <th className="py-3">Customer</th>
              <th className="py-3">Amount</th>
              <th className="py-3">Risk Reason</th>[cite: 7]
              <th className="py-3">Urgency</th>[cite: 7]
              <th className="py-3">Suggested Action</th>[cite: 7]
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {queue.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition">
                <td className="py-3 font-semibold text-indigo-900">{item.id}</td>
                <td className="py-3 text-slate-700">{item.customer}</td>
                <td className="py-3 font-bold">${item.amount}</td>
                <td className="py-3 text-rose-600 font-medium">{item.reason}</td>[cite: 7]
                <td className="py-3"><span className="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded font-bold">{item.urgency}</span></td>[cite: 7]
                <td className="py-3">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded font-medium shadow-sm">
                    {item.suggestedAction}[cite: 7]
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}