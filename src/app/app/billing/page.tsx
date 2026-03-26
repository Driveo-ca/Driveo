'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Receipt, CreditCard, TrendingUp, Calendar,
  Droplets, Sparkles, Car, CheckCircle2, Clock, XCircle,
  ChevronRight, Download, Filter, DollarSign, Zap,
} from 'lucide-react';
import type { Booking, WashPlan } from '@/types';

/* ─── Helpers ─── */
const PLAN_LABELS: Record<string, string> = {
  regular: 'Regular Wash',
  interior_exterior: 'Interior & Exterior',
  detailing: 'Full Detailing',
};

const PLAN_ICONS: Record<string, typeof Droplets> = {
  regular: Droplets,
  interior_exterior: Sparkles,
  detailing: Car,
};

const PAYMENT_CONFIG: Record<string, {
  label: string;
  color: string;
  bg: string;
  icon: typeof CheckCircle2;
}> = {
  captured: { label: 'Paid', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  authorized: { label: 'Authorized', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', icon: Clock },
  pending: { label: 'Pending', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
  refunded: { label: 'Refunded', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10', icon: XCircle },
  failed: { label: 'Failed', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10', icon: XCircle },
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
}

function getMonthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key: string): string {
  const [y, m] = key.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1);
  return date.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
}

type FilterTab = 'all' | 'paid' | 'pending' | 'refunded';

interface SubInfo {
  id: string;
  status: string;
  plan_name: string;
  monthly_price: number;
  current_period_end: string;
}

export default function BillingPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscription, setSubscription] = useState<SubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch bookings with payment info
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingData) setBookings(bookingData);

      // Fetch active subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('id, status, current_period_end, plan_id, subscription_plans(name, monthly_price)')
        .eq('customer_id', user.id)
        .eq('status', 'active')
        .single();

      if (subData) {
        const plan = subData.subscription_plans as unknown as { name: string; monthly_price: number } | null;
        setSubscription({
          id: subData.id,
          status: subData.status,
          plan_name: plan?.name || 'Subscription',
          monthly_price: plan?.monthly_price || 0,
          current_period_end: subData.current_period_end,
        });
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  // Stats
  const totalSpent = bookings
    .filter(b => b.payment_status === 'captured')
    .reduce((sum, b) => sum + b.total_price, 0);

  const totalWashes = bookings.filter(b => ['completed', 'paid'].includes(b.status)).length;

  const thisMonthKey = getMonthKey(new Date().toISOString());
  const thisMonthSpent = bookings
    .filter(b => b.payment_status === 'captured' && getMonthKey(b.created_at) === thisMonthKey)
    .reduce((sum, b) => sum + b.total_price, 0);

  // Filtered bookings
  const filtered = bookings.filter(b => {
    if (filter === 'paid') return b.payment_status === 'captured';
    if (filter === 'pending') return ['pending', 'authorized'].includes(b.payment_status);
    if (filter === 'refunded') return b.payment_status === 'refunded';
    return true;
  });

  // Group by month
  const grouped = filtered.reduce<Record<string, Booking[]>>((acc, b) => {
    const key = getMonthKey(b.created_at);
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {});

  const monthKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return (
      <div className="min-h-screen text-foreground">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-48 bg-foreground/[0.04] rounded-lg" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-24 bg-foreground/[0.04] rounded-2xl" />
            <Skeleton className="h-24 bg-foreground/[0.04] rounded-2xl" />
            <Skeleton className="h-24 bg-foreground/[0.04] rounded-2xl" />
          </div>
          <Skeleton className="h-12 bg-foreground/[0.04] rounded-xl" />
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20 bg-foreground/[0.04] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-foreground/[0.05] hover:bg-foreground/[0.08] flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Billing & History</h1>
            <p className="text-xs text-muted-foreground mt-0.5">All your payments and transactions</p>
          </div>
        </div>

        {/* ─── Stats Cards ─── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl border border-border/50 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/40 to-transparent" />
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-2.5">
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-lg font-bold text-foreground tabular-nums">{formatCents(totalSpent)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total spent</p>
          </div>

          <div className="rounded-2xl border border-border/50 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/40 to-transparent" />
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2.5">
              <Droplets className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-lg font-bold text-foreground tabular-nums">{totalWashes}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total washes</p>
          </div>

          <div className="rounded-2xl border border-border/50 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/40 to-transparent" />
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2.5">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground tabular-nums">{formatCents(thisMonthSpent)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">This month</p>
          </div>
        </div>

        {/* ─── Active Subscription ─── */}
        {subscription && (
          <div className="relative rounded-2xl border border-primary/20 overflow-hidden mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-primary/[0.02]" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
            <button
              onClick={() => router.push('/app/subscription')}
              className="relative w-full flex items-center gap-4 p-5 text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-foreground">{subscription.plan_name}</p>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-[9px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCents(subscription.monthly_price)}/mo · Renews {formatDate(subscription.current_period_end)}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/55 transition-colors" />
            </button>
          </div>
        )}

        {/* ─── Filter Tabs ─── */}
        <div className="flex items-center gap-1 mb-5 p-1 rounded-xl bg-foreground/[0.03] border border-border/40">
          {([
            { key: 'all', label: 'All' },
            { key: 'paid', label: 'Paid' },
            { key: 'pending', label: 'Pending' },
            { key: 'refunded', label: 'Refunded' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'flex-1 text-xs font-medium py-2 rounded-lg transition-all',
                filter === tab.key
                  ? 'bg-background text-foreground shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground/70'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Transaction List ─── */}
        {monthKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-foreground/[0.04] flex items-center justify-center mb-4">
              <Receipt className="w-6 h-6 text-foreground/20" />
            </div>
            <p className="text-sm font-medium text-foreground/55">No transactions yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Your payment history will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {monthKeys.map(monthKey => {
              const monthBookings = grouped[monthKey];
              const monthTotal = monthBookings
                .filter(b => b.payment_status === 'captured')
                .reduce((sum, b) => sum + b.total_price, 0);

              return (
                <div key={monthKey}>
                  {/* Month header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/50" />
                      <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                        {getMonthLabel(monthKey)}
                      </span>
                    </div>
                    {monthTotal > 0 && (
                      <span className="text-xs font-medium text-muted-foreground tabular-nums">
                        {formatCents(monthTotal)}
                      </span>
                    )}
                  </div>

                  {/* Transactions */}
                  <div className="rounded-2xl border border-border/50 overflow-hidden divide-y divide-border/40">
                    {monthBookings.map(booking => {
                      const PlanIcon = PLAN_ICONS[booking.wash_plan] || Droplets;
                      const payment = PAYMENT_CONFIG[booking.payment_status] || PAYMENT_CONFIG.pending;
                      const PayIcon = payment.icon;
                      const isSub = !!booking.subscription_id;

                      return (
                        <div
                          key={booking.id}
                          className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-foreground/[0.02] transition-colors"
                        >
                          {/* Icon */}
                          <div className="w-10 h-10 rounded-xl bg-foreground/[0.04] flex items-center justify-center shrink-0">
                            <PlanIcon className="w-4.5 h-4.5 text-foreground/55" />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate">
                                {PLAN_LABELS[booking.wash_plan] || booking.wash_plan}
                              </p>
                              {isSub && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-[8px] font-bold uppercase tracking-wider text-primary shrink-0">
                                  Membership
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-muted-foreground">
                                {formatDate(booking.created_at)} · {formatTime(booking.created_at)}
                              </span>
                              <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium', payment.color)}>
                                <PayIcon className="w-3 h-3" />
                                {payment.label}
                              </span>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="text-right shrink-0">
                            <p className={cn(
                              'text-sm font-semibold tabular-nums',
                              booking.payment_status === 'refunded' ? 'text-muted-foreground line-through' : 'text-foreground'
                            )}>
                              {formatCents(booking.total_price)}
                            </p>
                            {booking.hst_amount > 0 && (
                              <p className="text-[10px] text-muted-foreground/60 tabular-nums mt-0.5">
                                incl. {formatCents(booking.hst_amount)} HST
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pb-24" />
      </div>
    </div>
  );
}
