'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Car,
} from 'lucide-react';

interface EarningsJob {
  id: string;
  wash_plan: string;
  washer_payout: number;
  status: string;
  wash_completed_at: string | null;
  created_at: string;
  vehicles: {
    make: string;
    model: string;
    year: number;
  } | null;
}

const planLabel: Record<string, string> = {
  regular: 'Regular',
  interior_exterior: 'Interior & Exterior',
  detailing: 'Detailing',
};

export default function WasherEarningsPage() {
  const [jobs, setJobs] = useState<EarningsJob[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchEarnings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bookings')
        .select('id, wash_plan, washer_payout, status, wash_completed_at, created_at, vehicles(make, model, year)')
        .eq('washer_id', user.id)
        .in('status', ['completed', 'paid'])
        .order('wash_completed_at', { ascending: false });

      if (!error && data) {
        setJobs(data as unknown as EarningsJob[]);
      }
      setLoading(false);
    }

    fetchEarnings();
  }, [supabase]);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayEarnings = jobs
    .filter((j) => j.wash_completed_at && new Date(j.wash_completed_at) >= todayStart)
    .reduce((sum, j) => sum + j.washer_payout, 0);

  const monthEarnings = jobs
    .filter((j) => j.wash_completed_at && new Date(j.wash_completed_at) >= monthStart)
    .reduce((sum, j) => sum + j.washer_payout, 0);

  const allTimeEarnings = jobs.reduce((sum, j) => sum + j.washer_payout, 0);

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in-up">
      <h1 className="text-2xl font-display text-white tracking-tight mb-6">Earnings</h1>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-[#111] rounded-2xl" />
            ))}
          </div>
          <div className="h-64 w-full bg-[#111] rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="stat-card bg-[#111] border border-white/[0.08] rounded-2xl p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-[#0a0a0a] flex items-center justify-center mx-auto mb-2">
                <Clock className="w-4 h-4 text-white/40" />
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Today</p>
              <p className="text-[#E23232] font-bold text-lg">
                {formatCents(todayEarnings)}
              </p>
            </div>

            <div className="stat-card bg-[#111] border border-[#E23232]/20 rounded-2xl p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-[#E23232]/10 flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-4 h-4 text-[#E23232]/60" />
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">This Month</p>
              <p className="text-[#E23232] font-bold text-lg">
                {formatCents(monthEarnings)}
              </p>
            </div>

            <div className="stat-card bg-[#111] border border-white/[0.08] rounded-2xl p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-[#0a0a0a] flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-white/40" />
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">All Time</p>
              <p className="text-[#E23232] font-bold text-lg">
                {formatCents(allTimeEarnings)}
              </p>
            </div>
          </div>

          {/* Job History */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Job History</h2>
            <span className="text-[10px] text-white/20">{jobs.length} jobs</span>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-12 text-center">
              <p className="text-white/40 text-sm">No completed jobs yet</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-[#111] border border-white/[0.08] rounded-xl p-4 hover:border-white/[0.15] transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-sm font-semibold text-white">
                          {planLabel[job.wash_plan] || job.wash_plan}
                        </span>
                        {job.vehicles && (
                          <span className="text-xs text-white/30">
                            {job.vehicles.year} {job.vehicles.make}{' '}
                            {job.vehicles.model}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/30">
                        {job.wash_completed_at
                          ? new Date(job.wash_completed_at).toLocaleDateString(
                              'en-CA',
                              {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )
                          : 'Pending'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[#E23232] font-bold text-sm">
                      <DollarSign className="w-4 h-4" />
                      {(job.washer_payout / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
