'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Clock, Save, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilitySlot {
  id: string;
  washer_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const displayToDB = (displayIdx: number): number => (displayIdx + 1) % 7;

function parseTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function fmtHours(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function WasherAvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAvailability() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from('washer_availability')
        .select('*')
        .eq('washer_id', user.id)
        .order('day_of_week');

      if (data && data.length > 0) {
        setSlots(data as AvailabilitySlot[]);
      } else {
        setSlots(DAYS.map((_, i) => ({
          id: '', washer_id: user.id,
          day_of_week: displayToDB(i),
          start_time: '09:00', end_time: '17:00',
          is_available: i < 5,
        })));
      }
      setLoading(false);
    }
    fetchAvailability();
  }, []);

  const getSlot = (displayIdx: number) =>
    slots.find((s) => s.day_of_week === displayToDB(displayIdx));

  const updateSlot = (displayIdx: number, field: keyof AvailabilitySlot, value: string | boolean) => {
    const dbDay = displayToDB(displayIdx);
    setSlots((prev) => prev.map((s) => s.day_of_week === dbDay ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('washer_availability').delete().eq('washer_id', userId);
    await supabase.from('washer_availability').insert(
      slots.map((s) => ({
        washer_id: userId,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        is_available: s.is_available,
      }))
    );
    setSaving(false);
    toast.success('Schedule saved!');
  };

  const activeDays = slots.filter((s) => s.is_available).length;
  const totalWeeklyMins = slots
    .filter((s) => s.is_available)
    .reduce((sum, s) => {
      const diff = parseTime(s.end_time) - parseTime(s.start_time);
      return sum + Math.max(0, diff);
    }, 0);

  // Earliest start, latest end
  const activeSlots = slots.filter((s) => s.is_available);
  const earliestStart = activeSlots.length > 0 ? activeSlots.reduce((min, s) => s.start_time < min ? s.start_time : min, '23:59') : '—';
  const latestEnd = activeSlots.length > 0 ? activeSlots.reduce((max, s) => s.end_time > max ? s.end_time : max, '00:00') : '—';

  return (
    <div className="max-w-[1280px] mx-auto px-5 pt-4 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Schedule</h1>
          <p className="text-foreground/55 text-xs mt-0.5 font-mono">{activeDays} day{activeDays !== 1 ? 's' : ''} active</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-foreground/[0.05] flex items-center justify-center">
            <CalendarDays className="w-[18px] h-[18px] text-foreground/55" />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold rounded-xl border-0 px-6 py-2.5 text-sm active:scale-[0.98] transition-all"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

        {/* ── LEFT: Schedule ── */}
        <div className="min-w-0">

          {/* Day bubbles summary */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex gap-2 mb-5"
          >
            {SHORT_DAYS.map((d, i) => {
              const slot = getSlot(i);
              return (
                <button
                  key={d}
                  onClick={() => slot && updateSlot(i, 'is_available', !slot.is_available)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-[10px] font-bold tracking-wider transition-all duration-200',
                    slot?.is_available
                      ? 'bg-[#E23232]/10 text-[#E23232] border border-[#E23232]/25'
                      : 'bg-foreground/[0.04] text-foreground/30 border border-border/50'
                  )}
                >
                  {d}
                </button>
              );
            })}
          </motion.div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-20 w-full bg-foreground/[0.04] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {DAYS.map((day, displayIdx) => {
                const slot = getSlot(displayIdx);
                if (!slot) return null;
                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + displayIdx * 0.04 }}
                    className={cn(
                      'border rounded-2xl overflow-hidden transition-all duration-300',
                      slot.is_available
                        ? 'border-[#E23232]/20'
                        : 'border-border/50 opacity-50'
                    )}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold tracking-wider transition-all duration-200',
                            slot.is_available
                              ? 'bg-[#E23232]/10 text-[#E23232]'
                              : 'bg-foreground/[0.04] text-foreground/30'
                          )}>
                            {SHORT_DAYS[displayIdx]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{day}</p>
                            {slot.is_available && (
                              <p className="text-[10px] text-foreground/40 mt-0.5 font-mono">
                                {slot.start_time} – {slot.end_time}
                              </p>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={slot.is_available}
                          onCheckedChange={(checked) => updateSlot(displayIdx, 'is_available', checked)}
                        />
                      </div>

                      {slot.is_available && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="flex items-center gap-3"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-7 h-7 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0">
                              <Clock className="w-3 h-3 text-foreground/40" />
                            </div>
                            <Input
                              type="time"
                              value={slot.start_time}
                              onChange={(e) => updateSlot(displayIdx, 'start_time', e.target.value)}
                              className="bg-foreground/[0.04] border-border/60 text-foreground text-sm h-9 rounded-xl"
                            />
                          </div>
                          <span className="text-foreground/35 text-xs font-mono font-medium tracking-wider shrink-0">TO</span>
                          <div className="flex-1">
                            <Input
                              type="time"
                              value={slot.end_time}
                              onChange={(e) => updateSlot(displayIdx, 'end_time', e.target.value)}
                              className="bg-foreground/[0.04] border-border/60 text-foreground text-sm h-9 rounded-xl"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Week Summary Sidebar ── */}
        <div className="hidden lg:block space-y-5">

          {/* Week Overview */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative bg-gradient-to-br from-[#E23232]/10 via-[#E23232]/5 to-transparent border border-[#E23232]/20 rounded-2xl p-5 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E23232]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-3.5 h-3.5 text-[#E23232]/60" />
                <span className="font-mono text-[10px] text-foreground/40 uppercase tracking-[0.1em] font-semibold">Weekly Hours</span>
              </div>
              <p className="text-3xl font-bold text-[#E23232] tracking-tight">{fmtHours(totalWeeklyMins)}</p>
              <p className="text-xs text-foreground/40 mt-1 font-mono">{activeDays} active day{activeDays !== 1 ? 's' : ''}</p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="border border-border/50 rounded-2xl p-5"
          >
            <span className="font-mono text-[10px] text-foreground/40 uppercase tracking-[0.1em] font-semibold">Schedule Details</span>
            <div className="mt-4 space-y-4">
              {[
                { label: 'Active Days', value: `${activeDays} / 7` },
                { label: 'Earliest Start', value: earliestStart },
                { label: 'Latest End', value: latestEnd },
                { label: 'Avg Hours/Day', value: activeDays > 0 ? fmtHours(Math.round(totalWeeklyMins / activeDays)) : '—' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-foreground/40 uppercase tracking-wider">{s.label}</span>
                  <span className="text-sm text-foreground font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Day-by-day mini view */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="border border-border/50 rounded-2xl p-5"
          >
            <span className="font-mono text-[10px] text-foreground/40 uppercase tracking-[0.1em] font-semibold">Day Overview</span>
            <div className="mt-4 space-y-2.5">
              {DAYS.map((day, i) => {
                const slot = getSlot(i);
                if (!slot) return null;
                const mins = slot.is_available ? Math.max(0, parseTime(slot.end_time) - parseTime(slot.start_time)) : 0;
                const maxMins = 12 * 60;
                const pct = Math.round((mins / maxMins) * 100);
                return (
                  <div key={day}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-foreground/55 font-medium w-10">{SHORT_DAYS[i]}</span>
                      <span className="text-[10px] text-foreground/30 font-mono">
                        {slot.is_available ? `${slot.start_time}–${slot.end_time}` : 'Off'}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-foreground/[0.06] overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-300', slot.is_available ? 'bg-[#E23232]' : 'bg-foreground/10')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
