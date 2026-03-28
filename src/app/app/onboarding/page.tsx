'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { AutocompleteInput } from '@/components/AutocompleteInput';
import { toast } from 'sonner';
import { VEHICLE_TYPE_LABELS } from '@/lib/pricing';
import { VEHICLE_MAKE_LIST, getModelsForMake, getYearRange } from '@/lib/vehicle-data';
import type { VehicleType } from '@/types';
import { ChevronRight, ChevronLeft, Loader2, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const yearOptions = getYearRange().map(String);

const vehicleTypes: { type: VehicleType; icon: string; desc: string }[] = [
  { type: 'sedan', icon: '🚗', desc: 'Honda Civic, Toyota Camry' },
  { type: 'coupe', icon: '🏎️', desc: 'BMW 4 Series, Mustang' },
  { type: 'crossover', icon: '🚙', desc: 'RAV4, CR-V, Tucson' },
  { type: 'suv', icon: '🚙', desc: 'Explorer, Highlander' },
  { type: 'minivan', icon: '🚐', desc: 'Sienna, Odyssey, Pacifica' },
  { type: 'pickup', icon: '🛻', desc: 'F-150, RAM, Silverado' },
  { type: 'large_suv', icon: '🚛', desc: 'Suburban, Expedition' },
  { type: 'convertible', icon: '🏎️', desc: 'Miata, Z4, Boxster' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const modelOptions = getModelsForMake(make);

  async function handleSaveVehicle() {
    if (!vehicleType || !make || !model || !year) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Not logged in');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('vehicles').insert({
      customer_id: user.id,
      make,
      model,
      year: parseInt(year),
      color: color || null,
      type: vehicleType,
      is_primary: true,
    });

    if (error) {
      toast.error('Failed to save vehicle');
      setLoading(false);
      return;
    }

    toast.success('Vehicle added!');
    router.push('/app/home');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <style jsx global>{`
        @keyframes onbSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes onbFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes onbScale {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .onb-in {
          animation: onbSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .onb-fade {
          animation: onbFadeIn 0.5s ease forwards;
          opacity: 0;
        }
        .onb-scale {
          animation: onbScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-[#E23232]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#E23232]/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <div className={`px-6 pt-6 flex items-center justify-between ${mounted ? 'onb-fade' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className={cn(
                'h-1 rounded-full transition-all duration-500',
                step >= 1 ? 'w-8 bg-[#E23232]' : 'w-4 bg-foreground/10'
              )} />
              <div className={cn(
                'h-1 rounded-full transition-all duration-500',
                step >= 2 ? 'w-8 bg-[#E23232]' : 'w-4 bg-foreground/10'
              )} />
            </div>
            <span className="text-[11px] font-mono text-foreground/50 uppercase tracking-wider">
              Step {step}/2
            </span>
          </div>

          {/* Skip */}
          <button
            onClick={() => { router.push('/app/home'); router.refresh(); }}
            className="text-[12px] text-foreground/50 hover:text-foreground/50 transition-colors font-medium"
          >
            Skip for now
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg">

            {step === 1 ? (
              /* ═══ STEP 1 — Vehicle Type ═══ */
              <div key="step1">
                {/* Header */}
                <div className={`text-center mb-8 ${mounted ? 'onb-in' : 'opacity-0'}`} style={{ animationDelay: '0.15s' }}>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E23232]/[0.08] border border-[#E23232]/[0.15] mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-[#E23232]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#E23232]">Let&apos;s get started</span>
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide leading-none">
                    WHAT DO YOU DRIVE?
                  </h1>
                  <p className="text-foreground/55 text-sm mt-2">
                    Select your vehicle type for accurate pricing
                  </p>
                </div>

                {/* Vehicle type grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  {vehicleTypes.map(({ type, icon, desc }, i) => (
                    <button
                      key={type}
                      onClick={() => setVehicleType(type)}
                      className={cn(
                        'group relative p-4 rounded-2xl border text-left transition-all duration-300',
                        mounted ? 'onb-scale' : 'opacity-0',
                        vehicleType === type
                          ? 'border-[#E23232]/60 bg-[#E23232]/[0.08] shadow-[0_0_24px_rgba(226,50,50,0.1)]'
                          : 'border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/[0.12] hover:bg-foreground/[0.04]'
                      )}
                      style={{ animationDelay: `${0.2 + i * 0.04}s` }}
                    >
                      {/* Selection indicator */}
                      <div className={cn(
                        'absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300',
                        vehicleType === type
                          ? 'bg-[#E23232] scale-100'
                          : 'bg-foreground/[0.06] scale-90'
                      )}>
                        {vehicleType === type && <Check className="w-3 h-3 text-white" />}
                      </div>

                      <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform duration-300 w-fit">{icon}</span>
                      <p className={cn(
                        'text-sm font-semibold transition-colors',
                        vehicleType === type ? 'text-foreground' : 'text-foreground/70'
                      )}>
                        {VEHICLE_TYPE_LABELS[type]}
                      </p>
                      <p className="text-[11px] text-foreground/50 mt-0.5 leading-tight">{desc}</p>
                    </button>
                  ))}
                </div>

                {/* Continue button */}
                <div className={mounted ? 'onb-in' : 'opacity-0'} style={{ animationDelay: '0.55s' }}>
                  <button
                    onClick={() => vehicleType && setStep(2)}
                    disabled={!vehicleType}
                    className="w-full h-13 rounded-xl bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97] disabled:opacity-25 disabled:cursor-not-allowed shadow-[0_4px_24px_rgba(226,50,50,0.3)] disabled:shadow-none"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* ═══ STEP 2 — Vehicle Details ═══ */
              <div key="step2">
                {/* Header */}
                <div className="text-center mb-8 onb-in" style={{ animationDelay: '0.05s' }}>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] mb-4">
                    <span className="text-lg">{vehicleTypes.find(v => v.type === vehicleType)?.icon}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/50">
                      {vehicleType && VEHICLE_TYPE_LABELS[vehicleType]}
                    </span>
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide leading-none">
                    YOUR RIDE DETAILS
                  </h1>
                  <p className="text-foreground/55 text-sm mt-2">
                    We&apos;ll use this to match you with the right wash
                  </p>
                </div>

                {/* Form */}
                <div className="space-y-4 overflow-visible">
                  {/* Year */}
                  <div className="onb-in relative z-30" style={{ animationDelay: '0.1s' }}>
                    <label className="block text-[11px] uppercase tracking-[0.1em] text-foreground/55 font-semibold mb-2">Year</label>
                    <AutocompleteInput
                      options={yearOptions}
                      value={year}
                      onChange={setYear}
                      placeholder="e.g. 2024"
                      className="h-12 rounded-xl bg-foreground/[0.03] border-foreground/[0.08] text-foreground placeholder:text-foreground/50 focus:border-[#E23232]/50 focus:ring-[#E23232]/10"
                    />
                  </div>

                  {/* Make */}
                  <div className="onb-in relative z-20" style={{ animationDelay: '0.15s' }}>
                    <label className="block text-[11px] uppercase tracking-[0.1em] text-foreground/55 font-semibold mb-2">Make</label>
                    <AutocompleteInput
                      options={VEHICLE_MAKE_LIST}
                      value={make}
                      onChange={(val) => { setMake(val); if (val !== make) setModel(''); }}
                      placeholder="e.g. Honda, Toyota, BMW"
                      className="h-12 rounded-xl bg-foreground/[0.03] border-foreground/[0.08] text-foreground placeholder:text-foreground/50 focus:border-[#E23232]/50 focus:ring-[#E23232]/10"
                    />
                  </div>

                  {/* Model */}
                  <div className="onb-in relative z-10" style={{ animationDelay: '0.2s' }}>
                    <label className="block text-[11px] uppercase tracking-[0.1em] text-foreground/55 font-semibold mb-2">Model</label>
                    <AutocompleteInput
                      options={modelOptions}
                      value={model}
                      onChange={setModel}
                      placeholder={make ? `Select ${make} model` : 'Select make first'}
                      className="h-12 rounded-xl bg-foreground/[0.03] border-foreground/[0.08] text-foreground placeholder:text-foreground/50 focus:border-[#E23232]/50 focus:ring-[#E23232]/10"
                    />
                  </div>

                  {/* Color */}
                  <div className="onb-in" style={{ animationDelay: '0.25s' }}>
                    <label className="block text-[11px] uppercase tracking-[0.1em] text-foreground/55 font-semibold mb-2">
                      Color <span className="text-foreground/20 normal-case tracking-normal">(optional)</span>
                    </label>
                    <Input
                      placeholder="e.g. Silver, Black, White"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-12 rounded-xl bg-foreground/[0.03] border-foreground/[0.08] text-foreground placeholder:text-foreground/50 focus:border-[#E23232]/50 focus:ring-[#E23232]/10"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6 onb-in" style={{ animationDelay: '0.3s' }}>
                  <button
                    onClick={() => setStep(1)}
                    className="h-13 px-5 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] text-foreground/60 hover:text-foreground hover:bg-foreground/[0.05] font-medium text-sm flex items-center gap-1.5 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handleSaveVehicle}
                    disabled={loading || !make || !model}
                    className="flex-1 h-13 rounded-xl bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97] disabled:opacity-25 disabled:cursor-not-allowed shadow-[0_4px_24px_rgba(226,50,50,0.3)] disabled:shadow-none"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Save & Continue
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Bottom info */}
        <div className={`px-6 pb-6 text-center ${mounted ? 'onb-fade' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          <p className="text-[11px] text-foreground/20">
            You can always update your vehicle later in settings
          </p>
        </div>
      </div>
    </div>
  );
}
