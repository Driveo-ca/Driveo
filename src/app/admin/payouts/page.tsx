'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Send, User, AlertCircle } from 'lucide-react';

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
  const supabase = createClient();

  useEffect(() => {
    async function fetchPayouts() {
      // Fetch washers with their completed but unpaid bookings
      const { data: washerData, error: washerError } = await supabase
        .from('profiles')
        .select('id, full_name, email, washer_profiles(stripe_account_id)')
        .eq('role', 'washer');

      if (washerError || !washerData) {
        setLoading(false);
        return;
      }

      // For each washer, calculate pending earnings
      const payouts: WasherPayout[] = [];

      for (const washer of washerData) {
        const { data: bookings } = await supabase
          .from('bookings')
          .select('washer_payout')
          .eq('washer_id', washer.id)
          .eq('status', 'completed');

        const pendingEarnings = (bookings || []).reduce(
          (sum: number, b: { washer_payout: number }) => sum + b.washer_payout,
          0
        );

        const wp = Array.isArray(washer.washer_profiles)
          ? washer.washer_profiles[0]
          : washer.washer_profiles;

        payouts.push({
          id: washer.id,
          full_name: washer.full_name,
          email: washer.email,
          stripe_account_id: wp?.stripe_account_id || null,
          pending_earnings: pendingEarnings,
          completed_jobs: (bookings || []).length,
        });
      }

      // Sort by pending earnings descending
      payouts.sort((a, b) => b.pending_earnings - a.pending_earnings);
      setWashers(payouts);
      setLoading(false);
    }

    fetchPayouts();
  }, [supabase]);

  const handlePayout = async (washerId: string) => {
    setProcessingId(washerId);

    // In production, this would call /api/admin/payouts to trigger Stripe Connect transfer
    const response = await fetch('/api/admin/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ washer_id: washerId }),
    });

    if (response.ok) {
      // Update the local state — mark earnings as paid
      setWashers((prev) =>
        prev.map((w) =>
          w.id === washerId
            ? { ...w, pending_earnings: 0, completed_jobs: 0 }
            : w
        )
      );
    }

    setProcessingId(null);
  };

  const totalPending = washers.reduce((sum, w) => sum + w.pending_earnings, 0);

  return (
    <div className="space-y-8 md:pt-0 pt-14 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E23232]/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-[#E23232]" />
          </div>
          <div>
            <h1 className="text-3xl font-display text-white tracking-tight">Payouts</h1>
            <p className="text-white/30 text-sm mt-0.5">Manage washer earnings and transfers</p>
          </div>
        </div>
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl px-5 py-3 border-l-4 border-l-[#E23232]">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Total Pending</p>
          <p className="text-xl font-bold text-[#E23232] mt-0.5">
            ${(totalPending / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in-up">
        <div className="stat-card bg-[#111] border border-white/[0.08] rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{washers.length}</p>
          <p className="text-[10px] text-white/25 uppercase tracking-widest mt-1">Washers</p>
        </div>
        <div className="stat-card bg-[#111] border border-white/[0.08] rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{washers.filter(w => w.pending_earnings > 0).length}</p>
          <p className="text-[10px] text-white/25 uppercase tracking-widest mt-1">With Pending</p>
        </div>
        <div className="stat-card bg-[#111] border border-white/[0.08] rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{washers.filter(w => w.stripe_account_id).length}</p>
          <p className="text-[10px] text-white/25 uppercase tracking-widest mt-1">Stripe Connected</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-white/5 rounded-2xl" />
          ))}
        </div>
      ) : washers.length === 0 ? (
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7 text-white/10" />
          </div>
          <p className="text-white/30 text-sm">No washers found</p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {washers.map((washer) => (
            <div
              key={washer.id}
              className="bg-[#111] border border-white/[0.08] rounded-2xl hover:border-white/[0.15] transition-colors duration-200 group animate-fade-in-up"
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0 group-hover:bg-[#E23232]/10 transition-colors">
                      <User className="w-5 h-5 text-white/30 group-hover:text-[#E23232] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <p className="font-medium text-white">
                          {washer.full_name}
                        </p>
                        {washer.stripe_account_id ? (
                          <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            Stripe
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-2.5 h-2.5" />
                            No Stripe
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/20 truncate mt-0.5 font-mono">
                        {washer.email}
                      </p>
                      <p className="text-xs text-white/15 mt-1">
                        {washer.completed_jobs} completed jobs pending payout
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <p className={`text-xl font-bold ${washer.pending_earnings > 0 ? 'text-[#E23232]' : 'text-white/20'}`}>
                        ${(washer.pending_earnings / 100).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-white/20 uppercase tracking-widest">pending</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handlePayout(washer.id)}
                      disabled={
                        washer.pending_earnings === 0 ||
                        !washer.stripe_account_id ||
                        processingId === washer.id
                      }
                      className="bg-[#E23232] hover:bg-[#E23232]/80 text-white disabled:opacity-20 rounded-xl disabled:shadow-none transition-colors px-5"
                    >
                      <Send className="w-3.5 h-3.5 mr-2" />
                      {processingId === washer.id ? 'Sending...' : 'Payout'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
