'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Car, DollarSign, ChevronRight } from 'lucide-react';
import type { Booking } from '@/types';

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  assigned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  en_route: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  arrived: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  washing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  paid: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  disputed: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const statusBorderLeft: Record<string, string> = {
  pending: 'border-l-yellow-500/60',
  assigned: 'border-l-blue-500/60',
  en_route: 'border-l-blue-500/60',
  arrived: 'border-l-purple-500/60',
  washing: 'border-l-purple-500/60',
  completed: 'border-l-green-500/60',
  paid: 'border-l-green-500/60',
  cancelled: 'border-l-red-500/60',
  disputed: 'border-l-orange-500/60',
};

const planLabel: Record<string, string> = {
  regular: 'Regular',
  interior_exterior: 'Interior & Exterior',
  detailing: 'Detailing',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchBookings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bookings')
        .select('*, vehicles(make, model, year, type)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setBookings(data as Booking[]);
      }
      setLoading(false);
    }

    fetchBookings();
  }, [supabase]);

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display text-white tracking-tight">My Bookings</h1>
            <p className="text-white/40 text-sm mt-1">Your wash history and active bookings</p>
          </div>
          {bookings.length > 0 && (
            <div className="bg-[#111] border border-white/[0.08] rounded-full px-3 py-1.5">
              <span className="text-xs text-white/60 font-medium">{bookings.length} total</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-36 w-full bg-white/5 rounded-2xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-12">
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl">
              <div className="py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
                  <Calendar className="w-7 h-7 text-white/20" />
                </div>
                <p className="text-white/40 text-sm font-medium">No bookings yet</p>
                <p className="text-white/20 text-xs mt-1.5">Your wash history will appear here</p>
                <Link href="/app/book">
                  <button className="mt-6 px-5 py-2.5 rounded-xl bg-[#E23232] hover:bg-[#c92a2a] text-white text-sm font-medium transition-colors">
                    Book Your First Wash
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="stagger-children space-y-3">
            {bookings.map((booking) => {
              const vehicle = (booking as any).vehicles;
              return (
                <Link
                  key={booking.id}
                  href={`/app/track/${booking.id}`}
                  className="block"
                >
                  <div
                    className={`bg-[#111] border border-white/[0.08] rounded-2xl cursor-pointer transition-all duration-300 hover:border-white/[0.12] border-l-2 ${statusBorderLeft[booking.status] || 'border-l-white/10'}`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge
                          variant="outline"
                          className={`${statusColor[booking.status] || 'border-white/20 text-white/60'} text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-lg`}
                        >
                          {booking.status.replace('_', ' ')}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-white/20 mt-0.5" />
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 text-sm">
                          <span className="text-[#E23232] font-semibold">
                            {planLabel[booking.wash_plan] || booking.wash_plan}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-white/40 text-xs">
                            Dirt Level {booking.dirt_level}
                          </span>
                        </div>

                        {vehicle && (
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <Car className="w-3.5 h-3.5 text-white/30" />
                            <span>
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                          <div className="flex items-center gap-2 text-white/40">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs">
                              {new Date(booking.created_at).toLocaleDateString('en-CA', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-white font-semibold text-sm">
                            <DollarSign className="w-3.5 h-3.5 text-white/60" />
                            {(booking.total_price / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
