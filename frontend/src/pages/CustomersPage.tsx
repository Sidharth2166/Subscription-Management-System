import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building, Mail, Phone, ExternalLink } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { GlowButton } from '../components/ui/GlowButton';
import { StatusChip } from '../components/ui/StatusChip';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { Input } from '../components/ui/Input';
import { formatINR, formatDate } from '../utils/format';
import { api } from '../api/client';

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New customer form state
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGstin, setNewGstin] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newState, setNewState] = useState('Karnataka');

  const fetchCustomers = () => {
    setIsLoading(true);
    api.getCustomers({ search })
      .then((data) => {
        setCustomers(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCustomer({
        name: newName,
        company_name: newCompany,
        email: newEmail,
        phone: newPhone,
        gstin: newGstin,
        city: newCity,
        state: newState,
        status: 'active'
      });
      setIsAddOpen(false);
      fetchCustomers();
      // Reset form
      setNewName('');
      setNewCompany('');
      setNewEmail('');
      setNewPhone('');
      setNewGstin('');
    } catch (err: any) {
      alert(err.message || 'Failed to create customer');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'company_name',
      header: 'Company / Account',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-bold text-white text-sm">{item.company_name}</div>
          <div className="text-xs text-text-3">{item.name} • {item.city}, {item.state}</div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Billing Contact',
      render: (item) => (
        <div>
          <div className="text-xs text-text-2">{item.email}</div>
          <div className="text-[10px] text-text-3 font-mono">GSTIN: {item.gstin || 'Unregistered'}</div>
        </div>
      ),
    },
    {
      key: 'active_subscriptions_count',
      header: 'Active Subs',
      align: 'center',
      render: (item) => (
        <span className="font-semibold text-white">{item.active_subscriptions_count ?? 1}</span>
      ),
    },
    {
      key: 'total_mrr',
      header: 'Monthly MRR',
      align: 'right',
      sortable: true,
      render: (item) => (
        <span className="font-bold text-neon tabular-nums">
          {formatINR(item.total_mrr)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => <StatusChip status={item.status} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-text block mb-1">PORTFOLIO DIRECTORY</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Customer Accounts
          </h1>
          <p className="text-xs text-text-3">
            Manage enterprise clients, subscription entitlements, and billing GST profiles.
          </p>
        </div>

        <GlowButton
          variant="primary"
          size="sm"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Customer
        </GlowButton>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3 rounded-2xl bg-surface/80 border border-glass-border flex items-center gap-3">
        <Search className="w-4 h-4 text-neon ml-2" />
        <input
          type="text"
          placeholder="Filter by company name, contact, or email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-xs text-white placeholder-text-3 outline-none"
        />
        <div className="text-xs text-text-3 mr-2 font-mono">
          {customers.length} registered accounts
        </div>
      </div>

      {/* Customers Data Table */}
      <DataTable
        columns={columns}
        data={customers}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onRowClick={(item) => setSelectedCustomer(item)}
      />

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Customer Account"
        description="Add company billing details and Indian GST identification"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-left">
          <Input
            label="Company Name"
            placeholder="e.g. NovaTech India Ltd"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            required
          />
          <Input
            label="Primary Contact Person"
            placeholder="e.g. Aarav Patel"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <Input
            label="Billing Email"
            type="email"
            placeholder="billing@novatech.in"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              placeholder="+91 9876543210"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
            <Input
              label="GSTIN Number"
              placeholder="27AABCN1234F1Z1"
              value={newGstin}
              onChange={(e) => setNewGstin(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
            />
            <Input
              label="State"
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <GlowButton variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </GlowButton>
            <GlowButton type="submit" variant="primary">
              Register Customer
            </GlowButton>
          </div>
        </form>
      </Modal>

      {/* Customer Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.company_name}
        subtitle={`Account #${selectedCustomer?.id} • Registered ${formatDate(selectedCustomer?.created_at)}`}
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-surface border border-glass-border">
              <span className="text-[10px] text-text-3 uppercase font-semibold">Contracted MRR</span>
              <div className="text-3xl font-extrabold text-neon mt-1 tabular-nums">
                {formatINR(selectedCustomer.total_mrr)}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Account Credentials</h4>
              <div className="p-3.5 rounded-xl bg-surface/60 border border-glass-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-3">Primary Contact:</span>
                  <span className="text-white font-medium">{selectedCustomer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-3">Email Address:</span>
                  <span className="text-neon">{selectedCustomer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-3">GSTIN ID:</span>
                  <span className="font-mono text-white">{selectedCustomer.gstin || 'None (Unregistered)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-3">Location:</span>
                  <span className="text-text-2">{selectedCustomer.city}, {selectedCustomer.state}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <GlowButton
                variant="primary"
                className="w-full"
                onClick={() => {
                  setSelectedCustomer(null);
                  navigate('/quotations');
                }}
              >
                Create Quotation for Client
              </GlowButton>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
