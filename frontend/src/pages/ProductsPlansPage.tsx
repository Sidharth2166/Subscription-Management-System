import React, { useState, useEffect } from 'react';
import { Package, Plus, Layers, CheckCircle2, Sliders, Shield, Tag } from 'lucide-react';
import { Tabs } from '../components/ui/Tabs';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { StatusChip } from '../components/ui/StatusChip';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { formatINR } from '../utils/format';
import { api } from '../api/client';

export const ProductsPlansPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected variant for price adjustment live demo
  const [selectedVariants, setSelectedVariants] = useState<Record<number, number | null>>({});

  useEffect(() => {
    setIsLoading(true);
    Promise.all([api.getProducts(), api.getPlans()])
      .then(([prods, plns]) => {
        setProducts(prods);
        setPlans(plns);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleVariantSelect = (productId: number, variantId: number | null) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variantId,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-text block mb-1">CATALOG & PRICING</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Products & Subscription Plans
          </h1>
          <p className="text-xs text-text-3">
            Configure line item deliverables, tier variants, and automated renewal rules.
          </p>
        </div>

        <Tabs
          tabs={[
            { id: 'products', label: 'Products & Variants', icon: <Package className="w-3.5 h-3.5" />, badge: products.length },
            { id: 'plans', label: 'Subscription Tiers', icon: <Layers className="w-3.5 h-3.5" />, badge: plans.length },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              const selectedVarId = selectedVariants[p.id];
              const activeVariant = p.variants?.find((v: any) => v.id === selectedVarId);
              const variantAdjustment = activeVariant ? Number(activeVariant.price_adjustment) : 0;
              const effectivePrice = Number(p.base_price) + variantAdjustment;

              return (
                <GlassCard key={p.id} variant="spotlight" className="p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neon bg-neon/10 px-2 py-0.5 rounded border border-neon/30">
                        {p.code}
                      </span>
                      <StatusChip status={p.is_active ? 'active' : 'draft'} size="sm" />
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight">{p.name}</h3>
                    <p className="text-xs text-text-3 leading-relaxed">
                      {p.description || 'Enterprise grade recurring software capability.'}
                    </p>

                    {/* Live Variant Selector */}
                    {p.variants && p.variants.length > 0 && (
                      <div className="pt-3 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-text-3 tracking-wider block">
                          Add-on Variant / SLA:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => handleVariantSelect(p.id, null)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              selectedVarId === null || selectedVarId === undefined
                                ? 'bg-neon/15 border-neon text-neon'
                                : 'bg-surface border-glass-border text-text-3 hover:text-white'
                            }`}
                          >
                            Base
                          </button>
                          {p.variants.map((v: any) => (
                            <button
                              key={v.id}
                              onClick={() => handleVariantSelect(p.id, v.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                selectedVarId === v.id
                                  ? 'bg-neon/15 border-neon text-neon'
                                  : 'bg-surface border-glass-border text-text-3 hover:text-white'
                              }`}
                            >
                              {v.name} (+₹{v.price_adjustment})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing Breakdown Card */}
                  <div className="pt-4 border-t border-glass-border flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-text-3 block uppercase">Effective Unit Price</span>
                      {activeVariant && (
                        <span className="text-[11px] text-text-3 font-mono">
                          ₹{p.base_price} + ₹{activeVariant.price_adjustment}
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-extrabold text-neon tabular-nums">
                      {formatINR(effectivePrice)}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* PLANS TAB */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((pln) => (
              <GlassCard
                key={pln.id}
                variant={pln.code === 'PLAN-ENTERPRISE' ? 'bottom-glow' : 'spotlight'}
                className="p-6 space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-neon bg-neon/10 px-2 py-0.5 rounded border border-neon/30">
                      {pln.code}
                    </span>
                    <span className="text-xs uppercase font-bold text-text-2 px-2.5 py-0.5 rounded-full bg-surface border border-glass-border">
                      {pln.billing_frequency}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight">{pln.name}</h3>
                    <p className="text-xs text-text-3 mt-1 leading-relaxed">{pln.description}</p>
                  </div>

                  {/* Calculated bundle price */}
                  <div className="p-3.5 rounded-xl bg-surface/80 border border-glass-border flex items-baseline justify-between">
                    <span className="text-xs text-text-3">Bundle Price</span>
                    <span className="text-2xl font-extrabold text-neon tabular-nums">
                      {formatINR(pln.calculated_price)}
                      <span className="text-xs text-text-3 font-normal"> / {pln.billing_frequency}</span>
                    </span>
                  </div>

                  {/* Rules & Permissions Checklist */}
                  <div className="space-y-2 pt-2 text-xs text-text-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-neon" />
                      <span>Early close allowed: {pln.allow_early_close ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-neon" />
                      <span>Pause allowed: {pln.allow_pause ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-neon" />
                      <span>Auto-renewal permission: {pln.allow_renewal ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-glass-border flex items-center justify-between text-xs">
                  <span className="text-text-3">Subscribers</span>
                  <span className="font-bold text-white">{pln.total_subscribers ?? 0} active</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
