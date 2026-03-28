'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Send, User, AlertCircle, Wallet, CheckCircle2, Users, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface WasherPayout {
  id: string;
  full_name: string;
  email: string;
  stripe_account_id: string | null;
  pending_earnings: number;
  completed_jobs: number;
}

export default function AdminPayoutsPage() {
  const [washers, setWashers] = useState<WasherPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayouts() {
      const supabase = createClient();
      const { data: washerData } = await supabase
        .from('profiles')
        .select('id, full_name, email, washer_profiles(stripe_account_id)')
        .eq('role', 'washer');

      if (!washerData) { setLoading(false); return; }

      const payouts: WasherPayout[] = [];
      for (const washer of washerData) {
        const { data: bookings } = await supabase
          .from('bookings').select('washer_payout').eq('washer_id', washer.id).eq('status', 'completed');
        const pendingEarnings = (bookings || []).reduce((sum: number, b: { washer_payout: number }) => sum + b.washer_payout, 0);
        const wp = Array.isArray(washer.washer_profiles) ? washer.washer_profiles[0] : washer.washer_profiles;
        payouts.push({
          id: washer.id, full_name: washer.full_name, email: washer.email,
          stripe_account_id: wp?.stripe_account_id || null,
          pending_earnings: pendingEarnings, completed_jobs: (bookings || []).length,
        });
      }
      payouts.sort((a, b) => b.pending_earnings - a.pending_earnings);
      setWashers(payouts);
      setLoading(false);
    }
    fetchPayouts();
  }, []);

  const handlePayout = async (washerId: string) => {
    setProcessingId(washerId);
    const response = await fetch('/api/admin/payouts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ washer_id: washerId }),
    });
    if (response.ok) {
      setWashers((prev) => prev.map((w) => w.id === washerId ? { ...w, pending_earnings: 0, completed_jobs: 0 } : w));
    }
    setProcessingId(null);
  };

  const totalPending = washers.reduce((sum, w) => sum + w.pending_earnings, 0);
  const withPending = washers.filter((w) => w.pending_earnings > 0).length;
  const stripeConnected = washers.filter((w) => w.stripe_account_id).length;
  const totalPaid = washers.reduce((sum, w) => sum + w.completed_jobs, 0);

  return (
    <div className="space-y-8 md:pt-0 pt-14">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E23232]/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-[#E23232]" />
          </div>
          <div>
            <h1 className="text-3xl font-display text-foreground tracking-tight">Payouts</h1>
            <p className="text-foreground/50 text-sm mt-0.5">Manage washer earnings and Stripe transfers</p>
          </div>
        </div>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Washer list */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 bg-foreground/5 rounded-2xl" />)}</div>
          ) : washers.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center">
              <User className="w-8 h-8 text-foreground/30 dark:text-foreground/10 mx-auto mb-3" />
              <p className="text-foreground/60 dark:text-foreground/40 text-sm">No washers found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {washers.map((washer) => (
                <div key={washer.id} className="bg-surface border border-border rounded-2xl hover:border-foreground/10 transition-colors group">
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0 group-hover:bg-[#E23232]/10 transition-colors">
                        <User className="w-5 h-5 text-foreground/60 dark:text-foreground/40 group-hover:text-[#E23232] transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <p className="font-medium text-foreground truncate">{washer.full_name}</p>
                          {washer.stripe_account_id ? (
                            <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />Stripe
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full shrink-0">
                              <AlertCircle className="w-2.5 h-2.5" />No Stripe
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground/50 dark:text-foreground/25 truncate mt-0.5 font-mono">{washer.email}</p>
                        <p className="text-[10px] text-foreground/50 dark:text-foreground/20 mt-1">{washer.completed_jobs} jobs pending payout</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 shrink-0">
                      <div className="text-right">
                        <p className={`text-xl font-bold ${washer.pending_earnings > 0 ? 'text-[#E23232]' : 'text-foreground/50 dark:text-foreground/20'}`}>
                          ${(washer.pending_earnings / 100).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-foreground/50 dark:text-foreground/25 uppercase tracking-widest">pending</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handlePayout(washer.id)}
                        disabled={washer.pending_earnings === 0 || !washer.stripe_account_id || processingId === washer.id}
                        className="bg-[#E23232] hover:bg-[#E23232]/80 text-white disabled:opacity-20 rounded-xl px-5"
                      >
                        <Send className="w-3.5 h-3.5 mr-2" />
                        {processingId === washer.id ? 'Sending...' : 'Payout'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Stats sidebar */}
        <div className="space-y-4 hidden lg:block">
          <div className="bg-surface border border-border rounded-2xl p-5 border-l-4 border-l-[#E23232]">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-[#E23232]" />
              <span className="text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest">Total Pending</span>
            </div>
            <p className="text-2xl font-bold text-[#E23232]">${(totalPending / 100).toFixed(2)}</p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <h3 className="text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest mb-4">Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Users className="w-4 h-4 text-blue-400" /></div>
                <span className="text-sm text-foreground/60 flex-1">Total washers</span>
                <span className="text-sm font-bold text-foreground">{washers.length}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-amber-400" /></div>
                <span className="text-sm text-foreground/60 flex-1">With pending</span>
                <span className="text-sm font-bold text-foreground">{withPending}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-green-400" /></div>
                <span className="text-sm text-foreground/60 flex-1">Stripe connected</span>
                <span className="text-sm font-bold text-foreground">{stripeConnected}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center"><DollarSign className="w-4 h-4 text-violet-400" /></div>
                <span className="text-sm text-foreground/60 flex-1">Jobs pending</span>
                <span className="text-sm font-bold text-foreground">{totalPaid}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
