'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { centsToDisplay, PLAN_LABELS } from '@/lib/pricing';
import {
  BarChart3, TrendingUp, DollarSign, Users, Car,
  Clock, MapPin, Star, ArrowUpRight, ExternalLink,
  Activity, Zap, Target, Repeat,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface DailyData { date: string; label: string; revenue: number; bookings: number }
interface PlanData { plan: string; label: string; count: number; revenue: number; color: string }
interface HourData { hour: number; count: number }
interface ZoneData { zone: string; count: number }

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-ZTT37BDKP4';

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  // Metrics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalWashers, setTotalWashers] = useState(0);
  const [repeatRate, setRepeatRate] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [revenuePerWasher, setRevenuePerWasher] = useState(0);

  // Charts
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [planData, setPlanData] = useState<PlanData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourData[]>([]);
  const [zoneData, setZoneData] = useState<ZoneData[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const cutoff = new Date(Date.now() - days * 86400000).toISOString();

      const [bookingsRes, allBookingsRes, custRes, washerRes, reviewsRes] = await Promise.all([
        supabase.from('bookings').select('total_price, washer_payout, wash_plan, created_at, service_address, customer_id, status')
          .gte('created_at', cutoff),
        supabase.from('bookings').select('customer_id, status').in('status', ['completed', 'paid']),
        supabase.from('customer_profiles').select('id', { count: 'exact' }),
        supabase.from('washer_profiles').select('id', { count: 'exact' }).eq('status', 'approved'),
        supabase.from('reviews').select('rating'),
      ]);

      const bookings = bookingsRes.data || [];
      const completed = bookings.filter((b) => ['completed', 'paid'].includes(b.status));
      const revenue = completed.reduce((s, b) => s + (b.total_price || 0), 0);
      const numCustomers = custRes.count || 0;
      const numWashers = washerRes.count || 0;

      setTotalRevenue(revenue);
      setTotalBookings(completed.length);
      setAvgOrderValue(completed.length > 0 ? Math.round(revenue / completed.length) : 0);
      setTotalCustomers(numCustomers);
      setTotalWashers(numWashers);
      setRevenuePerWasher(numWashers > 0 ? Math.round(revenue / numWashers) : 0);

      // Repeat rate
      const allCompleted = allBookingsRes.data || [];
      const customerBookings: Record<string, number> = {};
      allCompleted.forEach((b) => { customerBookings[b.customer_id] = (customerBookings[b.customer_id] || 0) + 1; });
      const uniqueCustomers = Object.keys(customerBookings).length;
      const repeatCustomers = Object.values(customerBookings).filter((c) => c > 1).length;
      setRepeatRate(uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0);

      // Average rating
      const reviews = reviewsRes.data || [];
      setAvgRating(reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0);

      // Daily data
      const dayMap: Record<string, { revenue: number; bookings: number }> = {};
      const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const key = d.toISOString().split('T')[0];
        dayMap[key] = { revenue: 0, bookings: 0 };
      }
      bookings.forEach((b) => {
        const key = new Date(b.created_at).toISOString().split('T')[0];
        if (dayMap[key]) {
          if (['completed', 'paid'].includes(b.status)) dayMap[key].revenue += b.total_price || 0;
          dayMap[key].bookings++;
        }
      });
      setDailyData(Object.entries(dayMap).map(([date, v]) => {
        const d = new Date(date);
        return { date, label: `${monthLabels[d.getMonth()]} ${d.getDate()}`, revenue: v.revenue, bookings: v.bookings };
      }));

      // Plan breakdown
      const planMap: Record<string, { count: number; revenue: number }> = {};
      completed.forEach((b) => {
        if (!planMap[b.wash_plan]) planMap[b.wash_plan] = { count: 0, revenue: 0 };
        planMap[b.wash_plan].count++;
        planMap[b.wash_plan].revenue += b.total_price || 0;
      });
      const planColors: Record<string, string> = { regular: 'bg-blue-500', interior_exterior: 'bg-violet-500', detailing: 'bg-[#E23232]' };
      setPlanData(
        Object.entries(planMap).map(([plan, v]) => ({
          plan, label: PLAN_LABELS[plan] || plan, count: v.count, revenue: v.revenue, color: planColors[plan] || 'bg-gray-500',
        })).sort((a, b) => b.count - a.count)
      );

      // Hourly distribution
      const hourMap: Record<number, number> = {};
      for (let h = 6; h <= 22; h++) hourMap[h] = 0;
      bookings.forEach((b) => {
        const h = new Date(b.created_at).getHours();
        if (hourMap[h] !== undefined) hourMap[h]++;
      });
      setHourlyData(Object.entries(hourMap).map(([h, count]) => ({ hour: Number(h), count })));

      // Zone breakdown (from service address - extract postal prefix)
      const zoneMap: Record<string, number> = {};
      bookings.forEach((b) => {
        if (b.service_address) {
          const postalMatch = b.service_address.match(/[A-Z]\d[A-Z]/i);
          if (postalMatch) {
            const prefix = postalMatch[0].toUpperCase().slice(0, 2);
            zoneMap[prefix] = (zoneMap[prefix] || 0) + 1;
          }
        }
      });
      setZoneData(
        Object.entries(zoneMap).map(([zone, count]) => ({ zone, count })).sort((a, b) => b.count - a.count).slice(0, 6)
      );

      setLoading(false);
    }
    load();
  }, [days]);

  const maxDailyRev = Math.max(...dailyData.map((d) => d.revenue), 1);
  const maxHourly = Math.max(...hourlyData.map((h) => h.count), 1);
  const totalPlanCount = planData.reduce((s, p) => s + p.count, 0) || 1;
  const maxZone = Math.max(...zoneData.map((z) => z.count), 1);

  if (loading) {
    return (
      <div className="space-y-6 md:pt-0 pt-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 bg-foreground/5 rounded-2xl" />)}
        </div>
        <Skeleton className="h-72 bg-foreground/5 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 bg-foreground/5 rounded-2xl" />
          <Skeleton className="h-64 bg-foreground/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:pt-0 pt-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E23232]/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#E23232]" />
            </div>
            <div>
              <h1 className="text-3xl font-display text-foreground tracking-tight">Analytics</h1>
              <p className="text-foreground/50 text-sm mt-0.5">Business intelligence & web analytics</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface border border-border rounded-xl p-1 gap-0.5">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${days === d ? 'bg-[#E23232] text-white shadow-sm' : 'text-foreground/50 hover:text-foreground'}`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5 hover:border-[#E23232]/30 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#E23232]/10 flex items-center justify-center"><DollarSign className="w-4 h-4 text-[#E23232]" /></div>
          </div>
          <p className="text-2xl font-bold text-[#E23232]">{centsToDisplay(avgOrderValue)}</p>
          <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-1">Avg Order Value</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5 hover:border-green-500/30 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><Repeat className="w-4 h-4 text-green-400" /></div>
          </div>
          <p className="text-2xl font-bold text-foreground">{repeatRate}%</p>
          <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-1">Repeat Rate</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5 hover:border-amber-500/30 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><Star className="w-4 h-4 text-amber-400" /></div>
          </div>
          <p className="text-2xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
          <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-1">Avg Rating</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5 hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Target className="w-4 h-4 text-blue-400" /></div>
          </div>
          <p className="text-2xl font-bold text-foreground">{centsToDisplay(revenuePerWasher)}</p>
          <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-1">Rev / Washer</p>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E23232]/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-[#E23232]" /></div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Revenue Trend — Last {days} Days</h3>
              <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-0.5">
                {centsToDisplay(totalRevenue)} total · {totalBookings} bookings
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-1 h-52 overflow-x-auto">
          {dailyData.map((day, i) => {
            const h = Math.max((day.revenue / maxDailyRev) * 100, 2);
            const showLabel = days <= 14 || i % 3 === 0;
            return (
              <div key={day.date} className="flex-1 min-w-[12px] flex flex-col items-center group">
                <span className="text-[9px] text-foreground/20 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">
                  {centsToDisplay(day.revenue)}
                </span>
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full rounded-sm bg-[#E23232]/30 group-hover:bg-[#E23232] transition-colors"
                    style={{ height: `${h}%` }}
                  />
                </div>
                {showLabel && <span className="text-[8px] text-foreground/20 whitespace-nowrap mt-1">{day.label}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Breakdown */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center"><Car className="w-4 h-4 text-violet-400" /></div>
            <h3 className="text-sm font-semibold text-foreground">Revenue by Plan</h3>
          </div>
          <div className="space-y-4">
            {planData.map((p) => (
              <div key={p.plan}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${p.color}`} />
                    <span className="text-sm text-foreground/70">{p.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-foreground/40 font-mono">{p.count} jobs</span>
                    <span className="text-sm font-semibold text-foreground">{centsToDisplay(p.revenue)}</span>
                  </div>
                </div>
                <div className="h-3 bg-foreground/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${p.color} transition-all duration-700`} style={{ width: `${(p.count / totalPlanCount) * 100}%` }} />
                </div>
              </div>
            ))}
            {planData.length === 0 && <p className="text-sm text-foreground/30 text-center py-6">No data yet</p>}
          </div>
        </div>

        {/* Popular Times */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><Clock className="w-4 h-4 text-amber-400" /></div>
            <h3 className="text-sm font-semibold text-foreground">Popular Booking Times</h3>
          </div>
          <div className="flex gap-1.5 h-40">
            {hourlyData.map((h) => {
              const pct = Math.max((h.count / maxHourly) * 100, 3);
              const isPeak = h.count === maxHourly && h.count > 0;
              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center group">
                  <span className="text-[9px] text-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity mb-1">{h.count}</span>
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className={`w-full rounded-sm transition-colors ${isPeak ? 'bg-amber-400' : 'bg-amber-500/25 group-hover:bg-amber-500/50'}`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-foreground/25 mt-1">{h.hour % 12 || 12}{h.hour < 12 ? 'a' : 'p'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two more columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Zones */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><MapPin className="w-4 h-4 text-green-400" /></div>
            <h3 className="text-sm font-semibold text-foreground">Top Service Zones</h3>
          </div>
          <div className="space-y-3">
            {zoneData.map((z) => (
              <div key={z.zone} className="flex items-center gap-4">
                <span className="text-sm font-mono text-foreground/60 w-8">{z.zone}</span>
                <div className="flex-1 h-2.5 bg-foreground/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-green-500 transition-all duration-700" style={{ width: `${(z.count / maxZone) * 100}%` }} />
                </div>
                <span className="text-xs text-foreground/40 font-mono w-10 text-right">{z.count}</span>
              </div>
            ))}
            {zoneData.length === 0 && <p className="text-sm text-foreground/30 text-center py-6">No zone data yet</p>}
          </div>
        </div>

        {/* Platform Stats */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Activity className="w-4 h-4 text-blue-400" /></div>
            <h3 className="text-sm font-semibold text-foreground">Platform Stats</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Users className="w-5 h-5 text-foreground/30 mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{totalCustomers}</p>
              <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-1">Customers</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Zap className="w-5 h-5 text-foreground/30 mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{totalWashers}</p>
              <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-1">Washers</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Car className="w-5 h-5 text-foreground/30 mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{totalBookings}</p>
              <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-1">Total Bookings</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <DollarSign className="w-5 h-5 text-foreground/30 mx-auto mb-2" />
              <p className="text-xl font-bold text-[#E23232]">{centsToDisplay(totalRevenue)}</p>
              <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-1">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Analytics Card */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Google Analytics</h3>
              <p className="text-sm text-foreground/50 mt-0.5">
                Tracking active across all pages
                <span className="inline-flex items-center gap-1 ml-2 text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {GA_ID}
                </span>
              </p>
              <p className="text-xs text-foreground/30 mt-1">
                Page views, sessions, user acquisition, traffic sources, and more
              </p>
            </div>
          </div>
          <a
            href={`https://analytics.google.com/analytics/web/#/p/reports/dashboard?params=_u..nav%3Dmaui&id=${GA_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#E23232] hover:bg-[#E23232]/80 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0"
          >
            Open GA Dashboard
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Real-time Users', desc: 'Active visitors now', icon: Users },
            { label: 'Page Views', desc: 'Total pages viewed', icon: Activity },
            { label: 'Avg Session', desc: 'Time per session', icon: Clock },
            { label: 'Bounce Rate', desc: 'Single-page sessions', icon: ArrowUpRight },
          ].map((item) => (
            <div key={item.label} className="bg-card border border-border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <item.icon className="w-3.5 h-3.5 text-foreground/30" />
                <span className="text-[10px] text-foreground/40 uppercase tracking-widest">{item.label}</span>
              </div>
              <p className="text-xs text-foreground/50">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
