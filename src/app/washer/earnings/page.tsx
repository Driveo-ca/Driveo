'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { DollarSign, TrendingUp, Calendar, Clock, Car, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EarningsJob {
  id: string;
  wash_plan: string;
  washer_payout: number;
  status: string;
  wash_completed_at: string | null;
  vehicles: { make: string; model: string; year: number } | null;
}

const planLabel: Record<string, string> = {
  regular: 'Regular Wash',
  interior_exterior: 'Interior & Exterior',
  detailing: 'Full Detailing',
};

const planDot: Record<string, string> = {
  regular: 'bg-blue-500',
  interior_exterior: 'bg-violet-500',
  detailing: 'bg-[#E23232]',
};

export default function WasherEarningsPage() {
  const [jobs, setJobs] = useState<EarningsJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEarnings() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('bookings')
        .select('id, wash_plan, washer_payout, status, wash_completed_at, vehicles(make, model, year)')
        .eq('washer_id', user.id)
        .in('status', ['completed', 'paid'])
        .order('wash_completed_at', { ascending: false });
      if (data) setJobs(data as unknown as EarningsJob[]);
      setLoading(false);
    }
    fetchEarnings();
  }, []);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayJobs = jobs.filter((j) => j.wash_completed_at && new Date(j.wash_completed_at) >= todayStart);
  const weekJobs = jobs.filter((j) => j.wash_completed_at && new Date(j.wash_completed_at) >= weekStart);
  const monthJobs = jobs.filter((j) => j.wash_completed_at && new Date(j.wash_completed_at) >= monthStart);

  const todayEarnings = todayJobs.reduce((s, j) => s + j.washer_payout, 0);
  const weekEarnings = weekJobs.reduce((s, j) => s + j.washer_payout, 0);
  const monthEarnings = monthJobs.reduce((s, j) => s + j.washer_payout, 0);
  const allTimeEarnings = jobs.reduce((s, j) => s + j.washer_payout, 0);

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  // Per-plan earnings
  const planEarnings = jobs.reduce((acc, j) => {
    acc[j.wash_plan] = (acc[j.wash_plan] || 0) + j.washer_payout;
    return acc;
  }, {} as Record<string, number>);

  const planCount = jobs.reduce((acc, j) => {
    acc[j.wash_plan] = (acc[j.wash_plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Avg per wash
  const avgPerWash = jobs.length > 0 ? allTimeEarnings / jobs.length : 0;

  return (
    <div className="max-w-[1280px] mx-auto px-5 pt-4 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Earnings</h1>
          <p className="text-foreground/65 text-xs mt-0.5 font-mono">{jobs.length} completed jobs</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-foreground/[0.05] flex items-center justify-center">
          <Banknote className="w-[18px] h-[18px] text-foreground/65" />
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-4">
            <div className="h-40 bg-foreground/[0.04] rounded-2xl animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-24 bg-foreground/[0.04] rounded-2xl animate-pulse" />
              <div className="h-24 bg-foreground/[0.04] rounded-2xl animate-pulse" />
            </div>
            <div className="h-64 bg-foreground/[0.04] rounded-2xl animate-pulse" />
          </div>
          <div className="hidden lg:block space-y-4">
            <div className="h-48 bg-foreground/[0.04] rounded-2xl animate-pulse" />
            <div className="h-36 bg-foreground/[0.04] rounded-2xl animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

          {/* ── LEFT: Main Content ── */}
          <div className="space-y-4 min-w-0">

            {/* Hero — All Time */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-6 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600/60 dark:text-emerald-400/60" />
                    <span className="font-mono text-[11px] text-foreground/65 uppercase tracking-[0.1em] font-semibold">All-Time Earnings</span>
                  </div>
                  <p className="text-4xl lg:text-5xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{fmt(allTimeEarnings)}</p>
                  <p className="text-xs text-foreground/60 mt-2 font-mono">across {jobs.length} wash{jobs.length !== 1 ? 'es' : ''}</p>
                </div>
                <div className="hidden lg:block text-right">
                  <p className="font-mono text-[10px] text-foreground/60 uppercase tracking-wider">Avg / wash</p>
                  <p className="text-2xl font-bold text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">{fmt(Math.round(avgPerWash))}</p>
                </div>
              </div>
            </motion.div>

            {/* Period Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="grid grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {[
                { icon: Clock, label: 'Today', value: fmt(todayEarnings), count: todayJobs.length, color: 'text-foreground', border: 'border-border/50' },
                { icon: Calendar, label: 'This Week', value: fmt(weekEarnings), count: weekJobs.length, color: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
                { icon: Calendar, label: 'This Month', value: fmt(monthEarnings), count: monthJobs.length, color: 'text-[#E23232]', border: 'border-[#E23232]/20' },
              ].map((s) => (
                <div key={s.label} className={cn('border rounded-2xl p-4', s.border)}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <s.icon className="w-3.5 h-3.5 text-foreground/60" />
                    <span className="font-mono text-[10px] text-foreground/65 uppercase tracking-[0.08em] font-medium">{s.label}</span>
                  </div>
                  <p className={cn('text-2xl font-bold tracking-tight', s.color)}>{s.value}</p>
                  <p className="text-[10px] text-foreground/55 mt-1 font-mono">{s.count} wash{s.count !== 1 ? 'es' : ''}</p>
                </div>
              ))}
            </motion.div>

            {/* History */}
            <div className="flex items-center justify-between mb-3 mt-2">
              <span className="font-mono text-[11px] font-semibold text-foreground/65 uppercase tracking-[0.1em]">Job History</span>
              <span className="font-mono text-[10px] text-foreground/55">{jobs.length} jobs</span>
            </div>

            {jobs.length === 0 ? (
              <div className="border border-dashed border-border/50 rounded-2xl p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-foreground/[0.04] flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-5 h-5 text-foreground/50" />
                </div>
                <p className="text-foreground/65 text-sm">No completed jobs yet</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {jobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.03 }}
                    className="border border-border/50 rounded-2xl p-4 flex items-center gap-3"
                  >
                    <div className={cn('w-1.5 h-10 rounded-full shrink-0', planDot[job.wash_plan] || 'bg-foreground/30')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-sm font-semibold truncate">
                        {planLabel[job.wash_plan] || job.wash_plan}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {job.vehicles && (
                          <span className="text-foreground/65 text-xs truncate">
                            {job.vehicles.year} {job.vehicles.make} {job.vehicles.model}
                          </span>
                        )}
                      </div>
                      <p className="text-foreground/55 text-[10px] mt-0.5 font-mono">
                        {job.wash_completed_at
                          ? new Date(job.wash_completed_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : 'Pending'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0">
                      <DollarSign className="w-3.5 h-3.5" />
                      {(job.washer_payout / 100).toFixed(2)}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Stats Sidebar ── */}
          <div className="hidden lg:block space-y-5">

            {/* Plan Breakdown */}
            {Object.keys(planEarnings).length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="border border-border/50 rounded-2xl p-5"
              >
                <span className="font-mono text-[10px] text-foreground/60 uppercase tracking-[0.1em] font-semibold">Earnings by Plan</span>
                <div className="mt-4 space-y-4">
                  {Object.entries(planEarnings).map(([plan, earnings]) => {
                    const count = planCount[plan] || 0;
                    const pct = allTimeEarnings > 0 ? Math.round((earnings / allTimeEarnings) * 100) : 0;
                    const dotColor = planDot[plan] || 'bg-foreground/30';
                    return (
                      <div key={plan}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={cn('w-2 h-2 rounded-full', dotColor)} />
                            <span className="text-xs text-foreground/60 font-medium">{planLabel[plan] || plan}</span>
                          </div>
                          <span className="text-xs text-foreground/60 font-mono">{fmt(earnings)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-foreground/[0.06] overflow-hidden">
                            <div className={cn('h-full rounded-full', dotColor)} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-foreground/50 font-mono w-8 text-right">{pct}%</span>
                        </div>
                        <p className="text-[10px] text-foreground/50 font-mono mt-1">{count} wash{count !== 1 ? 'es' : ''}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="border border-border/50 rounded-2xl p-5"
            >
              <span className="font-mono text-[10px] text-foreground/60 uppercase tracking-[0.1em] font-semibold">Quick Stats</span>
              <div className="mt-4 space-y-4">
                {[
                  { icon: DollarSign, label: 'Avg per Wash', value: fmt(Math.round(avgPerWash)), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
                  { icon: Car, label: 'Total Washes', value: String(jobs.length), color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
                  { icon: TrendingUp, label: 'Best Plan', value: Object.entries(planEarnings).sort(([,a],[,b]) => b - a)[0]?.[0] ? planLabel[Object.entries(planEarnings).sort(([,a],[,b]) => b - a)[0][0]] || '—' : '—', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', s.bg)}>
                      <s.icon className={cn('w-4 h-4', s.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] text-foreground/60 uppercase tracking-wider">{s.label}</p>
                      <p className={cn('text-sm font-bold leading-tight truncate', s.color)}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
