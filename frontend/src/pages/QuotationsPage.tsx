import React, { useState, useEffect } from 'react';
import { Plus, FileText, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { GlowButton } from '../components/ui/GlowButton';
import { StatusChip } from '../components/ui/StatusChip';
import { Modal } from '../components/ui/Modal';
import { formatINR, formatDate } from '../utils/format';
import { api } from '../api/client';

export const QuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Builder form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [validityDays, setValidityDays] = useState(15);
  const [notes, setNotes] = useState('Standard enterprise quotation valid for 15 days.');

  const fetchQuotations = () => {
    setIsLoading(true);
    api.getQuotations()
      .then((data) => {
        setQuotations(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchQuotations();
    api.getCustomers().then(setCustomers).catch(() => {});
    api.getPlans().then(setPlans).catch(() => {});
    api.getProducts().then(setProducts).catch(() => {});
  }, []);

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedPlanId || selectedProductIds.length === 0) {
      alert('Please select a customer, plan, and at least one product.');
      return;
    }

    const lines = selectedProductIds.map((pid) => {
      const prod = products.find((p) => p.id === pid);
      return {
        product_id: pid,
        quantity: 1,
        unit_price: prod ? Number(prod.base_price) : 2000,
      };
    });

    const validity = new Date();
    validity.setDate(validity.getDate() + validityDays);

    try {
      await api.createQuotation({
        customer_id: selectedCustomerId,
        plan_id: selectedPlanId,
        validity_date: validity.toISOString(),
        lines,
        notes,
      });
      setIsCreateOpen(false);
      fetchQuotations();
    } catch (err: any) {
      alert(err.message || 'Failed to create quotation');
    }
  };

  const handleConvert = async (quoteId: number) => {
    try {
      const res = await api.convertToSubscription(quoteId);
      alert(`Successfully converted into Subscription ${res.subscription_number}!`);
      fetchQuotations();
    } catch (err: any) {
      alert(err.message || 'Conversion failed');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'quotation_number',
      header: 'Quote Number',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-mono text-white font-bold text-xs">{item.quotation_number}</span>
          <div className="text-[10px] text-text-3">Issued {formatDate(item.created_at)}</div>
        </div>
      ),
    },
    {
      key: 'customer_id',
      header: 'Client / Account',
      render: (item) => {
        const cust = customers.find((c) => c.id === item.customer_id);
        return (
          <div>
            <div className="font-semibold text-white text-xs">{cust?.company_name || `Customer #${item.customer_id}`}</div>
            <div className="text-[11px] text-text-3">Valid until {formatDate(item.validity_date)}</div>
          </div>
        );
      },
    },
    {
      key: 'total_amount',
      header: 'Total Value (GST 18%)',
      align: 'right',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-bold text-neon tabular-nums">{formatINR(item.total_amount)}</div>
          <div className="text-[10px] text-text-3">Base: {formatINR(item.subtotal)}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => <StatusChip status={item.status} size="sm" />,
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      render: (item) => {
        if (item.status === 'converted') {
          return <span className="text-xs text-text-3 font-medium">Converted</span>;
        }
        return (
          <GlowButton
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleConvert(item.id);
            }}
          >
            Convert to Sub
          </GlowButton>
        );
      },
    },
  ];

  // Live total preview inside builder modal
  const builderSubtotal = selectedProductIds.reduce((sum, pid) => {
    const prod = products.find((p) => p.id === pid);
    return sum + (prod ? Number(prod.base_price) : 0);
  }, 0);
  const builderTax = builderSubtotal * 0.18;
  const builderTotal = builderSubtotal + builderTax;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-text block mb-1">PROPOSALS & ESTIMATES</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Quotations
          </h1>
          <p className="text-xs text-text-3">
            Draft interactive proposals, preview tax/discount lines, and convert seamlessly into subscriptions.
          </p>
        </div>

        <GlowButton
          variant="primary"
          size="sm"
          onClick={() => {
            if (customers.length > 0) setSelectedCustomerId(customers[0].id);
            if (plans.length > 0) setSelectedPlanId(plans[0].id);
            if (products.length > 0) setSelectedProductIds([products[0].id]);
            setIsCreateOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Quotation
        </GlowButton>
      </div>

      <DataTable
        columns={columns}
        data={quotations}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
      />

      {/* Quotation Builder Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Quotation Builder"
        description="Select deliverables and verify live tax & discount calculation"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateQuotation} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-semibold text-text-2 uppercase block mb-1.5">
              Select Client
            </label>
            <select
              value={selectedCustomerId || ''}
              onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
              className="w-full bg-surface border border-glass-border rounded-input px-3.5 py-2.5 text-xs text-white outline-none"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id} className="bg-card">
                  {c.company_name} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-2 uppercase block mb-1.5">
              Subscription Plan Template
            </label>
            <select
              value={selectedPlanId || ''}
              onChange={(e) => setSelectedPlanId(Number(e.target.value))}
              className="w-full bg-surface border border-glass-border rounded-input px-3.5 py-2.5 text-xs text-white outline-none"
              required
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id} className="bg-card">
                  {p.name} ({p.billing_frequency})
                </option>
              ))}
            </select>
          </div>

          {/* Product deliverable checkboxes */}
          <div>
            <label className="text-xs font-semibold text-text-2 uppercase block mb-1.5">
              Included Products & Capabilities
            </label>
            <div className="max-h-44 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-surface/50 border border-glass-border">
              {products.map((p) => {
                const isChecked = selectedProductIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-surface cursor-pointer text-xs select-none"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProductIds([...selectedProductIds, p.id]);
                          } else {
                            setSelectedProductIds(selectedProductIds.filter((id) => id !== p.id));
                          }
                        }}
                        className="w-4 h-4 rounded bg-card accent-[#55FF76]"
                      />
                      <span className="text-white font-medium">{p.name}</span>
                    </div>
                    <span className="text-neon font-mono">{formatINR(p.base_price)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Live Totals Preview Card */}
          <div className="p-4 rounded-xl bg-surface border border-green-500/30 space-y-1.5 text-xs">
            <div className="flex justify-between text-text-3">
              <span>Deliverables Subtotal:</span>
              <span className="text-white font-mono">{formatINR(builderSubtotal)}</span>
            </div>
            <div className="flex justify-between text-text-3">
              <span>Standard GST (18.00%):</span>
              <span className="text-white font-mono">+{formatINR(builderTax)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-glass-border">
              <span>Total Estimated Value:</span>
              <span className="text-neon tabular-nums">{formatINR(builderTotal)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <GlowButton variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </GlowButton>
            <GlowButton type="submit" variant="primary">
              Issue Quotation
            </GlowButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
