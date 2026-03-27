'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { PLAN_LABELS, centsToDisplay } from '@/lib/pricing';
import {
  MapPin, DollarSign, Star, ChevronRight, Car,
  Power, Zap, TrendingUp, Clock, CalendarDays, Bell,
} from 'lucide-react';
import type { Booking, WasherProfile, Vehicle } from '@/types';
import { cn } from '@/lib/utils';

interface BookingWithVehicle extends Booking {
  vehicles: Vehicle;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const statusColor: Record<string, string> = {
  assigned: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  en_route: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  arrived: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  washing: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  paid: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export default function WasherDashboardPage() {
  const [washerProfile, setWasherProfile] = useState<WasherProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [todayJobs, setTodayJobs] = useState<BookingWithVehicle[]>([]);
  const [activeJob, setActiveJob] = useState<BookingWithVehicle | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [monthEarnings, setMonthEarnings] = useState(0);
  const [weekJobs, setWeekJobs] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const [profileRes, washerRes] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
        supabase.from('washer_profiles').select('*').eq('id', user.id).single(),
      ]);

      if (profileRes.data) setDisplayName(profileRes.data.full_name?.split(' ')[0] || '');
      if (washerRes.data) {
        setWasherProfile(washerRes.data);
        setIsOnline(washerRes.data.is_online);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());

      const [todayRes, monthRes, weekRes, notifRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('*, vehicles(*)')
          .eq('washer_id', user.id)
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('bookings')
          .select('washer_payout')
          .eq('washer_id', user.id)
          .in('status', ['completed', 'paid'])
          .gte('wash_completed_at', monthStart.toISOString()),
        supabase
          .from('bookings')
          .select('id')
          .eq('washer_id', user.id)
          .in('status', ['completed', 'paid'])
          .gte('wash_completed_at', weekStart.toISOString()),
        supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_read', false),
      ]);

      if (todayRes.data) {
        setTodayJobs(todayRes.data);
        const active = todayRes.data.find((j) =>
          ['assigned', 'en_route', 'arrived', 'washing'].includes(j.status)
        );
        setActiveJob(active || null);
        setTodayEarnings(
          todayRes.data
            .filter((j) => ['completed', 'paid'].includes(j.status))
            .reduce((s, j) => s + j.washer_payout, 0)
        );
      }
      if (monthRes.data) {
        setMonthEarnings(monthRes.data.reduce((s, j) => s + j.washer_payout, 0));
      }
      if (weekRes.data) setWeekJobs(weekRes.data.length);
      if (notifRes.data) setUnreadNotifs(notifRes.data.length);

      setLoading(false);
      return user.id;
    }

    async function init() {
      const userId = await fetchData();
      if (!userId) return;

      channel = supabase
        .channel(`washer-jobs:${userId}`)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'bookings',
          filter: `washer_id=eq.${userId}`,
        }, () => { fetchData(); })
        .subscribe();
    }

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  async function toggleOnline(online: boolean) {
    setIsOnline(online);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('washer_profiles').update({ is_online: online }).eq('id', user.id);
  }

  const completedToday = todayJobs.filter((j) => ['completed', 'paid'].includes(j.status)).length;
  const approved = washerProfile?.status === 'approved';

  if (loading) {
    return (
      <div className="px-5 pt-4 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-4">
            {[80, 140, 120, 200].map((h, i) => (
              <div key={i} className="w-full rounded-2xl bg-foreground/[0.04] animate-pulse" style={{ height: h }} />
            ))}
          </div>
          <div className="hidden lg:block space-y-4">
            {[100, 180, 140].map((h, i) => (
              <div key={i} className="w-full rounded-2xl bg-foreground/[0.04] animate-pulse" style={{ height: h }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-10 max-w-[1280px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

        {/* ── LEFT COLUMN (Main Content) ── */}
        <div className="space-y-5 min-w-0">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-start justify-between"
          >
            <div>
              <p className="text-foreground/55 text-sm">{getGreeting()}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mt-0.5">
                {displayName || 'Washer'}
              </h1>
            </div>

            {approved ? (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleOnline(!isOnline)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border transition-all duration-300',
                  isOnline
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-foreground/[0.05] border-border text-foreground/50'
                )}
              >
                <span className={cn(
                  'w-2 h-2 rounded-full transition-colors duration-300',
                  isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-foreground/30'
                )} />
                <span className="text-[11px] font-bold tracking-widest uppercase">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <Switch checked={isOnline} className="scale-75 pointer-events-none" />
              </motion.button>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 rounded-full px-3 py-1 text-[10px] uppercase tracking-widest">
                Pending Approval
              </Badge>
            )}
          </motion.div>

          {/* Earnings Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="relative bg-gradient-to-br from-[#E23232]/10 via-[#E23232]/5 to-transparent border border-[#E23232]/20 rounded-3xl p-5 lg:p-6 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E23232]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#E23232]/60" />
                  <span className="font-mono text-[11px] text-foreground/55 uppercase tracking-[0.1em] font-semibold">Today&apos;s Earnings</span>
                </div>
                <p className="text-4xl lg:text-5xl font-display text-[#E23232] tracking-tight">{centsToDisplay(todayEarnings)}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <TrendingUp className="w-3.5 h-3.5 text-foreground/40" />
                  <span className="text-xs text-foreground/50">{centsToDisplay(monthEarnings)} this month</span>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-6">
                <div className="text-right">
                  <p className="font-mono text-[10px] text-foreground/40 uppercase tracking-wider">Washes today</p>
                  <p className="text-2xl font-bold text-foreground/80 mt-0.5">{completedToday}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] text-foreground/40 uppercase tracking-wider">This week</p>
                  <p className="text-2xl font-bold text-foreground/80 mt-0.5">{weekJobs}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Row — mobile only */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-3 gap-3 lg:hidden"
          >
            {[
              { icon: Car, label: 'Washes', value: String(completedToday), color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: Star, label: 'Rating', value: washerProfile?.rating_avg?.toFixed(1) || '—', color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { icon: Power, label: 'Status', value: isOnline ? 'Live' : 'Off', color: isOnline ? 'text-emerald-400' : 'text-foreground/40', bg: isOnline ? 'bg-emerald-500/10' : 'bg-foreground/[0.05]' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border/50 p-4 text-center">
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2', s.bg)}>
                  <s.icon className={cn('w-4 h-4', s.color)} />
                </div>
                <p className={cn('font-bold text-lg leading-none', s.color)}>{s.value}</p>
                <p className="font-mono text-foreground/55 text-[10px] uppercase tracking-[0.08em] mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Active Job */}
          {activeJob && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.15 }}
            >
              <Link href={`/washer/jobs/${activeJob.id}`}>
                <div className="relative border border-[#E23232]/25 hover:border-[#E23232]/40 rounded-2xl p-5 cursor-pointer transition-all duration-200 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#E23232]/[0.04] to-transparent pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#E23232]/40 via-[#E23232]/20 to-transparent" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E23232] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E23232]" />
                        </span>
                        <span className="text-[#E23232] text-xs font-bold uppercase tracking-widest">Active Job</span>
                      </div>
                      <Badge variant="outline" className={cn('text-[10px] rounded-full px-2.5', statusColor[activeJob.status])}>
                        {activeJob.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-foreground font-semibold text-base mb-3">
                      {PLAN_LABELS[activeJob.wash_plan]}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-foreground/60 text-xs">
                          <Car className="w-3.5 h-3.5 shrink-0" />
                          {activeJob.vehicles.year} {activeJob.vehicles.make} {activeJob.vehicles.model}
                        </div>
                        <div className="flex items-center gap-1.5 text-foreground/60 text-xs">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="line-clamp-1">{activeJob.service_address}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <span className="text-[#E23232] font-bold">{centsToDisplay(activeJob.washer_payout)}</span>
                        <div className="w-8 h-8 rounded-xl bg-[#E23232]/10 flex items-center justify-center">
                          <ChevronRight className="w-4 h-4 text-[#E23232]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Today's Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] font-semibold text-foreground/55 uppercase tracking-[0.1em]">Today&apos;s Jobs</span>
              <Link href="/washer/jobs" className="text-[#E23232] text-xs font-medium hover:text-[#E23232]/80 transition-colors flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {todayJobs.length === 0 ? (
              <div className="border border-dashed border-border/50 rounded-2xl p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-foreground/[0.05] flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-5 h-5 text-foreground/30" />
                </div>
                <p className="text-foreground/50 text-sm">
                  {isOnline ? 'No jobs yet — stay online!' : 'Go online to receive jobs.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.05 }}
                  >
                    <Link href={`/washer/jobs/${job.id}`}>
                      <div className="border border-border/50 hover:border-border rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all duration-200">
                        <div className={cn('w-1.5 h-8 rounded-full flex-shrink-0', {
                          'bg-blue-500': ['assigned', 'en_route'].includes(job.status),
                          'bg-violet-500': ['arrived', 'washing'].includes(job.status),
                          'bg-emerald-500': ['completed', 'paid'].includes(job.status),
                        })} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-foreground text-sm font-semibold truncate">{PLAN_LABELS[job.wash_plan]}</p>
                            <Badge variant="outline" className={cn('text-[9px] px-2 py-0 rounded-md shrink-0', statusColor[job.status])}>
                              {job.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-foreground/50 text-xs mt-0.5 truncate">
                            {job.vehicles.year} {job.vehicles.make} {job.vehicles.model}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[#E23232] text-sm font-bold">{centsToDisplay(job.washer_payout)}</span>
                          <ChevronRight className="w-4 h-4 text-foreground/30" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Links — mobile only */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="grid grid-cols-2 gap-3 lg:hidden"
          >
            {[
              { href: '/washer/earnings', icon: DollarSign, label: 'Earnings', sub: centsToDisplay(monthEarnings) + ' this month', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { href: '/washer/availability', icon: Clock, label: 'Schedule', sub: 'Set your hours', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="border border-border/50 hover:border-border rounded-2xl p-4 transition-all duration-200 cursor-pointer bg-gradient-to-br from-foreground/[0.03] via-transparent to-transparent">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', item.bg)}>
                    <item.icon className={cn('w-4 h-4', item.color)} />
                  </div>
                  <p className="text-foreground text-sm font-semibold">{item.label}</p>
                  <p className="text-foreground/50 text-xs mt-0.5">{item.sub}</p>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT SIDEBAR (Desktop only) ── */}
        <div className="hidden lg:block space-y-5">

          {/* Stats Panel */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="border border-border/50 rounded-2xl p-5"
          >
            <span className="font-mono text-[10px] text-foreground/40 uppercase tracking-[0.1em] font-semibold">Performance</span>
            <div className="mt-4 space-y-4">
              {[
                { icon: Star, label: 'Rating', value: washerProfile?.rating_avg?.toFixed(1) || '—', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { icon: Car, label: 'Today\'s Washes', value: String(completedToday), color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { icon: Zap, label: 'This Week', value: String(weekJobs), color: 'text-violet-400', bg: 'bg-violet-500/10' },
                { icon: Power, label: 'Status', value: isOnline ? 'Online' : 'Offline', color: isOnline ? 'text-emerald-400' : 'text-foreground/40', bg: isOnline ? 'bg-emerald-500/10' : 'bg-foreground/[0.05]' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', s.bg)}>
                    <s.icon className={cn('w-4 h-4', s.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-[10px] text-foreground/40 uppercase tracking-wider">{s.label}</p>
                    <p className={cn('text-lg font-bold leading-tight', s.color)}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-2.5"
          >
            <span className="font-mono text-[10px] text-foreground/40 uppercase tracking-[0.1em] font-semibold px-1">Quick Links</span>
            {[
              { href: '/washer/earnings', icon: DollarSign, label: 'Earnings', sub: centsToDisplay(monthEarnings) + ' this month', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { href: '/washer/availability', icon: CalendarDays, label: 'Schedule', sub: 'Set your hours', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { href: '/washer/notifications', icon: Bell, label: 'Notifications', sub: unreadNotifs > 0 ? `${unreadNotifs} unread` : 'All caught up', color: unreadNotifs > 0 ? 'text-[#E23232]' : 'text-foreground/40', bg: unreadNotifs > 0 ? 'bg-[#E23232]/10' : 'bg-foreground/[0.05]' },
              { href: '/washer/jobs', icon: Car, label: 'All Jobs', sub: `${todayJobs.length} today`, color: 'text-violet-400', bg: 'bg-violet-500/10' },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="border border-border/50 hover:border-border rounded-2xl p-4 transition-all duration-200 cursor-pointer flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', item.bg)}>
                    <item.icon className={cn('w-4 h-4', item.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-semibold">{item.label}</p>
                    <p className="text-foreground/50 text-xs mt-0.5">{item.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground/20" />
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
