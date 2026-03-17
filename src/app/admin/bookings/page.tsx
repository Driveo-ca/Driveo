'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { centsToDisplay, PLAN_LABELS } from '@/lib/pricing';
import type { Booking, Vehicle, Profile } from '@/types';

export const dynamic = 'force-dynamic';

interface BookingFull extends Booking {
  vehicles: Vehicle;
  profiles: Profile;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      let query = supabase
        .from('bookings')
        .select('*, vehicles(*)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data } = await query;
      if (data) setBookings(data as BookingFull[]);
      setLoading(false);
    }
    setLoading(true);
    load();
  }, [filter]);

  const statusBadgeClass = (status: string) => {
    if (status === 'pending') return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    if (['assigned', 'en_route', 'arrived', 'washing'].includes(status)) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    if (['completed', 'paid'].includes(status)) return 'text-green-400 border-green-500/30 bg-green-500/10';
    if (status === 'cancelled') return 'text-red-400 border-red-500/30 bg-red-500/10';
    return 'text-white/40';
  };

  return (
    <div className="space-y-8 md:pt-0 pt-14 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display text-white tracking-tight">Bookings</h1>
        <p className="text-white/30 text-sm mt-1">Manage and track all wash bookings</p>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-[#111] rounded-full p-1 border border-white/[0.08] gap-1">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'assigned', label: 'Active' },
            { value: 'completed', label: 'Done' },
            { value: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs rounded-full px-4 py-1.5 data-[state=active]:bg-[#E23232] data-[state=active]:text-white transition-colors duration-200 text-white/40 hover:text-white/60"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 bg-white/5 rounded-2xl" />)}
        </div>
      ) : (
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-4 text-white/30 text-[10px] uppercase tracking-widest font-medium">ID</th>
                  <th className="text-left p-4 text-white/30 text-[10px] uppercase tracking-widest font-medium">Plan</th>
                  <th className="text-left p-4 text-white/30 text-[10px] uppercase tracking-widest font-medium">Vehicle</th>
                  <th className="text-left p-4 text-white/30 text-[10px] uppercase tracking-widest font-medium">Dirt</th>
                  <th className="text-left p-4 text-white/30 text-[10px] uppercase tracking-widest font-medium">Status</th>
                  <th className="text-right p-4 text-white/30 text-[10px] uppercase tracking-widest font-medium">Total</th>
                  <th className="text-right p-4 text-white/30 text-[10px] uppercase tracking-widest font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {bookings.map((b, idx) => (
                  <tr
                    key={b.id}
                    className="bg-[#111] hover:bg-white/[0.03] transition-colors duration-200 group"
                    style={{ animationDelay: `${0.03 * idx}s` }}
                  >
                    <td className="p-4 text-white/30 font-mono text-xs">#{b.id.slice(0, 8)}</td>
                    <td className="p-4">
                      <span className="text-white/80 font-medium">{PLAN_LABELS[b.wash_plan]}</span>
                    </td>
                    <td className="p-4 text-white/50">{b.vehicles?.year} {b.vehicles?.make} {b.vehicles?.model}</td>
                    <td className="p-4">
                      <span className="text-white/40 font-mono text-xs bg-[#0a0a0a] border border-white/[0.06] rounded-full px-2.5 py-1">
                        {b.dirt_level}/10
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] rounded-full px-2.5 py-0.5 ${statusBadgeClass(b.status)}`}
                      >
                        {b.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4 text-right text-white/80 font-semibold">{centsToDisplay(b.total_price)}</td>
                    <td className="p-4 text-right text-white/20 text-xs font-mono">{new Date(b.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-white/20">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                          <svg className="w-6 h-6 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </div>
                        <p className="text-sm">No bookings found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
