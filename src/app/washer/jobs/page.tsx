'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Car, DollarSign, Clock, Calendar, ChevronRight, ClipboardList, CheckCircle2, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Job {
  id: string;
  wash_plan: string;
  dirt_level: number;
  status: string;
  service_address: string;
  is_instant: boolean;
  scheduled_at: string | null;
  washer_payout: number;
  created_at: string;
  wash_completed_at: string | null;
  vehicles: { make: string; model: string; year: number; type: string } | null;
}

const planLabel: Record<string, string> = {
  regular: 'Regular Wash',
  interior_exterior: 'Interior & Exterior',
  detailing: 'Full Detailing',
};

const statusConfig: Record<string, { color: string; dot: string }> = {
  assigned:  { color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',    dot: 'bg-blue-500' },
  en_route:  { color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20', dot: 'bg-violet-500' },
  arrived:   { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',  dot: 'bg-amber-500' },
  washing:   { color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
  completed: { color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',  dot: 'bg-green-500' },
  paid:      { color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',  dot: 'bg-green-500' },
};

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="border border-dashed border-border/50 rounded-2xl p-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-foreground/[0.04] flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-foreground/50" />
      </div>
      <p className="text-foreground/65 text-sm">{message}</p>
    </div>
  );
}

function JobCard({ job, index }: { job: Job; index: number }) {
  const cfg = statusConfig[job.status] || { color: 'border-border/50', dot: 'bg-foreground/30' };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href={`/washer/jobs/${job.id}`}>
        <div className="border border-border/50 hover:border-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group">
          <div className="p-4 md:p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className={cn('w-2 h-2 rounded-full shrink-0 mt-0.5', cfg.dot)} />
                <Badge variant="outline" className={cn('text-[10px] rounded-md px-2.5 py-0.5 uppercase tracking-[0.08em] font-medium', cfg.color)}>
                  {job.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-[#E23232] font-bold text-sm">
                <DollarSign className="w-3.5 h-3.5" />
                {(job.washer_payout / 100).toFixed(2)}
              </div>
            </div>

            <p className="text-foreground font-semibold text-sm mb-2.5">
              {planLabel[job.wash_plan] || job.wash_plan}
            </p>

            <div className="space-y-1.5">
              {job.vehicles && (
                <div className="flex items-center gap-2 text-foreground/65 text-xs">
                  <Car className="w-3.5 h-3.5 shrink-0" />
                  {job.vehicles.year} {job.vehicles.make} {job.vehicles.model}
                  <span className="text-foreground/65 capitalize">· {job.vehicles.type}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-foreground/65 text-xs">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="line-clamp-1">{job.service_address}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
              <div className="flex items-center gap-1.5 text-foreground/60 text-xs font-mono">
                {job.scheduled_at ? (
                  <>
                    <Calendar className="w-3 h-3" />
                    {new Date(job.scheduled_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3" />
                    Instant
                  </>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-foreground/50 group-hover:text-foreground/60 transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function WasherJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('bookings')
        .select('*, vehicles(make, model, year, type)')
        .eq('washer_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setJobs(data as Job[]);
      setLoading(false);
    }
    fetchJobs();
  }, []);

  const activeJobs = jobs.filter((j) =>
    ['assigned', 'en_route', 'arrived', 'washing'].includes(j.status) &&
    !(j.status === 'assigned' && j.scheduled_at && new Date(j.scheduled_at) > new Date())
  );
  const upcomingJobs = jobs.filter((j) =>
    j.status === 'assigned' && j.scheduled_at && new Date(j.scheduled_at) > new Date()
  );
  const completedJobs = jobs.filter((j) => ['completed', 'paid'].includes(j.status));

  const totalEarnings = completedJobs.reduce((s, j) => s + j.washer_payout, 0);

  // Plan distribution
  const planCounts = completedJobs.reduce((acc, j) => {
    acc[j.wash_plan] = (acc[j.wash_plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-[1280px] mx-auto px-5 pt-4 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">My Jobs</h1>
          <p className="text-foreground/65 text-xs mt-0.5 font-mono">{jobs.length} total assignments</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-foreground/[0.05] flex items-center justify-center">
          <ClipboardList className="w-[18px] h-[18px] text-foreground/65" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

        {/* ── LEFT: Job List ── */}
        <div className="min-w-0">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-36 w-full bg-foreground/[0.04] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="w-full bg-foreground/[0.04] rounded-2xl p-1 border border-border/50 mb-5 h-auto">
                <TabsTrigger
                  value="active"
                  className="flex-1 rounded-xl py-2.5 text-sm font-medium data-[state=active]:bg-[#E23232] data-[state=active]:text-white text-foreground/65 transition-all duration-200"
                >
                  Active {activeJobs.length > 0 && <span className="ml-1.5 bg-white/20 text-[10px] rounded-full px-1.5 py-0.5">{activeJobs.length}</span>}
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="flex-1 rounded-xl py-2.5 text-sm font-medium data-[state=active]:bg-[#E23232] data-[state=active]:text-white text-foreground/65 transition-all duration-200"
                >
                  Upcoming {upcomingJobs.length > 0 && <span className="ml-1.5 bg-white/20 text-[10px] rounded-full px-1.5 py-0.5">{upcomingJobs.length}</span>}
                </TabsTrigger>
                <TabsTrigger
                  value="done"
                  className="flex-1 rounded-xl py-2.5 text-sm font-medium data-[state=active]:bg-[#E23232] data-[state=active]:text-white text-foreground/65 transition-all duration-200"
                >
                  Done {completedJobs.length > 0 && <span className="ml-1.5 bg-white/20 text-[10px] rounded-full px-1.5 py-0.5">{completedJobs.length}</span>}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-3 mt-0">
                {activeJobs.length === 0
                  ? <EmptyState icon={Zap} message="No active jobs right now" />
                  : activeJobs.map((j, i) => <JobCard key={j.id} job={j} index={i} />)}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-3 mt-0">
                {upcomingJobs.length === 0
                  ? <EmptyState icon={Calendar} message="No upcoming scheduled jobs" />
                  : upcomingJobs.map((j, i) => <JobCard key={j.id} job={j} index={i} />)}
              </TabsContent>

              <TabsContent value="done" className="space-y-3 mt-0">
                {completedJobs.length === 0
                  ? <EmptyState icon={CheckCircle2} message="No completed jobs yet" />
                  : completedJobs.map((j, i) => <JobCard key={j.id} job={j} index={i} />)}
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* ── RIGHT: Stats Sidebar ── */}
        <div className="hidden lg:block space-y-5">

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="border border-border/50 rounded-2xl p-5"
          >
            <span className="font-mono text-[10px] text-foreground/60 uppercase tracking-[0.1em] font-semibold">Job Summary</span>
            <div className="mt-4 space-y-4">
              {[
                { icon: Zap, label: 'Active', value: String(activeJobs.length), color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
                { icon: Calendar, label: 'Upcoming', value: String(upcomingJobs.length), color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
                { icon: CheckCircle2, label: 'Completed', value: String(completedJobs.length), color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
                { icon: ClipboardList, label: 'Total', value: String(jobs.length), color: 'text-foreground/60', bg: 'bg-foreground/[0.05]' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', s.bg)}>
                    <s.icon className={cn('w-4 h-4', s.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-[10px] text-foreground/60 uppercase tracking-wider">{s.label}</p>
                    <p className={cn('text-lg font-bold leading-tight', s.color)}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Earnings from completed */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-5 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600/60 dark:text-emerald-400/60" />
                <span className="font-mono text-[10px] text-foreground/60 uppercase tracking-[0.1em] font-semibold">Total Earned</span>
              </div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">${(totalEarnings / 100).toFixed(2)}</p>
              <p className="text-xs text-foreground/60 mt-1 font-mono">{completedJobs.length} completed</p>
            </div>
          </motion.div>

          {/* Plan Breakdown */}
          {Object.keys(planCounts).length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="border border-border/50 rounded-2xl p-5"
            >
              <span className="font-mono text-[10px] text-foreground/60 uppercase tracking-[0.1em] font-semibold">Plan Breakdown</span>
              <div className="mt-4 space-y-3">
                {Object.entries(planCounts).map(([plan, count]) => {
                  const total = completedJobs.length || 1;
                  const pct = Math.round((count / total) * 100);
                  const dotColor = plan === 'regular' ? 'bg-blue-500' : plan === 'interior_exterior' ? 'bg-violet-500' : 'bg-[#E23232]';
                  return (
                    <div key={plan}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={cn('w-2 h-2 rounded-full', dotColor)} />
                          <span className="text-xs text-foreground/60 font-medium">{planLabel[plan] || plan}</span>
                        </div>
                        <span className="text-xs text-foreground/60 font-mono">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-foreground/[0.06] overflow-hidden">
                        <div className={cn('h-full rounded-full', dotColor)} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
