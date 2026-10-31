import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Filter, AlertTriangle, ShieldCheck, RefreshCw, Receipt } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { StatusChip } from '../components/ui/StatusChip';
import { formatDateTime } from '../utils/format';
import { api } from '../api/client';

export const NotificationCentrePage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = () => {
    setIsLoading(true);
    api.getNotifications()
      .then((data) => {
        setNotifications(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    fetchNotifs();
  };

  const handleMarkRead = async (id: number) => {
    await api.markNotificationRead(id);
    fetchNotifs();
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.is_read;
    return n.category === filter;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-text block mb-1">AUDIT & EVENT STREAM</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Notification Centre
          </h1>
          <p className="text-xs text-text-3">
            Real-time feed of billing cycles, payment failures, retry attempts, and guardian warnings.
          </p>
        </div>

        <GlowButton variant="secondary" size="sm" onClick={handleMarkAllRead}>
          <CheckCheck className="w-3.5 h-3.5 mr-1" />
          Mark All Read
        </GlowButton>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        {['all', 'unread', 'failed_payment', 'retry', 'renewal', 'invoice', 'guardian'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full capitalize font-semibold transition-colors cursor-pointer border ${
              filter === f
                ? 'bg-neon/20 border-neon text-neon shadow-[0_0_12px_rgba(85,255,118,0.25)]'
                : 'bg-surface border-glass-border text-text-3 hover:text-white'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Notification Items List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-text-3">Loading event feed...</div>
        ) : filteredNotifs.length === 0 ? (
          <GlassCard className="py-12 text-center text-xs text-text-3">
            No notifications found in this category.
          </GlassCard>
        ) : (
          filteredNotifs.map((n) => (
            <GlassCard
              key={n.id}
              variant={!n.is_read ? 'spotlight' : 'subtle'}
              className={`p-4 flex items-start gap-4 transition-all ${
                !n.is_read ? 'border-neon/40' : 'opacity-80'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  n.category === 'failed_payment'
                    ? 'bg-danger/15 text-danger border border-danger/30'
                    : n.category === 'retry'
                    ? 'bg-warning/15 text-warning border border-warning/30'
                    : n.category === 'guardian'
                    ? 'bg-green-500/15 text-neon border border-green-500/30'
                    : 'bg-surface text-neon border border-glass-border'
                }`}
              >
                {n.category === 'failed_payment' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : n.category === 'retry' ? (
                  <RefreshCw className="w-4 h-4" />
                ) : n.category === 'guardian' ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <Receipt className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{n.title}</span>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                    )}
                  </h4>
                  <span className="text-[10px] text-text-3">{formatDateTime(n.created_at)}</span>
                </div>
                <p className="text-xs text-text-2 mt-1 leading-relaxed">{n.message}</p>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="text-[10px] text-text-3 hover:text-neon whitespace-nowrap self-center"
                >
                  Mark read
                </button>
              )}
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};
