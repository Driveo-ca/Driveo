'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, X, Check } from 'lucide-react';
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

const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const PERIODS = ['AM', 'PM'];

const ITEM_H = 46;
const VISIBLE = 5;
const PAD = ITEM_H * 2;

// ── helpers ──────────────────────────────────────────────────
function timeToIndices(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const periodIdx = h >= 12 ? 1 : 0;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const hourIdx = Math.max(0, HOURS.indexOf(String(hour12)));
  const nearestMin = MINUTES.reduce((best, min, i) =>
    Math.abs(parseInt(min) - m) < Math.abs(parseInt(MINUTES[best]) - m) ? i : best, 0);
  return { hourIdx, minuteIdx: nearestMin, periodIdx };
}

function indicesToHHMM(hIdx: number, mIdx: number, pIdx: number) {
  const h12 = parseInt(HOURS[hIdx]);
  let h = pIdx === 0 ? (h12 === 12 ? 0 : h12) : (h12 === 12 ? 12 : h12 + 12);
  return `${String(h).padStart(2, '0')}:${MINUTES[mIdx]}`;
}

function formatTime12(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

// ── Wheel Column ─────────────────────────────────────────────
function WheelColumn({
  items,
  selectedIndex,
  onSelect,
  typing,
  onStartTyping,
  onCommitTyped,
  className,
}: {
  items: string[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  typing: boolean;
  onStartTyping: () => void;
  onCommitTyped: (v: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const userScrolling = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [typedValue, setTypedValue] = useState('');

  // Scroll to selected when index changes (not during user scroll)
  useEffect(() => {
    if (ref.current && !userScrolling.current) {
      ref.current.scrollTo({ top: selectedIndex * ITEM_H, behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const handleScroll = useCallback(() => {
    userScrolling.current = true;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      userScrolling.current = false;
      if (!ref.current) return;
      const idx = Math.round(ref.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      ref.current.scrollTo({ top: clamped * ITEM_H, behavior: 'smooth' });
      onSelect(clamped);
    }, 120);
  }, [items.length, onSelect]);

  const handleCenterClick = () => {
    setTypedValue(items[selectedIndex]);
    onStartTyping();
  };

  const commit = (val: string) => {
    onCommitTyped(val.trim());
  };

  if (typing) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ height: ITEM_H * VISIBLE }}
      >
        <input
          autoFocus
          type="text"
          value={typedValue}
          onChange={e => setTypedValue(e.target.value)}
          onBlur={() => commit(typedValue)}
          onKeyDown={e => { if (e.key === 'Enter') commit(typedValue); }}
          className="w-full text-center text-3xl font-light bg-transparent outline-none text-foreground caret-[#E23232] selection:bg-[#E23232]/30"
          maxLength={2}
        />
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ height: ITEM_H * VISIBLE }}>
      {/* Scrollable column */}
      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        <div style={{ height: PAD }} />
        {items.map((item, i) => {
          const dist = Math.abs(i - selectedIndex);
          return (
            <div
              key={item}
              onClick={i === selectedIndex ? handleCenterClick : undefined}
              style={{ height: ITEM_H, scrollSnapAlign: 'center' }}
              className={cn(
                'flex items-center justify-center font-light select-none transition-all duration-150',
                i === selectedIndex
                  ? 'text-foreground text-[28px] cursor-text'
                  : dist === 1
                  ? 'text-foreground/55 text-[22px] cursor-default'
                  : 'text-foreground/15 text-[18px] cursor-default'
              )}
            >
              {item}
            </div>
          );
        })}
        <div style={{ height: PAD }} />
      </div>

      {/* Selection band */}
      <div
        className="absolute inset-x-0 pointer-events-none border-y border-foreground/[0.12]"
        style={{ top: PAD, height: ITEM_H }}
      />

      {/* Top fade */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none z-10"
        style={{ height: PAD, background: 'linear-gradient(to bottom, var(--card) 25%, transparent)' }}
      />
      {/* Bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
        style={{ height: PAD, background: 'linear-gradient(to top, var(--card) 25%, transparent)' }}
      />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
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

  // default time indices (9:00 AM)
  const defaultIndices = { hourIdx: 8, minuteIdx: 0, periodIdx: 0 };
  const parsedIndices = parsed
    ? timeToIndices(`${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`)
    : defaultIndices;

  const [hourIdx, setHourIdx] = useState(parsedIndices.hourIdx);
  const [minuteIdx, setMinuteIdx] = useState(parsedIndices.minuteIdx);
  const [periodIdx, setPeriodIdx] = useState(parsedIndices.periodIdx);

  // which column is in typing mode
  const [typingCol, setTypingCol] = useState<'hour' | 'minute' | 'period' | null>(null);

  function openPicker() {
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
      setPickedDate(new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
      const idx = timeToIndices(`${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`);
      setHourIdx(idx.hourIdx);
      setMinuteIdx(idx.minuteIdx);
      setPeriodIdx(idx.periodIdx);
    } else {
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
      setPickedDate(null);
      setHourIdx(defaultIndices.hourIdx);
      setMinuteIdx(defaultIndices.minuteIdx);
      setPeriodIdx(defaultIndices.periodIdx);
    }
    setTypingCol(null);
    setStep('date');
    setOpen(true);
  }

  function commitHourTyped(v: string) {
    const n = parseInt(v);
    if (!isNaN(n) && n >= 1 && n <= 12) {
      setHourIdx(HOURS.indexOf(String(n)));
    }
    setTypingCol(null);
  }

  function commitMinuteTyped(v: string) {
    const n = parseInt(v);
    if (!isNaN(n) && n >= 0 && n <= 59) {
      // snap to nearest 5-min
      const best = MINUTES.reduce((bi, min, i) =>
        Math.abs(parseInt(min) - n) < Math.abs(parseInt(MINUTES[bi]) - n) ? i : bi, 0);
      setMinuteIdx(best);
    }
    setTypingCol(null);
  }

  function commitPeriodTyped(v: string) {
    const upper = v.toUpperCase();
    if (upper === 'AM') setPeriodIdx(0);
    else if (upper === 'PM') setPeriodIdx(1);
    setTypingCol(null);
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
    setTimeout(() => setStep('time'), 120);
  }

  function handleConfirm() {
    if (!pickedDate) return;
    const hhmm = indicesToHHMM(hourIdx, minuteIdx, periodIdx);
    const [h, m] = hhmm.split(':').map(Number);
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
  const currentTimeStr = indicesToHHMM(hourIdx, minuteIdx, periodIdx);

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={openPicker}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left',
          displayValue
            ? 'border-[#E23232]/40 bg-[#E23232]/5'
            : 'border-border bg-foreground/[0.06] dark:bg-foreground/[0.03] hover:border-border'
        )}
      >
        <CalendarDays className={cn('w-4 h-4 shrink-0', displayValue ? 'text-[#E23232]' : 'text-foreground/55 dark:text-foreground/50')} />
        <span className={cn('text-sm', displayValue ? 'text-foreground font-medium' : 'text-foreground/55 dark:text-foreground/50')}>
          {displayValue ?? 'Pick date & time'}
        </span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />

          <div className="relative z-10 w-full sm:max-w-sm bg-card border border-border rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                {step === 'time' && (
                  <button
                    onClick={() => setStep('date')}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-colors mr-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                <span className="text-foreground font-semibold text-sm">
                  {step === 'date'
                    ? 'Select Date'
                    : pickedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── STEP 1: Calendar ── */}
            {step === 'date' && (
              <div className="px-4 pb-5">
                <div className="flex items-center justify-between py-4">
                  <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-foreground font-medium text-sm">{MONTHS[viewMonth]} {viewYear}</span>
                  <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 mb-1">
                  {DAYS.map(d => (
                    <div key={d} className="text-center text-[10px] font-medium text-foreground/50 py-1">{d}</div>
                  ))}
                </div>

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
                          past && 'text-foreground/50 cursor-not-allowed',
                          !past && !selected && 'text-foreground/70 hover:bg-foreground/10 hover:text-foreground',
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

            {/* ── STEP 2: iOS Wheel Time Picker ── */}
            {step === 'time' && (
              <div className="px-4 pb-5">
                {/* Hint */}
                <p className="text-[11px] font-mono text-foreground/60 text-center pt-4 pb-2 uppercase tracking-widest">
                  Scroll or tap to type
                </p>

                {/* Three wheels */}
                <div className="flex items-stretch gap-1">
                  {/* Hour */}
                  <WheelColumn
                    items={HOURS}
                    selectedIndex={hourIdx}
                    onSelect={setHourIdx}
                    typing={typingCol === 'hour'}
                    onStartTyping={() => setTypingCol('hour')}
                    onCommitTyped={commitHourTyped}
                    className="flex-1"
                  />

                  {/* Colon separator */}
                  <div className="flex items-center justify-center w-5 text-foreground/55 text-2xl font-light select-none pb-0.5">
                    :
                  </div>

                  {/* Minute */}
                  <WheelColumn
                    items={MINUTES}
                    selectedIndex={minuteIdx}
                    onSelect={setMinuteIdx}
                    typing={typingCol === 'minute'}
                    onStartTyping={() => setTypingCol('minute')}
                    onCommitTyped={commitMinuteTyped}
                    className="flex-1"
                  />

                  {/* AM/PM */}
                  <WheelColumn
                    items={PERIODS}
                    selectedIndex={periodIdx}
                    onSelect={setPeriodIdx}
                    typing={typingCol === 'period'}
                    onStartTyping={() => setTypingCol('period')}
                    onCommitTyped={commitPeriodTyped}
                    className="w-16"
                  />
                </div>

                {/* Confirm */}
                <button
                  onClick={handleConfirm}
                  className="w-full mt-4 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-[#E23232] text-white hover:bg-[#c92a2a] transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {pickedDate
                    ? `Confirm — ${pickedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${formatTime12(currentTimeStr)}`
                    : 'Confirm'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
