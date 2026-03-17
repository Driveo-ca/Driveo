'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { PLAN_LABELS, centsToDisplay, formatDuration } from '@/lib/pricing';
import { MapPin, Clock, DollarSign, Star, ChevronRight, Car, Power } from 'lucide-react';
import type { Booking, WasherProfile, Vehicle } from '@/types';
import { cn } from '@/lib/utils';

interface BookingWithVehicle extends Booking {
  vehicles: Vehicle;
}

export default function WasherDashboardPage() {
  const [washerProfile, setWasherProfile] = useState<WasherProfile | null>(null);
  const [todayJobs, setTodayJobs] = useState<BookingWithVehicle[]>([]);
  const [activeJob, setActiveJob] = useState<BookingWithVehicle | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todayEarnings, setTodayEarnings] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get washer profile
      const { data: profile } = await supabase
        .from('washer_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setWasherProfile(profile);
        setIsOnline(profile.is_online);
      }

      // Get today's jobs
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: jobs } = await supabase
        .from('bookings')
        .select('*, vehicles(*)')
        .eq('washer_id', user.id)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false });

      if (jobs) {
        setTodayJobs(jobs);
        const active = jobs.find((j) =>
          ['assigned', 'en_route', 'arrived', 'washing'].includes(j.status)
        );
        if (active) setActiveJob(active);

        const earned = jobs
          .filter((j) => ['completed', 'paid'].includes(j.status))
          .reduce((sum, j) => sum + j.washer_payout, 0);
        setTodayEarnings(earned);
      }

      setLoading(false);

      // Subscribe to new job assignments
      const channel = supabase
        .channel(`washer-jobs:${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `washer_id=eq.${user.id}`,
        }, () => {
          // Reload on any change
          load();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
    load();
  }, []);

  async function toggleOnline(online: boolean) {
    setIsOnline(online);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('washer_profiles')
      .update({ is_online: online })
      .eq('id', user.id);
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 max-w-lg mx-auto space-y-4">
        <div className="h-8 w-48 rounded-lg bg-[#111]" />
        <div className="h-24 w-full rounded-2xl bg-[#111]" />
        <div className="h-40 w-full rounded-2xl bg-[#111]" />
      </div>
    );
  }

  const completedToday = todayJobs.filter((j) => ['completed', 'paid'].includes(j.status)).length;

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto space-y-6 animate-fade-in-up">
      {/* Online Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-white tracking-tight">Dashboard</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {washerProfile?.status === 'approved' ? (isOnline ? 'You\'re online' : 'You\'re offline') : 'Pending approval'}
          </p>
        </div>
        {washerProfile?.status === 'approved' && (
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-300',
              isOnline
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-[#111] border border-white/[0.08]'
            )}>
              <Power className={cn(
                'w-4 h-4 transition-colors duration-300',
                isOnline ? 'text-green-400' : 'text-white/30'
              )} />
              <span className={cn(
                'text-xs font-medium transition-colors duration-300',
                isOnline ? 'text-green-400' : 'text-white/30'
              )}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
              <Switch checked={isOnline} onCheckedChange={toggleOnline} />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card bg-[#111] border border-white/[0.08] rounded-2xl p-4 text-center">
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-[#E23232] font-bold text-lg">{centsToDisplay(todayEarnings)}</p>
          <p className="text-white/40 text-[11px] uppercase tracking-wider mt-1">Today</p>
        </div>
        <div className="stat-card bg-[#111] border border-white/[0.08] rounded-2xl p-4 text-center">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
            <Car className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-white font-bold text-lg">{completedToday}</p>
          <p className="text-white/40 text-[11px] uppercase tracking-wider mt-1">Washes</p>
        </div>
        <div className="stat-card bg-[#111] border border-white/[0.08] rounded-2xl p-4 text-center">
          <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-2">
            <Star className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-white font-bold text-lg">{washerProfile?.rating_avg?.toFixed(1) || '—'}</p>
          <p className="text-white/40 text-[11px] uppercase tracking-wider mt-1">Rating</p>
        </div>
      </div>

      {/* Active Job */}
      {activeJob && (
        <Link href={`/washer/jobs/${activeJob.id}`}>
          <div className="bg-[#111] border border-[#E23232]/30 rounded-2xl p-5 cursor-pointer hover:border-[#E23232]/50 transition-colors duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#E23232]" />
              <span className="text-[#E23232] text-xs font-semibold uppercase tracking-widest">Active Job</span>
            </div>
            <p className="text-white font-semibold text-base">
              {PLAN_LABELS[activeJob.wash_plan]}
            </p>
            <div className="flex items-center gap-4 mt-3 text-white/60 text-xs">
              <span className="flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5" /> {activeJob.vehicles.year} {activeJob.vehicles.make} {activeJob.vehicles.model}
              </span>
              <span className="flex items-center gap-1.5 text-[#E23232]">
                <DollarSign className="w-3.5 h-3.5" /> {centsToDisplay(activeJob.washer_payout)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-white/40 text-xs">
              <MapPin className="w-3.5 h-3.5" /> {activeJob.service_address}
            </div>
          </div>
        </Link>
      )}

      {/* Today's Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Today&apos;s Jobs</h2>
          <Link href="/washer/jobs" className="text-[#E23232] text-xs hover:text-[#E23232]/80 transition-colors font-medium">View all</Link>
        </div>
        {todayJobs.length === 0 ? (
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-8 text-center">
            <p className="text-white/40 text-sm">
              {isOnline ? 'No jobs yet today. Stay online!' : 'Go online to receive jobs.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayJobs.map((job) => (
              <Link key={job.id} href={`/washer/jobs/${job.id}`}>
                <div className="bg-[#111] border border-white/[0.08] rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-white/[0.15] transition-colors duration-200 mb-2.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                      <p className="text-white text-sm font-medium">{PLAN_LABELS[job.wash_plan]}</p>
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full border-white/[0.08] bg-white/[0.03]">
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-white/40 text-xs mt-1">
                      {job.vehicles.year} {job.vehicles.make} {job.vehicles.model}
                    </p>
                  </div>
                  <span className="text-[#E23232] text-sm font-semibold">{centsToDisplay(job.washer_payout)}</span>
                  <ChevronRight className="w-4 h-4 text-white/15" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
