import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Repeat,
  Receipt,
  CreditCard,
  Zap,
  BarChart3,
  Bot,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  ShieldCheck,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CommandPalette } from './CommandPalette';
import { FloatingCopilot } from './FloatingCopilot';
import { StatusChip } from '../ui/StatusChip';
import { api } from '../../api/client';

export const AppShell: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('subflow_sidebar_collapsed') === 'true';
  });
  const [cmdOpen, setCmdOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  useEffect(() => {
    localStorage.setItem('subflow_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  // Load unread count
  useEffect(() => {
    api.getNotifications()
      .then((data) => {
        const unread = data.filter((n: any) => !n.is_read).length;
        setUnreadNotifications(unread);
      })
      .catch(() => {});
  }, [location.pathname]);

  const isCustomer = user?.role === 'customer';

  const navItems = isCustomer
    ? [
        { label: 'Portal Home', path: '/portal', icon: LayoutDashboard },
        { label: 'My Subscriptions', path: '/portal/subscriptions', icon: Repeat },
        { label: 'My Invoices', path: '/portal/invoices', icon: Receipt },
        { label: 'My Payments', path: '/portal/payments', icon: CreditCard },
        { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifications },
      ]
    : [
        { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Customers', path: '/customers', icon: Users },
        { label: 'Products & Plans', path: '/products', icon: Package },
        { label: 'Quotations', path: '/quotations', icon: FileText },
        { label: 'Subscriptions', path: '/subscriptions', icon: Repeat },
        { label: 'Invoices', path: '/invoices', icon: Receipt },
        { label: 'Payments', path: '/payments', icon: CreditCard },
        { label: 'Revenue Rescue', path: '/rescue', icon: Zap, highlight: true },
        { label: 'AI Copilot', path: '/copilot', icon: Bot },
        { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifications },
        { label: 'Settings & Demo', path: '/settings', icon: Settings },
      ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg-0 text-text-1 flex relative overflow-x-hidden">
      {/* Background Aurora */}
      <div className="aurora-bg">
        <div className="aurora-blob-1 opacity-70" />
        <div className="aurora-blob-2 opacity-50" />
        <div className="grid-floor opacity-40" />
      </div>
      <div className="film-grain" />

      {/* Command Palette */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Floating Copilot Orb & Drawer */}
      <FloatingCopilot />

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 ease-in-out border-r border-glass-border/70 bg-bg-1/90 backdrop-blur-xl flex flex-col justify-between ${
          isCollapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {/* Top Branding & Toggle */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-glass-border/60">
            <Link to="/" className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-surface border border-green-500/40 flex items-center justify-center text-neon flex-shrink-0 shadow-[0_0_15px_rgba(85,255,118,0.25)]">
                <svg viewBox="0 0 100 100" className="w-5 h-5">
                  <path
                    d="M 68 22 C 78 22, 82 32, 74 42 L 34 76 C 26 82, 18 78, 18 68 C 18 56, 32 46, 52 38 L 74 29"
                    fill="none"
                    stroke="#55FF76"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              {!isCollapsed && (
                <span className="font-display font-extrabold text-lg text-white tracking-tight whitespace-nowrap">
                  Sub<span className="neon-text">Flow</span>
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-text-3 hover:text-white hover:bg-surface transition-colors cursor-pointer"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)]">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && item.path !== '/portal' && location.pathname.startsWith(item.path));
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold select-none transition-colors duration-200 group ${
                    isActive
                      ? 'text-black font-bold'
                      : item.highlight
                      ? 'text-neon hover:text-white hover:bg-surface/50'
                      : 'text-text-2 hover:text-white hover:bg-surface/50'
                  }`}
                >
                  {/* Sliding layoutId Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-green-500 to-lime-glow rounded-xl shadow-[0_0_18px_rgba(85,255,118,0.5)] z-0"
                      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
                    />
                  )}

                  <Icon
                    className={`w-4 h-4 flex-shrink-0 relative z-10 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-black' : item.highlight ? 'text-neon' : 'text-text-3 group-hover:text-neon'
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="relative z-10 whitespace-nowrap flex-1">{item.label}</span>
                  )}

                  {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-black/20 text-black' : 'bg-neon/20 text-neon border border-neon/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Role Chip */}
        <div className="p-3 border-t border-glass-border/60">
          <div
            className={`p-2 rounded-xl bg-surface/60 border border-glass-border flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-card border border-neon/40 flex items-center justify-center text-neon font-bold text-xs flex-shrink-0">
                {user?.name?.[0] || 'M'}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{user?.name || 'Meenakshi Iyer'}</div>
                  <div className="text-[10px] text-neon capitalize">{user?.role || 'Admin'}</div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-text-3 hover:text-danger hover:bg-card rounded-lg transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        }`}
      >
        {/* TOP BAR */}
        <header className="h-16 border-b border-glass-border/70 bg-bg-1/70 backdrop-blur-xl sticky top-0 z-20 px-6 flex items-center justify-between">
          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white capitalize">
              {location.pathname.replace(/^\//, '').replace(/\//g, ' > ') || 'Dashboard'}
            </h2>
            <span className="hidden sm:inline-block text-xs text-text-3">• Live Financial Ledger</span>
          </div>

          {/* Top Actions: Search, Quick +, Notifications */}
          <div className="flex items-center gap-3">
            {/* Global Search trigger */}
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-glass-border text-xs text-text-3 hover:text-white hover:border-neon/40 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-neon" />
              <span className="hidden md:inline">Quick command...</span>
              <kbd className="hidden md:inline text-[10px] font-mono bg-card px-1.5 py-0.5 rounded border border-glass-border">Ctrl+K</kbd>
            </button>

            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl bg-surface border border-glass-border text-text-2 hover:text-white hover:border-neon/40 transition-colors"
              aria-label="Notification Centre"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon animate-pulse shadow-[0_0_8px_#55FF76]" />
              )}
            </Link>

            {/* Quick Action Button */}
            <button
              onClick={() => navigate('/quotations')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon/15 border border-neon/40 text-xs font-semibold text-neon hover:bg-neon/25 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Quote</span>
            </button>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-6 md:p-8 max-w-[1440px] w-full mx-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
