'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { centsToDisplay, PLAN_LABELS } from '@/lib/pricing';
import {
  DollarSign, Users, UserCheck, CalendarDays,
  AlertTriangle, ChevronRight, Car, TrendingUp,
} from 'lucide-react';
import type { Booking, Vehicle } from '@/types';

export const dynamic = 'force-dynamic';

interface BookingWithVehicle extends Booking {
  vehicles: Vehicle;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeBookings: 0,
    washersOnline: 0,
    totalCustomers: 0,
    pendingApplications: 0,
    pendingBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<BookingWithVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      // Parallel queries for dashboard stats
      const [
        revenueRes,
        activeRes,
        washersRes,
        customersRes,
        applicationsRes,
        pendingRes,
        recentRes,
      ] = await Promise.all([
        supabase.from('bookings').select('total_price').in('status', ['completed', 'paid']),
        supabase.from('bookings').select('id', { count: 'exact' }).in('status', ['assigned', 'en_route', 'arrived', 'washing']),
        supabase.from('washer_profiles').select('id', { count: 'exact' }).eq('is_online', true),
        supabase.from('customer_profiles').select('id', { count: 'exact' }),
        supabase.from('washer_profiles').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('bookings').select('*, vehicles(*)').order('created_at', { ascending: false }).limit(10),
      ]);

      const totalRevenue = (revenueRes.data || []).reduce((sum, b) => sum + (b.total_price || 0), 0);

      setStats({
        totalRevenue,
        activeBookings: activeRes.count || 0,
        washersOnline: washersRes.count || 0,
        totalCustomers: customersRes.count || 0,
        pendingApplications: applicationsRes.count || 0,
        pendingBookings: pendingRes.count || 0,
      });

      if (recentRes.data) setRecentBookings(recentRes.data as BookingWithVehicle[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 md:pt-0 pt-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 bg-white/5 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 md:pt-0 pt-14 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white tracking-tight">Dashboard</h1>
          <p className="text-white/30 text-sm mt-1">Platform overview and analytics</p>
        </div>
        <div className="flex items-center gap-2 bg-[#111] border border-white/[0.08] rounded-full px-4 py-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-xs font-medium">Live</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        <div className="stat-card bg-[#111] border border-white/[0.08] rounded-2xl p-5 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400/50" />
          </div>
          <p className="text-3xl font-bold text-[#E23232]">{centsToDisplay(stats.totalRevenue)}</p>
          <p className="text-white/30 text-xs mt-2 uppercase tracking-wider">Total Revenue</p>
        </div>

        <div className="stat-card bg-[#111] border border-white/[0.08] rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-400" />
            </div>
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.activeBookings}</p>
          <p className="text-white/30 text-xs mt-2 uppercase tracking-wider">Active Washes</p>
        </div>

        <div className="stat-card bg-[#111] border border-white/[0.08] rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.washersOnline}</p>
          <p className="text-white/30 text-xs mt-2 uppercase tracking-wider">Washers Online</p>
        </div>

        <div className="stat-card bg-[#111] border border-white/[0.08] rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalCustomers}</p>
          <p className="text-white/30 text-xs mt-2 uppercase tracking-wider">Customers</p>
        </div>
      </div>

      {/* Alerts */}
      {(stats.pendingApplications > 0 || stats.pendingBookings > 0) && (
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {stats.pendingApplications > 0 && (
            <Link href="/admin/washers">
              <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-4 border-l-4 border-l-amber-500 hover:border-white/[0.15] transition-colors cursor-pointer group mb-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {stats.pendingApplications} washer application{stats.pendingApplications > 1 ? 's' : ''} pending review
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">Requires your attention</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-amber-400 transition-colors" />
                </div>
              </div>
            </Link>
          )}
          {stats.pendingBookings > 0 && (
            <Link href="/admin/bookings">
              <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-4 border-l-4 border-l-yellow-500 hover:border-white/[0.15] transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {stats.pendingBookings} booking{stats.pendingBookings > 1 ? 's' : ''} awaiting washer assignment
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">Auto-assignment in progress</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-yellow-400 transition-colors" />
                </div>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Recent Bookings */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-[#E23232] text-xs font-medium hover:text-[#E23232]/80 transition-colors flex items-center gap-1 group">
            View all
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/[0.06]">
            {recentBookings.map((b, idx) => (
              <div
                key={b.id}
                className="p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-colors duration-200 group"
                style={{ animationDelay: `${0.05 * idx}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0 group-hover:bg-white/[0.06] transition-colors">
                  <Car className="w-4 h-4 text-white/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium truncate">
                      {PLAN_LABELS[b.wash_plan]}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        b.status === 'pending' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5' :
                        ['assigned', 'en_route', 'arrived', 'washing'].includes(b.status) ? 'text-blue-400 border-blue-500/30 bg-blue-500/5' :
                        ['completed', 'paid'].includes(b.status) ? 'text-green-400 border-green-500/30 bg-green-500/5' :
                        'text-white/40 border-white/20'
                      }`}
                    >
                      {b.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-white/25 text-xs mt-1 truncate">
                    {b.vehicles?.year} {b.vehicles?.make} {b.vehicles?.model} · {b.service_address}
                  </p>
                </div>
                <span className="text-white font-semibold text-sm whitespace-nowrap">
                  {centsToDisplay(b.total_price)}
                </span>
                <span className="text-white/20 text-xs whitespace-nowrap font-mono">
                  {new Date(b.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {recentBookings.length === 0 && (
              <div className="p-12 text-center">
                <Car className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">No bookings yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
