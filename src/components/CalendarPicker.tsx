'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarPickerProps {
  value: string | null;
  onChange: (isoString: string) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function generateTimeSlots(): { label: string; value: string }[] {
  const slots = [];
  for (let h = 7; h <= 21; h++) {
    for (const m of [0, 30]) {
      if (h === 21 && m === 30) break;
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? 'am' : 'pm';
      const label = `${hour12}:${m === 0 ? '00' : '30'} ${ampm}`;
      const value = `${String(h).padStart(2, '0')}:${m === 0 ? '00' : '30'}`;
      slots.push({ label, value });
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

export function CalendarPicker({ value, onChange }: CalendarPickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parsed = value ? new Date(value) : null;

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'date' | 'time'>('date');

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [pickedDate, setPickedDate] = useState<Date | null>(
    parsed ? new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()) : null
  );
  const [pickedTime, setPickedTime] = useState<string | null>(
    parsed ? `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}` : null
  );

  function openPicker() {
    // Reset view to current value or today
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
      setPickedDate(new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
      setPickedTime(`${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`);
    } else {
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
      setPickedDate(null);
      setPickedTime(null);
    }
    setStep('date');
    setOpen(true);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleDateSelect(day: number) {
    const date = new Date(viewYear, viewMonth, day);
    if (date < today) return;
    setPickedDate(date);
    // Go to time step
    setTimeout(() => setStep('time'), 120);
  }

  function handleTimeSelect(time: string) {
    setPickedTime(time);
  }

  function handleConfirm() {
    if (!pickedDate || !pickedTime) return;
    const [h, m] = pickedTime.split(':').map(Number);
    const dt = new Date(pickedDate.getFullYear(), pickedDate.getMonth(), pickedDate.getDate(), h, m);
    onChange(dt.toISOString());
    setOpen(false);
  }

  function formatDisplayValue() {
    if (!parsed) return null;
    return parsed.toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  }

  // Calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isPickedDate = (day: number) =>
    pickedDate?.getDate() === day && pickedDate?.getMonth() === viewMonth && pickedDate?.getFullYear() === viewYear;
  const isPast = (day: number) => new Date(viewYear, viewMonth, day) < today;

  const displayValue = formatDisplayValue();

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={openPicker}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left',
          displayValue
            ? 'border-[#E23232]/40 bg-[#E23232]/5'
            : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.14]'
        )}
      >
        <CalendarDays className={cn('w-4 h-4 shrink-0', displayValue ? 'text-[#E23232]' : 'text-white/30')} />
        <span className={cn('text-sm', displayValue ? 'text-white font-medium' : 'text-white/30')}>
          {displayValue ?? 'Pick date & time'}
        </span>
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative z-10 w-full sm:max-w-sm bg-[#0f0f0f] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                {step === 'time' && (
                  <button
                    onClick={() => setStep('date')}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors mr-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                <span className="text-white font-semibold text-sm">
                  {step === 'date' ? 'Select date' : (
                    pickedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                  )}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── STEP 1: Calendar ── */}
            {step === 'date' && (
              <div className="px-4 pb-5">
                {/* Month nav */}
                <div className="flex items-center justify-between py-4">
                  <button
                    onClick={prevMonth}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-white font-medium text-sm">{MONTHS[viewMonth]} {viewYear}</span>
                  <button
                    onClick={nextMonth}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {DAYS.map(d => (
                    <div key={d} className="text-center text-[10px] font-medium text-white/20 py-1">{d}</div>
                  ))}
                </div>

                {/* Day grid */}
                <div className="grid grid-cols-7 gap-y-1">
                  {cells.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} />;
                    const past = isPast(day);
                    const selected = isPickedDate(day);
                    const todayDay = isToday(day);
                    return (
                      <button
                        key={day}
                        onClick={() => !past && handleDateSelect(day)}
                        disabled={past}
                        className={cn(
                          'relative h-10 w-full rounded-xl text-sm font-medium transition-all flex items-center justify-center',
                          past && 'text-white/15 cursor-not-allowed',
                          !past && !selected && 'text-white/70 hover:bg-white/[0.08] hover:text-white',
                          selected && 'bg-[#E23232] text-white',
                          todayDay && !selected && 'text-[#E23232] font-semibold',
                        )}
                      >
                        {day}
                        {todayDay && !selected && (
                          <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E23232]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 2: Time slots ── */}
            {step === 'time' && (
              <div className="px-4 pb-5">
                <div className="flex items-center gap-2 py-4">
                  <Clock className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-white/40 text-xs">Select a time</span>
                </div>

                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-0.5">
                  {TIME_SLOTS.map(slot => {
                    const isToday =
                      pickedDate?.getDate() === today.getDate() &&
                      pickedDate?.getMonth() === today.getMonth() &&
                      pickedDate?.getFullYear() === today.getFullYear();
                    const [h, m] = slot.value.split(':').map(Number);
                    const slotTime = new Date(pickedDate!);
                    slotTime.setHours(h, m, 0, 0);
                    const pastSlot = isToday && slotTime <= new Date();
                    const active = pickedTime === slot.value;

                    return (
                      <button
                        key={slot.value}
                        onClick={() => !pastSlot && handleTimeSelect(slot.value)}
                        disabled={pastSlot}
                        className={cn(
                          'py-2.5 rounded-xl text-sm font-medium transition-all text-center',
                          pastSlot && 'text-white/15 cursor-not-allowed',
                          !pastSlot && !active && 'bg-white/[0.04] border border-white/[0.07] text-white/60 hover:border-white/[0.16] hover:text-white',
                          active && 'bg-[#E23232] text-white border border-[#E23232]',
                        )}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={!pickedTime}
                  className={cn(
                    'w-full mt-4 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
                    pickedTime
                      ? 'bg-[#E23232] text-white hover:bg-[#c92a2a]'
                      : 'bg-white/[0.05] text-white/20 cursor-not-allowed'
                  )}
                >
                  <Check className="w-4 h-4" />
                  Confirm{pickedTime && pickedDate ? ` — ${pickedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${TIME_SLOTS.find(s => s.value === pickedTime)?.label}` : ''}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
