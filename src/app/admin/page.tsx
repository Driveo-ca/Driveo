'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { centsToDisplay, PLAN_LABELS } from '@/lib/pricing';
import {
  DollarSign, Users, UserCheck, CalendarDays, Car,
  TrendingUp, TrendingDown, ChevronRight, AlertTriangle,
  RefreshCw, Clock, Star, Zap, Activity, ArrowUpRight,
  BarChart3, CircleDot,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

type Period = 'today' | 'week' | 'month';

interface DailyRevenue { date: string; label: string; amount: number; count: number }
interface StatusCount { status: string; count: number; color: string; label: string }
interface TopWasher { id: string; name: string; rating: number; jobs: number; earnings: number; online: boolean }
interface ActivityItem { id: string; type: string; title: string; detail: string; time: string; color: string }

function startOf(period: Period, offset = 0) {
  const d = new Date();
  if (period === 'today') {
    d.setDate(d.getDate() - offset);
    d.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    const day = d.getDay();
    d.setDate(d.getDate() - day - offset * 7);
    d.setHours(0, 0, 0, 0);
  } else {
    d.setMonth(d.getMonth() - offset, 1);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>('week');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [currentRevenue, setCurrentRevenue] = useState(0);
  const [prevRevenue, setPrevRevenue] = useState(0);
  const [currentBookings, setCurrentBookings] = useState(0);
  const [prevBookings, setPrevBookings] = useState(0);
  const [activeBookings, setActiveBookings] = useState(0);
  const [washersOnline, setWashersOnline] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [prevCustomers, setPrevCustomers] = useState(0);
  const [pendingApps, setPendingApps] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);

  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
  const [topWashers, setTopWashers] = useState<TopWasher[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const load = useCallback(async (p: Period) => {
    const supabase = createClient();
    const now = new Date();
    const periodStart = startOf(p, 0);
    const prevStart = startOf(p, 1);

    const [
      curRevRes, prevRevRes,
      curBookRes, prevBookRes,
      activeRes, onlineRes,
      custRes, prevCustRes,
      appsRes, pendRes,
      allBookingsRes,
      washerRes,
      recentRes,
    ] = await Promise.all([
      supabase.from('bookings').select('total_price').in('status', ['completed', 'paid']).gte('created_at', periodStart.toISOString()),
      supabase.from('bookings').select('total_price').in('status', ['completed', 'paid']).gte('created_at', prevStart.toISOString()).lt('created_at', periodStart.toISOString()),
      supabase.from('bookings').select('id', { count: 'exact' }).gte('created_at', periodStart.toISOString()),
      supabase.from('bookings').select('id', { count: 'exact' }).gte('created_at', prevStart.toISOString()).lt('created_at', periodStart.toISOString()),
      supabase.from('bookings').select('id', { count: 'exact' }).in('status', ['assigned', 'en_route', 'arrived', 'washing']),
      supabase.from('washer_profiles').select('id', { count: 'exact' }).eq('is_online', true),
      supabase.from('customer_profiles').select('id', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer').lt('created_at', periodStart.toISOString()),
      supabase.from('washer_profiles').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('bookings').select('total_price, created_at, status').gte('created_at', new Date(now.getTime() - 7 * 86400000).toISOString()),
      supabase.from('washer_profiles').select('id, rating_avg, jobs_completed, is_online, profiles(full_name)').eq('status', 'approved').order('jobs_completed', { ascending: false }).limit(5),
      supabase.from('bookings').select('id, status, wash_plan, created_at, service_address, vehicles(make, model)').order('created_at', { ascending: false }).limit(8),
    ]);

    const curRev = (curRevRes.data || []).reduce((s, b) => s + (b.total_price || 0), 0);
    const prvRev = (prevRevRes.data || []).reduce((s, b) => s + (b.total_price || 0), 0);
    setCurrentRevenue(curRev);
    setPrevRevenue(prvRev);
    setCurrentBookings(curBookRes.count || 0);
    setPrevBookings(prevBookRes.count || 0);
    setActiveBookings(activeRes.count || 0);
    setWashersOnline(onlineRes.count || 0);
    setTotalCustomers(custRes.count || 0);
    setPrevCustomers(prevCustRes.count || 0);
    setPendingApps(appsRes.count || 0);
    setPendingBookings(pendRes.count || 0);

    // Daily revenue chart
    const dayMap: Record<string, { amount: number; count: number }> = {};
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().split('T')[0];
      dayMap[key] = { amount: 0, count: 0 };
    }
    (allBookingsRes.data || []).forEach((b) => {
      const key = new Date(b.created_at).toISOString().split('T')[0];
      if (dayMap[key]) {
        if (['completed', 'paid'].includes(b.status)) dayMap[key].amount += b.total_price || 0;
        dayMap[key].count++;
      }
    });
    setDailyRevenue(Object.entries(dayMap).map(([date, v]) => ({
      date, label: dayLabels[new Date(date).getDay()], amount: v.amount, count: v.count,
    })));

    // Status breakdown
    const statusMap: Record<string, number> = {};
    (allBookingsRes.data || []).forEach((b) => { statusMap[b.status] = (statusMap[b.status] || 0) + 1; });
    const statusConfig: Record<string, { color: string; label: string }> = {
      completed: { color: 'bg-green-500', label: 'Completed' },
      paid: { color: 'bg-emerald-400', label: 'Paid' },
      washing: { color: 'bg-violet-500', label: 'Washing' },
      arrived: { color: 'bg-violet-400', label: 'Arrived' },
      en_route: { color: 'bg-blue-500', label: 'En Route' },
      assigned: { color: 'bg-blue-400', label: 'Assigned' },
      pending: { color: 'bg-amber-500', label: 'Pending' },
      cancelled: { color: 'bg-red-500', label: 'Cancelled' },
    };
    setStatusCounts(
      Object.entries(statusMap)
        .map(([status, count]) => ({ status, count, color: statusConfig[status]?.color || 'bg-gray-500', label: statusConfig[status]?.label || status }))
        .sort((a, b) => b.count - a.count)
    );

    // Top washers
    if (washerRes.data) {
      const washerIds = washerRes.data.map((w) => w.id);
      const { data: earningsData } = await supabase
        .from('bookings').select('washer_id, washer_payout').in('washer_id', washerIds).in('status', ['completed', 'paid']);
      const earningsMap: Record<string, number> = {};
      (earningsData || []).forEach((b) => { earningsMap[b.washer_id] = (earningsMap[b.washer_id] || 0) + (b.washer_payout || 0); });

      setTopWashers(washerRes.data.map((w) => {
        const profile = Array.isArray(w.profiles) ? w.profiles[0] : w.profiles;
        return {
          id: w.id, name: (profile as { full_name: string })?.full_name || 'Unknown',
          rating: w.rating_avg || 0, jobs: w.jobs_completed || 0,
          earnings: earningsMap[w.id] || 0, online: w.is_online || false,
        };
      }));
    }

    // Activity feed
    if (recentRes.data) {
      const activityColors: Record<string, string> = {
        pending: 'bg-amber-500', assigned: 'bg-blue-500', en_route: 'bg-blue-400',
        arrived: 'bg-violet-500', washing: 'bg-violet-400', completed: 'bg-green-500',
        paid: 'bg-emerald-500', cancelled: 'bg-red-500',
      };
      const activityTitles: Record<string, string> = {
        pending: 'New booking', assigned: 'Washer assigned', en_route: 'Washer en route',
        arrived: 'Washer arrived', washing: 'Wash in progress', completed: 'Wash completed',
        paid: 'Payment captured', cancelled: 'Booking cancelled',
      };
      setActivity(recentRes.data.map((b) => {
        const v = Array.isArray(b.vehicles) ? b.vehicles[0] : b.vehicles;
        return {
          id: b.id, type: b.status, title: activityTitles[b.status] || b.status,
          detail: `${PLAN_LABELS[b.wash_plan as keyof typeof PLAN_LABELS] || b.wash_plan} — ${(v as { make: string; model: string })?.make || ''} ${(v as { make: string; model: string })?.model || ''}`,
          time: relativeTime(b.created_at), color: activityColors[b.status] || 'bg-gray-500',
        };
      }));
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(period); }, [period, load]);

  const pctChange = (cur: number, prev: number) => {
    if (prev === 0) return cur > 0 ? 100 : 0;
    return Math.round(((cur - prev) / prev) * 100);
  };
  const revChange = pctChange(currentRevenue, prevRevenue);
  const bookChange = pctChange(currentBookings, prevBookings);
  const custGrowth = totalCustomers - prevCustomers;
  const maxDailyRev = Math.max(...dailyRevenue.map((d) => d.amount), 1);
  const totalStatusCount = statusCounts.reduce((s, c) => s + c.count, 0) || 1;
  const periodLabel = period === 'today' ? 'vs yesterday' : period === 'week' ? 'vs last week' : 'vs last month';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-36 bg-foreground/5 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 bg-foreground/5 rounded-2xl" />
          <Skeleton className="h-80 bg-foreground/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display text-foreground tracking-tight">Dashboard</h1>
          <p className="text-foreground/50 text-xs sm:text-sm mt-1">Real-time platform monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface border border-border rounded-xl p-1 gap-0.5">
            {(['today', 'week', 'month'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => { setPeriod(p); setRefreshing(true); }}
                className={`px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg transition-all duration-200 ${
                  period === p ? 'bg-[#E23232] text-white shadow-sm' : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                {p === 'today' ? 'Today' : p === 'week' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setRefreshing(true); load(period); }}
            className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-foreground/60 dark:text-foreground/40 hover:text-foreground transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
            <Activity className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400 text-xs font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        <div className="bg-surface border border-border rounded-2xl p-3 sm:p-5 col-span-2 lg:col-span-1 relative overflow-hidden group hover:border-[#E23232]/30 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#E23232]/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#E23232]/10 flex items-center justify-center"><DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E23232]" /></div>
              <span className="text-[9px] sm:text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest">Revenue</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#E23232]">{centsToDisplay(currentRevenue)}</p>
            <div className="flex items-center gap-1 mt-1.5 sm:mt-2">
              {revChange >= 0 ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
              <span className={`text-[10px] font-medium ${revChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{revChange >= 0 ? '+' : ''}{revChange}%</span>
              <span className="text-[10px] text-foreground/55 dark:text-foreground/30 hidden sm:inline">{periodLabel}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-3 sm:p-5 hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" /></div>
            <span className="text-[9px] sm:text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest">Bookings</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{currentBookings}</p>
          <div className="flex items-center gap-1 mt-1.5 sm:mt-2">
            {bookChange >= 0 ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
            <span className={`text-[10px] font-medium ${bookChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{bookChange >= 0 ? '+' : ''}{bookChange}%</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-3 sm:p-5 hover:border-violet-500/30 transition-colors">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-500/10 flex items-center justify-center"><Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" /></div>
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{activeBookings}</p>
          <p className="text-[9px] sm:text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest mt-1.5 sm:mt-2">Active Now</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-3 sm:p-5 hover:border-green-500/30 transition-colors">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" /></div>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{washersOnline}</p>
          <p className="text-[9px] sm:text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest mt-1.5 sm:mt-2">Washers Online</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-3 sm:p-5 hover:border-amber-500/30 transition-colors">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /></div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{totalCustomers}</p>
          <div className="flex items-center gap-1 mt-1.5 sm:mt-2">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-[10px] text-green-400 font-medium">+{custGrowth} new</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(pendingApps > 0 || pendingBookings > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pendingApps > 0 && (
            <Link href="/admin/washers" className="group">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 hover:bg-amber-500/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-amber-400" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{pendingApps} pending washer application{pendingApps > 1 ? 's' : ''}</p>
                  <p className="text-xs text-foreground/60 dark:text-foreground/40 mt-0.5">Requires review</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400 transition-colors" />
              </div>
            </Link>
          )}
          {pendingBookings > 0 && (
            <Link href="/admin/bookings" className="group">
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4 hover:bg-blue-500/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0"><Clock className="w-5 h-5 text-blue-400" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{pendingBookings} booking{pendingBookings > 1 ? 's' : ''} awaiting assignment</p>
                  <p className="text-xs text-foreground/60 dark:text-foreground/40 mt-0.5">Auto-assignment in progress</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-blue-400/50 group-hover:text-blue-400 transition-colors" />
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Charts + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 sm:gap-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Revenue Chart */}
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#E23232]/10 flex items-center justify-center"><BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E23232]" /></div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground">Revenue — Last 7 Days</h3>
                  <p className="text-[9px] sm:text-[10px] text-foreground/60 dark:text-foreground/40 mt-0.5 uppercase tracking-widest">Total: {centsToDisplay(dailyRevenue.reduce((s, d) => s + d.amount, 0))}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 h-36 sm:h-48">
              {dailyRevenue.map((day, i) => {
                const h = Math.max((day.amount / maxDailyRev) * 100, 4);
                const isToday = i === dailyRevenue.length - 1;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center group">
                    <span className="text-[10px] text-foreground/55 dark:text-foreground/30 font-mono opacity-0 group-hover:opacity-100 transition-opacity mb-1">{centsToDisplay(day.amount)}</span>
                    <div className="flex-1 w-full flex items-end">
                      <div
                        className={`w-full rounded-lg transition-all duration-500 ${isToday ? 'bg-[#E23232] shadow-[0_0_20px_rgba(226,50,50,0.3)]' : 'bg-[#E23232]/30 group-hover:bg-[#E23232]/60'}`}
                        style={{ height: `${h}%` }}
                      />
                    </div>
                    <div className="text-center mt-2">
                      <span className={`text-[10px] font-medium ${isToday ? 'text-[#E23232]' : 'text-foreground/60 dark:text-foreground/40'}`}>{day.label}</span>
                      <p className="text-[9px] text-foreground/50 dark:text-foreground/20">{day.count} jobs</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><CircleDot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" /></div>
              <h3 className="text-xs sm:text-sm font-semibold text-foreground">Booking Status — Last 7 Days</h3>
            </div>
            <div className="space-y-3">
              {statusCounts.map((s) => (
                <div key={s.status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${s.color}`} />
                      <span className="text-xs text-foreground/60">{s.label}</span>
                    </div>
                    <span className="text-xs font-mono text-foreground/60 dark:text-foreground/40">{s.count}</span>
                  </div>
                  <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.color} transition-all duration-700`} style={{ width: `${(s.count / totalStatusCount) * 100}%` }} />
                  </div>
                </div>
              ))}
              {statusCounts.length === 0 && <p className="text-sm text-foreground/55 dark:text-foreground/30 text-center py-4">No bookings in this period</p>}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Top Washers */}
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /></div>
                <h3 className="text-xs sm:text-sm font-semibold text-foreground">Top Washers</h3>
              </div>
              <Link href="/admin/washers" className="text-[10px] text-[#E23232] hover:text-[#E23232]/70 transition-colors uppercase tracking-widest">View all</Link>
            </div>
            <div className="space-y-3">
              {topWashers.map((w, i) => (
                <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-foreground/10 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-xs font-bold text-foreground/60 dark:text-foreground/40 group-hover:bg-[#E23232]/10 group-hover:text-[#E23232] transition-colors">#{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{w.name}</p>
                      {w.online && <div className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-foreground/60 dark:text-foreground/40 flex items-center gap-1"><Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /> {w.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-foreground/55 dark:text-foreground/30">{w.jobs} jobs</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-green-400">{centsToDisplay(w.earnings)}</p>
                </div>
              ))}
              {topWashers.length === 0 && <p className="text-sm text-foreground/55 dark:text-foreground/30 text-center py-4">No approved washers</p>}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-500/10 flex items-center justify-center"><Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" /></div>
                <h3 className="text-xs sm:text-sm font-semibold text-foreground">Recent Activity</h3>
              </div>
              <Link href="/admin/bookings" className="text-[10px] text-[#E23232] hover:text-[#E23232]/70 transition-colors uppercase tracking-widest">View all</Link>
            </div>
            <div className="space-y-1">
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-foreground/[0.03] transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground/70">{a.title}</p>
                    <p className="text-[10px] text-foreground/55 dark:text-foreground/30 truncate mt-0.5">{a.detail}</p>
                  </div>
                  <span className="text-[10px] text-foreground/50 dark:text-foreground/25 shrink-0">{a.time}</span>
                </div>
              ))}
              {activity.length === 0 && <p className="text-sm text-foreground/55 dark:text-foreground/30 text-center py-4">No recent activity</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays, color: 'text-blue-400 bg-blue-500/10' },
          { href: '/admin/washers', label: 'Washers', icon: UserCheck, color: 'text-violet-400 bg-violet-500/10' },
          { href: '/admin/customers', label: 'Customers', icon: Users, color: 'text-amber-400 bg-amber-500/10' },
          { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, color: 'text-green-400 bg-green-500/10' },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="group">
            <div className="bg-surface border border-border rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 hover:border-foreground/10 transition-colors active:scale-[0.97]">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${link.color}`}><link.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></div>
              <span className="text-xs sm:text-sm text-foreground/60 group-hover:text-foreground transition-colors truncate">{link.label}</span>
              <ChevronRight className="w-4 h-4 text-foreground/35 dark:text-foreground/15 ml-auto shrink-0 group-hover:text-foreground/60 dark:group-hover:text-foreground/60 dark:text-foreground/40 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
