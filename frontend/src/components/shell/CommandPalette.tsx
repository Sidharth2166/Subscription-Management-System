import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import {
  Search,
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
  PlusCircle,
  ShieldCheck,
  Percent,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent can toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const runAction = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-card border border-glass-border-strong rounded-card shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_35px_rgba(85,255,118,0.2)] overflow-hidden z-10 backdrop-blur-2xl">
        <Command className="w-full">
          <div className="flex items-center px-4 border-b border-glass-border bg-surface/80">
            <Search className="w-4 h-4 text-neon mr-3 flex-shrink-0" />
            <Command.Input
              placeholder="Search actions, customers, invoices, or jump to page... (Ctrl+K)"
              className="w-full py-4 text-sm text-text-1 placeholder-text-3 outline-none bg-transparent"
              autoFocus
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-3 space-y-1 text-xs">
            <Command.Empty className="py-6 text-center text-text-3">
              No results found for your query.
            </Command.Empty>

            <Command.Group heading="QUICK JUMP" className="text-[10px] font-bold text-text-3 uppercase tracking-wider px-2 py-1">
              <Command.Item
                onSelect={() => runAction('/dashboard')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-2 hover:text-white hover:bg-surface/80 hover:border hover:border-glass-border cursor-pointer transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-neon" />
                <span>Executive Overview</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runAction('/customers')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-2 hover:text-white hover:bg-surface/80 cursor-pointer transition-colors"
              >
                <Users className="w-4 h-4 text-neon" />
                <span>Customer Ledger</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runAction('/products')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-2 hover:text-white hover:bg-surface/80 cursor-pointer transition-colors"
              >
                <Package className="w-4 h-4 text-neon" />
                <span>Products & Plans</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runAction('/subscriptions')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-2 hover:text-white hover:bg-surface/80 cursor-pointer transition-colors"
              >
                <Repeat className="w-4 h-4 text-neon" />
                <span>Subscriptions Lifecycle</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runAction('/invoices')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-2 hover:text-white hover:bg-surface/80 cursor-pointer transition-colors"
              >
                <Receipt className="w-4 h-4 text-neon" />
                <span>Invoices & Billing</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runAction('/rescue')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-2 hover:text-white hover:bg-surface/80 cursor-pointer transition-colors"
              >
                <Zap className="w-4 h-4 text-neon" />
                <span>Revenue Rescue Engine</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runAction('/copilot')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-2 hover:text-white hover:bg-surface/80 cursor-pointer transition-colors"
              >
                <Bot className="w-4 h-4 text-neon" />
                <span>AI Business Copilot</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="INSTANT ACTIONS" className="text-[10px] font-bold text-text-3 uppercase tracking-wider px-2 py-1 mt-2">
              <Command.Item
                onSelect={() => runAction('/quotations/new')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-2 hover:text-white hover:bg-surface/80 cursor-pointer transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-neon" />
                <span>Create New Quotation</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runAction('/customers/new')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-2 hover:text-white hover:bg-surface/80 cursor-pointer transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-neon" />
                <span>Add Customer Account</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runAction('/settings')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-2 hover:text-white hover:bg-surface/80 cursor-pointer transition-colors"
              >
                <Settings className="w-4 h-4 text-neon" />
                <span>Settings & Demo Tools</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between px-4 py-2 border-t border-glass-border/60 bg-surface/50 text-[11px] text-text-3">
            <span>Navigation: Use arrow keys & Enter</span>
            <span className="font-mono">ESC to close</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
