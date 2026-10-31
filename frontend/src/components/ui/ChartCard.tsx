import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { GlassCard } from './GlassCard';
import { formatINR } from '../../utils/format';

export interface ChartDataPoint {
  date: string;
  revenue: number;
  collections?: number;
}

interface ChartCardProps {
  title?: string;
  subtitle?: string;
  data: ChartDataPoint[];
  rangeTabs?: string[];
  activeRange?: string;
  onRangeChange?: (range: string) => void;
  className?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/90 border border-glass-border-strong px-4 py-2.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(85,255,118,0.3)] backdrop-blur-xl">
        <p className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-base font-bold text-neon tabular-nums">
          {formatINR(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export const ChartCard: React.FC<ChartCardProps> = ({
  title = 'Revenue Growth & Run-Rate',
  subtitle = 'Real-time billed & recognized MRR over time',
  data,
  rangeTabs = ['7D', '30D', '3M', '6M', 'YTD'],
  activeRange = '30D',
  onRangeChange,
  className = '',
  height = 280,
}) => {
  const [selectedRange, setSelectedRange] = useState(activeRange);

  const handleRange = (range: string) => {
    setSelectedRange(range);
    if (onRangeChange) onRangeChange(range);
  };

  return (
    <GlassCard variant="bottom-glow" className={`relative ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div>
          <span className="eyebrow-text block mb-1">REVENUE INTELLIGENCE</span>
          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-text-3">{subtitle}</p>
        </div>

        {/* Range Tabs */}
        <div className="inline-flex items-center p-1 bg-surface/80 border border-glass-border rounded-full">
          {rangeTabs.map((r) => (
            <button
              key={r}
              onClick={() => handleRange(r)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                selectedRange === r
                  ? 'bg-gradient-to-r from-green-500 to-lime-glow text-black shadow-[0_0_12px_rgba(85,255,118,0.4)]'
                  : 'text-text-3 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div style={{ width: '100%', height }} className="relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGlowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#55FF76" stopOpacity={0.45} />
                <stop offset="50%" stopColor="#12C94B" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#12C94B" stopOpacity={0.0} />
              </linearGradient>
              <filter id="neonStrokeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#55FF76" floodOpacity="0.8" />
              </filter>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#5F6E63"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(85, 255, 118, 0.1)' }}
            />
            <YAxis
              stroke="#5F6E63"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#55FF76"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#revenueGlowGradient)"
              activeDot={{
                r: 6,
                fill: '#FFFFFF',
                stroke: '#55FF76',
                strokeWidth: 3,
                style: { filter: 'drop-shadow(0 0 10px #55FF76)' },
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};
