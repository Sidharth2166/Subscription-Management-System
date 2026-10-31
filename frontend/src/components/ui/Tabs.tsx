import React from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'pill' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'pill',
}) => {
  return (
    <div
      className={`inline-flex items-center p-1 bg-surface/90 border border-glass-border rounded-full backdrop-blur-md ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 select-none flex items-center gap-2 cursor-pointer ${
              isActive ? 'text-black z-10' : 'text-text-2 hover:text-white'
            }`}
          >
            {isActive && variant === 'pill' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-gradient-to-r from-green-500 to-lime-glow rounded-full shadow-[0_0_15px_rgba(85,255,118,0.4)]"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              />
            )}

            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-black/20 text-black'
                      : 'bg-white/10 text-text-3'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
