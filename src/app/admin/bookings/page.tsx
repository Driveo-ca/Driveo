'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { centsToDisplay, PLAN_LABELS } from '@/lib/pricing';
import {
  CalendarDays, Car, DollarSign, Clock, Zap,
  CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react';
import type { Booking, Vehicle } from '@/types';

export const dynamic = 'force-dynamic';

interface BookingFull extends Booking { vehicles: Vehicle }

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    assigned: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    en_route: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    arrived: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    washing: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    completed: 'text-green-400 border-green-500/30 bg-green-500/10',
    paid: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    cancelled: 'text-red-400 border-red-500/30 bg-red-500/10',
    disputed: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  };
  return map[status] || 'text-foreground/50 border-border';
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      let query = supabase.from('bookings').select('*, vehicles(*)').order('created_at', { ascending: false }).limit(100);
      if (filter === 'active') query = query.in('status', ['assigned', 'en_route', 'arrived', 'washing']);
      else if (filter !== 'all') query = query.eq('status', filter);
      const { data } = await query;
      if (data) setBookings(data as BookingFull[]);
      setLoading(false);
    }
    setLoading(true);
    load();
  }, [filter]);

  // Stats
  const totalRev = bookings.filter((b) => ['completed', 'paid'].includes(b.status)).reduce((s, b) => s + (b.total_price || 0), 0);
  const activeCount = bookings.filter((b) => ['assigned', 'en_route', 'arrived', 'washing'].includes(b.status)).length;
  const completedCount = bookings.filter((b) => ['completed', 'paid'].includes(b.status)).length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;

  return (
    <div className="space-y-8 md:pt-0 pt-14">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E23232]/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-[#E23232]" />
          </div>
          <div>
            <h1 className="text-3xl font-display text-foreground tracking-tight">Bookings</h1>
            <p className="text-foreground/50 text-sm mt-0.5">{bookings.length} total bookings</p>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Table */}
        <div className="space-y-5">
          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-surface rounded-full p-1 border border-border gap-0.5">
              {[
                { value: 'all', label: 'All' },
                { value: 'pending', label: 'Pending' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'paid', label: 'Paid' },
                { value: 'cancelled', label: 'Cancelled' },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs rounded-full px-4 py-1.5 data-[state=active]:bg-[#E23232] data-[state=active]:text-white transition-colors text-foreground/50 hover:text-foreground/70"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 bg-foreground/5 rounded-2xl" />)}</div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-[10px] text-foreground/40 uppercase tracking-widest font-medium">Booking</th>
                      <th className="text-left p-4 text-[10px] text-foreground/40 uppercase tracking-widest font-medium">Plan</th>
                      <th className="text-left p-4 text-[10px] text-foreground/40 uppercase tracking-widest font-medium hidden md:table-cell">Vehicle</th>
                      <th className="text-left p-4 text-[10px] text-foreground/40 uppercase tracking-widest font-medium">Status</th>
                      <th className="text-right p-4 text-[10px] text-foreground/40 uppercase tracking-widest font-medium">Amount</th>
                      <th className="text-right p-4 text-[10px] text-foreground/40 uppercase tracking-widest font-medium hidden md:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-foreground/[0.03] transition-colors group">
                        <td className="p-4">
                          <span className="text-foreground/40 font-mono text-xs">#{b.id.slice(0, 8)}</span>
                          <p className="text-[10px] text-foreground/25 mt-0.5 hidden md:block">{b.is_instant ? 'Instant' : 'Scheduled'}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-foreground/80 font-medium text-xs">{PLAN_LABELS[b.wash_plan]}</span>
                          <p className="text-[10px] text-foreground/25 mt-0.5">Dirt: {b.dirt_level}/10</p>
                        </td>
                        <td className="p-4 text-foreground/40 text-xs hidden md:table-cell">
                          {b.vehicles?.year} {b.vehicles?.make} {b.vehicles?.model}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={`text-[10px] rounded-full px-2.5 py-0.5 ${statusBadge(b.status)}`}>
                            {b.status === 'en_route' ? 'en route' : b.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-foreground font-semibold text-xs">{centsToDisplay(b.total_price)}</span>
                        </td>
                        <td className="p-4 text-right text-foreground/25 text-[10px] font-mono hidden md:table-cell">
                          {new Date(b.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center">
                          <CalendarDays className="w-8 h-8 text-foreground/10 mx-auto mb-3" />
                          <p className="text-foreground/40 text-sm">No bookings found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Stats sidebar */}
        <div className="space-y-4 hidden lg:block">
          <div className="bg-surface border border-border rounded-2xl p-5 border-l-4 border-l-[#E23232]">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-[#E23232]" />
              <span className="text-[10px] text-foreground/40 uppercase tracking-widest">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-[#E23232]">{centsToDisplay(totalRev)}</p>
            <p className="text-[10px] text-foreground/30 mt-1">{completedCount} completed bookings</p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <h3 className="text-[10px] text-foreground/40 uppercase tracking-widest mb-4">Status Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Active', count: activeCount, icon: Zap, color: 'text-violet-400 bg-violet-500/10' },
                { label: 'Pending', count: pendingCount, icon: Clock, color: 'text-amber-400 bg-amber-500/10' },
                { label: 'Completed', count: completedCount, icon: CheckCircle2, color: 'text-green-400 bg-green-500/10' },
                { label: 'Cancelled', count: cancelledCount, icon: XCircle, color: 'text-red-400 bg-red-500/10' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color.split(' ')[1]}`}>
                    <s.icon className={`w-4 h-4 ${s.color.split(' ')[0]}`} />
                  </div>
                  <span className="text-sm text-foreground/60 flex-1">{s.label}</span>
                  <span className="text-sm font-bold text-foreground">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <h3 className="text-[10px] text-foreground/40 uppercase tracking-widest mb-4">Plan Mix</h3>
            <div className="space-y-2">
              {(['regular', 'interior_exterior', 'detailing'] as const).map((plan) => {
                const count = bookings.filter((b) => b.wash_plan === plan).length;
                const pct = bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0;
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-foreground/50">{PLAN_LABELS[plan]}</span>
                      <span className="text-[10px] text-foreground/30 font-mono">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#E23232] transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
