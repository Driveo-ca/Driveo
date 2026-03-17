'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Clock, Save } from 'lucide-react';

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

// Map display index (Mon=0..Sun=6) to DB day_of_week (0=Sun..6=Sat)
const displayToDB = (displayIdx: number): number => (displayIdx + 1) % 7;

export default function WasherAvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAvailability() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data, error } = await supabase
        .from('washer_availability')
        .select('*')
        .eq('washer_id', user.id)
        .order('day_of_week');

      if (!error && data && data.length > 0) {
        setSlots(data as AvailabilitySlot[]);
      } else {
        // Initialize default slots for all 7 days
        const defaults: AvailabilitySlot[] = DAYS.map((_, i) => ({
          id: '',
          washer_id: user.id,
          day_of_week: displayToDB(i),
          start_time: '09:00',
          end_time: '17:00',
          is_available: i < 5, // Mon-Fri on by default
        }));
        setSlots(defaults);
      }
      setLoading(false);
    }

    fetchAvailability();
  }, [supabase]);

  const getSlotByDisplayIndex = (displayIdx: number) => {
    const dbDay = displayToDB(displayIdx);
    return slots.find((s) => s.day_of_week === dbDay);
  };

  const updateSlot = (displayIdx: number, field: keyof AvailabilitySlot, value: string | boolean) => {
    const dbDay = displayToDB(displayIdx);
    setSlots((prev) =>
      prev.map((s) =>
        s.day_of_week === dbDay ? { ...s, [field]: value } : s
      )
    );
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);

    // Delete existing and re-insert
    await supabase.from('washer_availability').delete().eq('washer_id', userId);

    const rows = slots.map((s) => ({
      washer_id: userId,
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
      is_available: s.is_available,
    }));

    await supabase.from('washer_availability').insert(rows);
    setSaving(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-white tracking-tight">Availability</h1>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold rounded-xl transition-colors duration-200 border-0 px-5"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-20 w-full bg-[#111] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {DAYS.map((day, displayIdx) => {
            const slot = getSlotByDisplayIndex(displayIdx);
            if (!slot) return null;
            return (
              <div
                key={day}
                className={`bg-[#111] border rounded-2xl transition-colors duration-200 ${
                  slot.is_available
                    ? 'border-green-500/20'
                    : 'border-white/[0.08] opacity-40'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold tracking-wider transition-colors duration-200 ${
                        slot.is_available
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-[#0a0a0a] text-white/20'
                      }`}>
                        {SHORT_DAYS[displayIdx]}
                      </div>
                      <Label className="text-sm font-semibold text-white">
                        {day}
                      </Label>
                    </div>
                    <Switch
                      checked={slot.is_available}
                      onCheckedChange={(checked) =>
                        updateSlot(displayIdx, 'is_available', checked)
                      }
                    />
                  </div>

                  {slot.is_available && (
                    <div className="flex items-center gap-3 animate-fade-in">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-6 h-6 rounded-md bg-[#0a0a0a] flex items-center justify-center">
                          <Clock className="w-3 h-3 text-white/30" />
                        </div>
                        <Input
                          type="time"
                          value={slot.start_time}
                          onChange={(e) =>
                            updateSlot(displayIdx, 'start_time', e.target.value)
                          }
                          className="bg-[#0a0a0a] border-white/[0.08] text-white text-sm h-9 rounded-lg"
                        />
                      </div>
                      <span className="text-white/20 text-xs font-medium tracking-wider">TO</span>
                      <div className="flex-1">
                        <Input
                          type="time"
                          value={slot.end_time}
                          onChange={(e) =>
                            updateSlot(displayIdx, 'end_time', e.target.value)
                          }
                          className="bg-[#0a0a0a] border-white/[0.08] text-white text-sm h-9 rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
