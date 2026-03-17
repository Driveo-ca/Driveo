'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Save, DollarSign, Car, Gauge } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PlanPricing {
  id: string;
  name: string;
  slug: string;
  wash_plan: string;
  monthly_price: number;
  washes_per_month: number;
}

// From DRIVEO_ARCHITECTURE.md
const VEHICLE_MULTIPLIERS = [
  { type: 'Sedan / Coupe', key: 'sedan', multiplier: 1.0 },
  { type: 'Crossover', key: 'crossover', multiplier: 1.15 },
  { type: 'SUV', key: 'suv', multiplier: 1.25 },
  { type: 'Minivan', key: 'minivan', multiplier: 1.25 },
  { type: 'Pickup', key: 'pickup', multiplier: 1.2 },
  { type: 'Large SUV / Truck', key: 'large_suv', multiplier: 1.4 },
];

const DIRT_MULTIPLIERS = [
  { level: '0-5', multiplier: 1.0, description: 'Light to normal' },
  { level: '6', multiplier: 1.15, description: 'Moderately dirty' },
  { level: '7', multiplier: 1.3, description: 'Dirty' },
  { level: '8', multiplier: 1.5, description: 'Very dirty' },
  { level: '9', multiplier: 1.75, description: 'Heavily soiled' },
  { level: '10', multiplier: 2.0, description: 'Extreme' },
];

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<PlanPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vehicleMults, setVehicleMults] = useState(VEHICLE_MULTIPLIERS);
  const [dirtMults, setDirtMults] = useState(DIRT_MULTIPLIERS);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPricing() {
      const { data } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('display_order');

      if (data) setPlans(data as PlanPricing[]);
      setLoading(false);
    }

    fetchPricing();
  }, [supabase]);

  const updatePlanPrice = (id: string, cents: number) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, monthly_price: cents } : p))
    );
  };

  const updateVehicleMult = (key: string, value: number) => {
    setVehicleMults((prev) =>
      prev.map((v) => (v.key === key ? { ...v, multiplier: value } : v))
    );
  };

  const updateDirtMult = (level: string, value: number) => {
    setDirtMults((prev) =>
      prev.map((d) => (d.level === level ? { ...d, multiplier: value } : d))
    );
  };

  const handleSave = async () => {
    setSaving(true);

    // Update plan prices in DB
    for (const plan of plans) {
      await supabase
        .from('subscription_plans')
        .update({ monthly_price: plan.monthly_price })
        .eq('id', plan.id);
    }

    // Vehicle and dirt multipliers would be stored in a config table or env
    // For now, this saves plan prices to the database
    setSaving(false);
  };

  const perWashPrice: Record<string, number> = {
    regular: 1800,
    interior_exterior: 2500,
    detailing: 18900,
  };

  return (
    <div className="space-y-8 md:pt-0 pt-14 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E23232]/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#E23232]" />
          </div>
          <div>
            <h1 className="text-3xl font-display text-white tracking-tight">Pricing</h1>
            <p className="text-white/30 text-sm mt-0.5">Configure plans, multipliers, and rates</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#E23232] hover:bg-[#E23232]/80 text-white rounded-xl disabled:shadow-none transition-colors px-6"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full bg-white/5 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6 stagger-children">
          {/* Base Plan Prices */}
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-display text-white">Base Prices</h2>
                  <p className="text-white/25 text-xs">Per wash pricing for each plan</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(perWashPrice).map(([plan, cents]) => (
                  <div
                    key={plan}
                    className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-5 group hover:border-white/[0.12] transition-colors duration-200"
                  >
                    <Label className="text-white/30 text-[10px] uppercase tracking-widest">
                      {plan === 'interior_exterior'
                        ? 'Interior & Exterior'
                        : plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </Label>
                    <p className="text-3xl font-bold text-[#E23232] mt-2">
                      ${(cents / 100).toFixed(0)}
                    </p>
                    <p className="text-[10px] text-white/20 mt-2 uppercase tracking-widest">per wash</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Subscription Prices */}
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="p-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-display text-white">Monthly Subscriptions</h2>
                  <p className="text-white/25 text-xs">Recurring plan pricing</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] transition-colors duration-200 group"
                >
                  <div>
                    <p className="font-medium text-white text-sm">{plan.name}</p>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest mt-0.5">
                      {plan.washes_per_month} washes/month
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/25 text-sm">$</span>
                    <Input
                      type="number"
                      value={(plan.monthly_price / 100).toFixed(0)}
                      onChange={(e) =>
                        updatePlanPrice(
                          plan.id,
                          Math.round(parseFloat(e.target.value) * 100) || 0
                        )
                      }
                      className="bg-[#111] border border-white/[0.08] w-24 text-right text-sm rounded-lg text-white focus:border-white/[0.15] focus:ring-0"
                    />
                    <span className="text-white/20 text-xs font-mono">/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Multipliers */}
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="p-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Car className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-display text-white">Vehicle Multipliers</h2>
                  <p className="text-white/25 text-xs">Price adjustments by vehicle type</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {vehicleMults.map((v) => (
                <div
                  key={v.key}
                  className="flex items-center justify-between bg-[#0a0a0a] border border-white/[0.06] rounded-xl px-4 py-3 hover:border-white/[0.12] transition-colors duration-200"
                >
                  <span className="text-sm text-white/60">{v.type}</span>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      step="0.05"
                      value={v.multiplier}
                      onChange={(e) =>
                        updateVehicleMult(
                          v.key,
                          parseFloat(e.target.value) || 1
                        )
                      }
                      className="bg-[#111] border border-white/[0.08] w-20 text-right text-sm rounded-lg text-white focus:border-white/[0.15] focus:ring-0"
                    />
                    <span className="text-white/20 text-xs font-mono w-4">x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dirt Level Multipliers */}
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="p-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Gauge className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-display text-white">Dirt Multipliers</h2>
                  <p className="text-white/25 text-xs">Driveo Slide surcharge levels</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {dirtMults.map((d) => (
                <div
                  key={d.level}
                  className="flex items-center justify-between bg-[#0a0a0a] border border-white/[0.06] rounded-xl px-4 py-3 hover:border-white/[0.12] transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/60">
                      Level {d.level}
                    </span>
                    <span className="text-[10px] text-white/20 bg-[#111] border border-white/[0.06] rounded-full px-2.5 py-0.5">
                      {d.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#E23232] text-sm font-bold">{d.multiplier}x</span>
                    <Input
                      type="number"
                      step="0.05"
                      value={d.multiplier}
                      onChange={(e) =>
                        updateDirtMult(
                          d.level,
                          parseFloat(e.target.value) || 1
                        )
                      }
                      className="bg-[#111] border border-white/[0.08] w-20 text-right text-sm rounded-lg text-white focus:border-white/[0.15] focus:ring-0"
                    />
                    <span className="text-white/20 text-xs font-mono w-4">x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
