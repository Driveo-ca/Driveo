'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getVehicleImageUrl } from '@/lib/vehicle-image';
import { cn } from '@/lib/utils';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import {
  Crown, Sparkles, Check, Loader2, Droplets,
  Zap, ArrowRight, Shield, X, Car, ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import type { Vehicle } from '@/types';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface DBPlan {
  id: string;
  name: string;
  slug: string;
  wash_plan: string;
  monthly_price: number;
  washes_per_month: number;
  description: string | null;
  is_active: boolean;
  display_order: number;
  stripe_price_id: string | null;
}

interface SubscriptionData {
  id: string;
  planId: string;
  vehicleId: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: DBPlan;
}

interface UsageData {
  allocated: number;
  used: number;
  periodStart: string;
  periodEnd: string;
}

const PLAN_META: Record<string, {
  icon: typeof Droplets;
  tagline: string;
  features: string[];
  featured: boolean;
}> = {
  regular: {
    icon: Droplets,
    tagline: 'Keep it clean',
    features: ['Exterior hand wash', 'Tire & rim cleaning', 'Window cleaning', 'Spot-free rinse'],
    featured: false,
  },
  interior_exterior: {
    icon: Sparkles,
    tagline: 'Most popular choice',
    features: ['Full exterior wash', 'Interior vacuum & wipe', 'Dashboard detail', 'Air freshener'],
    featured: true,
  },
  detailing: {
    icon: Crown,
    tagline: 'Showroom finish',
    features: ['Full paint correction', 'Clay bar treatment', 'Interior deep clean', 'Leather conditioning'],
    featured: false,
  },
};

export default function MembershipPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [plans, setPlans] = useState<DBPlan[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [justSubscribed, setJustSubscribed] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Checkout modal state
  const [checkoutSecret, setCheckoutSecret] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<DBPlan | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Handle return from Stripe Checkout
      const sessionId = searchParams.get('session_id');
      if (sessionId) {
        setConfirming(true);
        try {
          const res = await fetch('/api/subscriptions/activate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          if (res.ok) {
            setJustSubscribed(true);
            router.replace('/app/membership');
          }
        } catch { /* webhook fallback */ }
        setConfirming(false);
      }

      const [plansRes, vehiclesRes, usageRes] = await Promise.all([
        supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('vehicles')
          .select('*')
          .eq('customer_id', user.id)
          .order('is_primary', { ascending: false }),
        fetch('/api/subscriptions/usage').then(r => r.json()).catch(() => ({ subscription: null, usage: null })),
      ]);

      if (plansRes.data) setPlans(plansRes.data);
      if (vehiclesRes.data) {
        setVehicles(vehiclesRes.data);
        const primary = vehiclesRes.data.find((v: Vehicle) => v.is_primary) || vehiclesRes.data[0];
        if (primary) setSelectedVehicleId(primary.id);
      }
      if (usageRes.subscription) setSubscription(usageRes.subscription);
      if (usageRes.usage) setUsage(usageRes.usage);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCheckoutSecret = useCallback(async (planId: string, vehicleId: string) => {
    const res = await fetch('/api/subscriptions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, vehicleId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create checkout');
    return data.clientSecret;
  }, []);

  async function handleSubscribe(planId: string) {
    if (!selectedVehicleId) {
      setShowVehiclePicker(true);
      return;
    }

    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    setSubscribing(planId);
    try {
      const secret = await fetchCheckoutSecret(planId, selectedVehicleId);
      setCheckoutPlan(plan);
      setCheckoutSecret(secret);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubscribing(null);
    }
  }

  async function refreshSubscription() {
    const usageRes = await fetch('/api/subscriptions/usage').then(r => r.json()).catch(() => ({}));
    if (usageRes.subscription) setSubscription(usageRes.subscription);
    if (usageRes.usage) setUsage(usageRes.usage);
  }

  function handleCheckoutComplete() {
    setCheckoutPlan(null);
    setCheckoutSecret(null);
    setJustSubscribed(true);
    // The return_url redirect will trigger the activation via session_id
    // But also refresh here in case the page doesn't redirect
    setTimeout(() => refreshSubscription(), 1500);
  }

  async function handleCancel() {
    if (!subscription) return;
    if (!confirm('Cancel your subscription? It stays active until the current period ends.')) return;

    setCancelling(true);
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to cancel');
        return;
      }
      await refreshSubscription();
    } catch {
      alert('Something went wrong.');
    } finally {
      setCancelling(false);
    }
  }

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // ── Loading / Confirming ──
  if (confirming || loading) {
    return (
      <div className="min-h-screen text-foreground flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#E23232] mx-auto mb-4" />
          <p className="text-foreground/60 text-sm">
            {confirming ? 'Confirming your subscription...' : 'Loading plans...'}
          </p>
        </div>
      </div>
    );
  }

  // ── Checkout Modal ──
  if (checkoutSecret && checkoutPlan) {
    const meta = PLAN_META[checkoutPlan.wash_plan] || PLAN_META.regular;
    const Icon = meta.icon;

    return (
      <div className="min-h-screen text-foreground">
        <div className="max-w-xl mx-auto px-5 md:px-10 py-8">
          {/* Header with back button */}
          <button
            onClick={() => { setCheckoutSecret(null); setCheckoutPlan(null); }}
            className="flex items-center gap-1.5 text-foreground/40 hover:text-foreground text-sm transition-colors mb-6"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>

          {/* Plan summary */}
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl border border-border/40 bg-foreground/[0.02]">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              meta.featured ? 'bg-[#E23232]/10' : 'bg-foreground/[0.05]'
            )}>
              <Icon className={cn('w-[18px] h-[18px]', meta.featured ? 'text-[#E23232]' : 'text-foreground/40')} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">{checkoutPlan.name}</p>
              <p className="text-[11px] text-foreground/35">{checkoutPlan.washes_per_month} washes/month</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-foreground">${(checkoutPlan.monthly_price / 100).toFixed(0)}</span>
              <span className="text-xs text-foreground/35">/mo</span>
            </div>
          </div>

          {/* Embedded Stripe Checkout */}
          <div className="rounded-xl overflow-hidden border border-border/30">
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret: checkoutSecret, onComplete: handleCheckoutComplete }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      </div>
    );
  }

  // ── Active subscription view ──
  if (subscription) {
    const meta = PLAN_META[subscription.plan.wash_plan] || PLAN_META.regular;
    const Icon = meta.icon;
    const usagePercent = usage ? Math.min((usage.used / usage.allocated) * 100, 100) : 0;
    const remaining = usage ? usage.allocated - usage.used : 0;

    return (
      <div className="min-h-screen text-foreground">
        <div className="max-w-2xl mx-auto px-5 md:px-10 py-8">
          {justSubscribed && (
            <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-500">Welcome to Driveo Plus!</p>
                <p className="text-xs text-foreground/40 mt-0.5">Your subscription is now active. Book your first wash!</p>
              </div>
            </div>
          )}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Your Membership</h1>
            <p className="text-xs text-foreground/40 mt-1">Manage your Driveo Plus subscription</p>
          </div>

          <div className="relative rounded-2xl border border-[#E23232]/20 overflow-hidden mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E23232]/[0.06] via-transparent to-[#E23232]/[0.03]" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#E23232]/60 via-[#E23232]/20 to-transparent" />

            <div className="relative p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E23232]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#E23232]" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg">{subscription.plan.name}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">${(subscription.plan.monthly_price / 100).toFixed(0)}</span>
                      <span className="text-sm text-foreground/40">/mo</span>
                    </div>
                  </div>
                </div>
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider',
                  subscription.cancelAtPeriodEnd
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                )}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', subscription.cancelAtPeriodEnd ? 'bg-amber-500' : 'bg-emerald-500')} />
                  {subscription.cancelAtPeriodEnd ? 'Cancelling' : 'Active'}
                </span>
              </div>

              {usage && (
                <div className="rounded-xl bg-foreground/[0.03] border border-border/40 p-4 mb-4">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-foreground/50 text-xs font-medium">Washes used this period</span>
                    <span className="text-foreground font-bold tabular-nums">{usage.used} / {usage.allocated}</span>
                  </div>
                  <div className="h-2 bg-foreground/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-[#E23232] rounded-full transition-all duration-700" style={{ width: `${usagePercent}%` }} />
                  </div>
                  <p className="text-[11px] text-foreground/35 mt-2">{remaining} wash{remaining !== 1 ? 'es' : ''} remaining</p>
                </div>
              )}

              {subscription.currentPeriodEnd && (
                <p className="text-xs text-foreground/40">
                  {subscription.cancelAtPeriodEnd ? 'Access ends ' : 'Renews '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}

              {!subscription.cancelAtPeriodEnd && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full mt-5 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border/50 text-foreground/40 hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/[0.04] text-sm font-medium transition-all disabled:opacity-50"
                >
                  {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Plan selection view ──
  return (
    <div className="min-h-screen text-foreground">
      <div className="max-w-5xl mx-auto px-5 md:px-10 py-8">

        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E23232]/10 border border-[#E23232]/20 mb-4">
            <Zap className="w-3 h-3 text-[#E23232]" />
            <span className="text-[11px] font-semibold text-[#E23232] uppercase tracking-[0.06em]">Driveo Plus</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Choose Your Plan</h1>
          <p className="text-foreground/45 text-sm mt-2 max-w-md mx-auto">
            8 washes per month, at your doorstep. Save up to 30% vs pay-per-wash.
          </p>
        </div>

        {/* Vehicle selector */}
        {vehicles.length > 0 && (
          <div className="max-w-sm mx-auto mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground/35 mb-2 text-center">Subscription vehicle</p>
            <div className="relative">
              <button
                onClick={() => setShowVehiclePicker(!showVehiclePicker)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-border transition-all bg-foreground/[0.02]"
              >
                {selectedVehicle ? (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-foreground/[0.04] overflow-hidden shrink-0 relative">
                      <img
                        src={getVehicleImageUrl(selectedVehicle.make, selectedVehicle.model, selectedVehicle.year, { angle: 'front-side', width: 200, color: selectedVehicle.color || undefined })}
                        alt=""
                        className="absolute inset-0 w-full h-full object-contain p-0.5"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <Car className="absolute inset-0 m-auto w-4 h-4 text-foreground/[0.06]" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
                      <p className="text-[11px] text-foreground/35 capitalize">{selectedVehicle.type.replace('_', ' ')}</p>
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-foreground/40">Select a vehicle</span>
                )}
                <ChevronDown className={cn('w-4 h-4 text-foreground/30 shrink-0 transition-transform', showVehiclePicker && 'rotate-180')} />
              </button>

              {showVehiclePicker && vehicles.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-border/50 bg-background shadow-xl z-20 overflow-hidden">
                  {vehicles.map(v => (
                    <button
                      key={v.id}
                      onClick={() => { setSelectedVehicleId(v.id); setShowVehiclePicker(false); }}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 hover:bg-foreground/[0.03] transition-colors text-left',
                        v.id === selectedVehicleId && 'bg-foreground/[0.04]'
                      )}
                    >
                      <div className="w-9 h-9 rounded-lg bg-foreground/[0.04] overflow-hidden shrink-0 relative">
                        <img
                          src={getVehicleImageUrl(v.make, v.model, v.year, { angle: 'front-side', width: 150, color: v.color || undefined })}
                          alt=""
                          className="absolute inset-0 w-full h-full object-contain p-0.5"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <Car className="absolute inset-0 m-auto w-3.5 h-3.5 text-foreground/[0.06]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{v.year} {v.make} {v.model}</p>
                        <p className="text-[11px] text-foreground/30 capitalize">{v.type.replace('_', ' ')}{v.is_primary ? ' · Default' : ''}</p>
                      </div>
                      {v.id === selectedVehicleId && <Check className="w-4 h-4 text-[#E23232] shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {vehicles.length === 0 && (
          <div className="max-w-sm mx-auto mb-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] text-center">
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Add a vehicle first</p>
            <p className="text-xs text-foreground/40 mt-1">You need at least one vehicle to subscribe</p>
          </div>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-start max-w-4xl mx-auto">
          {plans.map((plan) => {
            const meta = PLAN_META[plan.wash_plan] || PLAN_META.regular;
            const Icon = meta.icon;
            const isSubscribing = subscribing === plan.id;
            const pricePerWash = Math.round(plan.monthly_price / 100 / plan.washes_per_month);

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-2xl border overflow-hidden transition-all duration-200 flex flex-col',
                  meta.featured
                    ? 'border-[#E23232]/30 md:-mt-2 md:mb-[-8px]'
                    : 'border-border/50'
                )}
              >
                {meta.featured && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#E23232]/[0.05] to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#E23232]" />
                  </>
                )}

                {meta.featured && (
                  <div className="relative flex justify-center -mb-3 pt-4 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E23232] text-white text-[10px] font-bold uppercase tracking-[0.06em] shadow-[0_2px_12px_rgba(226,50,50,0.3)]">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={cn('relative flex flex-col flex-1 p-5 md:p-6', meta.featured && 'pt-6')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      meta.featured ? 'bg-[#E23232]/10' : 'bg-foreground/[0.05]'
                    )}>
                      <Icon className={cn('w-[18px] h-[18px]', meta.featured ? 'text-[#E23232]' : 'text-foreground/40')} />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{plan.name}</p>
                      <p className="text-[11px] text-foreground/35">{meta.tagline}</p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">${(plan.monthly_price / 100).toFixed(0)}</span>
                      <span className="text-sm text-foreground/35">/mo</span>
                    </div>
                    <p className="text-[11px] text-foreground/30 mt-1">${pricePerWash}/wash · {plan.washes_per_month} washes</p>
                  </div>

                  <div className="h-px bg-border/40 mb-4" />

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {meta.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-[13px] text-foreground/55">
                        <Check className={cn('w-3.5 h-3.5 shrink-0', meta.featured ? 'text-[#E23232]' : 'text-foreground/25')} strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                    <li className="flex items-center gap-2.5 text-[13px] text-foreground/55">
                      <Check className={cn('w-3.5 h-3.5 shrink-0', meta.featured ? 'text-[#E23232]' : 'text-foreground/25')} strokeWidth={2.5} />
                      {plan.washes_per_month} washes/month
                    </li>
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribing !== null || vehicles.length === 0}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none',
                      meta.featured
                        ? 'bg-[#E23232] hover:bg-[#c92a2a] text-white shadow-[0_2px_12px_rgba(226,50,50,0.2)]'
                        : 'bg-foreground/[0.06] hover:bg-foreground/[0.10] text-foreground/80 hover:text-foreground'
                    )}
                  >
                    {isSubscribing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Subscribe
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust bar */}
        <div className="flex items-center justify-center gap-6 mt-10 text-foreground/25">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Cancel anytime</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-foreground/10" />
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Priority booking</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-foreground/10" />
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">No commitments</span>
          </div>
        </div>
      </div>
    </div>
  );
}
