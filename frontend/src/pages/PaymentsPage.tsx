import React, { useState, useEffect } from 'react';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { StatusChip } from '../components/ui/StatusChip';
import { formatINR, formatDateTime } from '../utils/format';
import { api } from '../api/client';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getPayments()
      .then((data) => {
        setPayments(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const totalCollected = payments.reduce((sum, p) => sum + (p.status === 'success' ? Number(p.amount) : 0), 0);

  const columns: Column<any>[] = [
    {
      key: 'payment_number',
      header: 'Payment Ref',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-mono text-white font-bold text-xs">{item.payment_number}</span>
          <div className="text-[10px] text-text-3">{formatDateTime(item.payment_date)}</div>
        </div>
      ),
    },
    {
      key: 'payment_method',
      header: 'Method',
      render: (item) => (
        <span className="text-xs uppercase font-semibold text-text-2 px-2 py-0.5 rounded-full bg-surface border border-glass-border">
          {item.payment_method}
        </span>
      ),
    },
    {
      key: 'reference_id',
      header: 'Gateway TXN ID',
      render: (item) => (
        <span className="font-mono text-xs text-text-3">{item.reference_id || 'Direct Settlement'}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      align: 'right',
      sortable: true,
      render: (item) => (
        <span className="font-bold text-neon tabular-nums">{formatINR(item.amount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Reconciliation',
      align: 'center',
      render: (item) => <StatusChip status={item.status} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-text block mb-1">CASH FLOW INFLOW</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Payments & Reconciliation
          </h1>
          <p className="text-xs text-text-3">
            Real-time multi-rail collections ledger (UPI, Cards, Wire Transfer).
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-surface border border-glass-border">
          <span className="text-[10px] text-text-3 uppercase block font-semibold">Total Settled Inflow</span>
          <div className="text-2xl font-extrabold text-neon tabular-nums">
            {formatINR(totalCollected)}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
      />
    </div>
  );
};
