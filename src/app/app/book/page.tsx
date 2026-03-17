'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { DriveoSlide } from '@/components/driveo-slide/DriveoSlide';
import { CalendarPicker } from '@/components/CalendarPicker';
import { calculatePrice, centsToDisplay, formatDuration, PLAN_LABELS } from '@/lib/pricing';
import { getVehicleImageUrl } from '@/lib/vehicle-image';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Car, MapPin, ChevronRight, ChevronLeft, Zap, CalendarDays, Sparkles,
  Clock, CreditCard, Loader2, ShieldCheck, Lock,
} from 'lucide-react';
import type { Vehicle, WashPlan, BookingFormData } from '@/types';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const STEPS = ['Vehicle', 'Location', 'Wash & Dirt', 'When', 'Review', 'Payment'];

// ── Payment Form (mounted inside Stripe Elements provider) ──
function PaymentForm({
  onSuccess,
  onBack,
  totalCents,
  submitting,
  setSubmitting,
}: {
  onSuccess: (bookingId: string) => void;
  onBack: () => void;
  totalCents: number;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentReady, setPaymentReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!stripe || !elements) return;

    setSubmitting(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/app/book/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed. Please try again.');
      setSubmitting(false);
      return;
    }

    // Payment confirmed (pre-authorized) — booking was already created server-side
    // The bookingId was stored when we created the PaymentIntent
    // We retrieve it from the payment intent's metadata via redirect or manual success
    onSuccess('');
  }, [stripe, elements, setSubmitting, onSuccess]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-display text-white">Payment</h2>

      <Card className="bg-[#0a0a0a] border-white/10">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-2">
            <Lock className="w-3 h-3" />
            <span>Secure payment powered by Stripe</span>
          </div>

          <PaymentElement
            onReady={() => setPaymentReady(true)}
            options={{
              layout: 'tabs',
            }}
          />

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <ShieldCheck className="w-4 h-4 text-green-500/60" />
            <p className="text-white/30 text-[11px]">
              Your card will be pre-authorized for {centsToDisplay(totalCents)}. You are only charged after the wash is completed.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={submitting}
          className="flex-1 border-white/10 text-white hover:bg-white/5"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !stripe || !paymentReady}
          className="flex-1 bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
          ) : (
            <><CreditCard className="w-4 h-4 mr-2" /> Authorize {centsToDisplay(totalCents)}</>
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Main Booking Form ──
function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPlan = searchParams.get('plan') as WashPlan | null;

  const [step, setStep] = useState(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Stripe state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [form, setForm] = useState<BookingFormData>({
    vehicleId: '',
    vehicle: null,
    address: '',
    lat: 0,
    lng: 0,
    locationNotes: '',
    washPlan: preselectedPlan || 'regular',
    dirtLevel: 5,
    isInstant: true,
    scheduledAt: null,
  });

  useEffect(() => {
    async function loadVehicles() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', user.id)
        .order('is_primary', { ascending: false });

      if (data && data.length > 0) {
        setVehicles(data);
        const primary = data.find((v) => v.is_primary) || data[0];
        setForm((f) => ({ ...f, vehicleId: primary.id, vehicle: primary }));
      }
      setLoading(false);
    }
    loadVehicles();
  }, []);

  const price = form.vehicle
    ? calculatePrice(form.washPlan, form.vehicle.type, form.dirtLevel)
    : null;

  function nextStep() {
    if (step === 0 && !form.vehicleId) {
      toast.error('Select a vehicle');
      return;
    }
    if (step === 1 && !form.address) {
      toast.error('Enter your address');
      return;
    }
    if (step === 3 && !form.isInstant && !form.scheduledAt) {
      toast.error('Pick a date and time');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  // Create booking + PaymentIntent when moving from Review to Payment
  async function handleProceedToPayment() {
    if (!form.vehicle || !price) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: form.vehicleId,
          washPlan: form.washPlan,
          dirtLevel: form.dirtLevel,
          serviceAddress: form.address,
          serviceLat: form.lat,
          serviceLng: form.lng,
          locationNotes: form.locationNotes,
          isInstant: form.isInstant,
          scheduledAt: form.scheduledAt,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to create booking');
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      setClientSecret(data.clientSecret);
      setBookingId(data.bookingId);
      setStep(5); // Move to payment step
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  function handlePaymentSuccess() {
    toast.success('Booking confirmed! Finding you a washer...');
    router.push(`/app/track/${bookingId}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#E23232] animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-8 max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={cn(
                'h-1 w-full rounded-full transition-colors',
                i <= step ? 'bg-[#E23232]' : 'bg-white/10'
              )}
            />
            <span className={cn(
              'text-[10px]',
              i <= step ? 'text-white/60' : 'text-white/20'
            )}>
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* Step 0: Vehicle */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-display text-white">What car are you washing?</h2>
          {vehicles.length === 0 ? (
            <Card className="bg-[#0a0a0a] border-dashed border-white/20">
              <CardContent className="p-6 text-center">
                <p className="text-white/40 text-sm mb-3">No vehicles saved yet</p>
                <Button onClick={() => router.push('/app/onboarding')} className="bg-[#E23232] text-white">
                  Add Vehicle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setForm((f) => ({ ...f, vehicleId: v.id, vehicle: v }))}
                  className={cn(
                    'w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all',
                    form.vehicleId === v.id
                      ? 'border-[#E23232] bg-[#E23232]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  )}
                >
                  <Car className={cn('w-5 h-5', form.vehicleId === v.id ? 'text-[#E23232]' : 'text-white/40')} />
                  <div>
                    <p className="text-white text-sm font-medium">{v.year} {v.make} {v.model}</p>
                    <p className="text-white/40 text-xs capitalize">{v.type.replace('_', ' ')}{v.color ? ` · ${v.color}` : ''}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          <Button onClick={nextStep} disabled={!form.vehicleId} className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white mt-2">
            Continue <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-display text-white">Where is your car?</h2>
          <div className="space-y-3">
            <AddressAutocomplete
              value={form.address}
              onChange={(address, lat, lng) => setForm((f) => ({ ...f, address, lat, lng }))}
              placeholder="Enter your address"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
            <Input
              placeholder="Notes (e.g. parking spot P2, gate code 1234)"
              value={form.locationNotes}
              onChange={(e) => setForm((f) => ({ ...f, locationNotes: e.target.value }))}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="flex-1 border-white/10 text-white hover:bg-white/5">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button onClick={nextStep} disabled={!form.address} className="flex-1 bg-[#E23232] hover:bg-[#c92a2a] text-white">
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Driveo Slide + Plan */}
      {step === 2 && form.vehicle && (
        <div className="space-y-4">
          <DriveoSlide
            vehicleType={form.vehicle.type}
            vehicleImageUrl={form.vehicle.image_url || getVehicleImageUrl(form.vehicle.make, form.vehicle.model, form.vehicle.year)}
            vehicleLabel={`${form.vehicle.year} ${form.vehicle.make} ${form.vehicle.model}`}
            selectedPlan={form.washPlan}
            onPlanSelect={(plan) => setForm((f) => ({ ...f, washPlan: plan }))}
            onDirtLevelChange={(level) => setForm((f) => ({ ...f, dirtLevel: level }))}
            initialDirtLevel={form.dirtLevel}
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="flex-1 border-white/10 text-white hover:bg-white/5">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button onClick={nextStep} className="flex-1 bg-[#E23232] hover:bg-[#c92a2a] text-white">
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: When */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-display text-white">When do you want it?</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setForm((f) => ({ ...f, isInstant: true, scheduledAt: null }))}
              className={cn(
                'p-5 rounded-xl border text-center transition-all',
                form.isInstant
                  ? 'border-[#E23232] bg-[#E23232]/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              )}
            >
              <Zap className={cn('w-6 h-6 mx-auto mb-2', form.isInstant ? 'text-[#E23232]' : 'text-white/40')} />
              <p className={cn('text-sm font-semibold', form.isInstant ? 'text-white' : 'text-white/60')}>Now</p>
              <p className="text-white/30 text-xs mt-1">Next available washer</p>
            </button>
            <button
              onClick={() => setForm((f) => ({ ...f, isInstant: false }))}
              className={cn(
                'p-5 rounded-xl border text-center transition-all',
                !form.isInstant
                  ? 'border-[#E23232] bg-[#E23232]/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              )}
            >
              <CalendarDays className={cn('w-6 h-6 mx-auto mb-2', !form.isInstant ? 'text-[#E23232]' : 'text-white/40')} />
              <p className={cn('text-sm font-semibold', !form.isInstant ? 'text-white' : 'text-white/60')}>Schedule</p>
              <p className="text-white/30 text-xs mt-1">Pick date & time</p>
            </button>
          </div>

          {!form.isInstant && (
            <CalendarPicker
              value={form.scheduledAt}
              onChange={(iso) => setForm((f) => ({ ...f, scheduledAt: iso }))}
            />
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="flex-1 border-white/10 text-white hover:bg-white/5">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              onClick={nextStep}
              disabled={!form.isInstant && !form.scheduledAt}
              className="flex-1 bg-[#E23232] hover:bg-[#c92a2a] text-white"
            >
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && form.vehicle && price && (
        <div className="space-y-4">
          <h2 className="text-lg font-display text-white">Review your booking</h2>

          <Card className="bg-[#0a0a0a] border-white/10">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Car className="w-4 h-4 text-white/40" />
                <span className="text-white text-sm">{form.vehicle.year} {form.vehicle.make} {form.vehicle.model}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-white/40" />
                <span className="text-white text-sm">{form.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-white/40" />
                <span className="text-white text-sm">{PLAN_LABELS[form.washPlan]} · Dirt level {form.dirtLevel}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-white/40" />
                <span className="text-white text-sm">
                  {form.isInstant ? 'Now — next available' : new Date(form.scheduledAt!).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-white/40" />
                <span className="text-white/50 text-sm">Est. {formatDuration(price.estimatedDurationMin)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0a0a] border-white/10">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">{price.planLabel}</span>
                <span className="text-white">{centsToDisplay(price.basePriceCents)}</span>
              </div>
              {price.vehicleMultiplier !== 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Vehicle ({price.vehicleMultiplier}x)</span>
                  <span className="text-white/70">+{centsToDisplay(Math.round(price.basePriceCents * (price.vehicleMultiplier - 1)))}</span>
                </div>
              )}
              {price.dirtMultiplier !== 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Dirt level {form.dirtLevel} ({price.dirtMultiplier}x)</span>
                  <span className="text-amber-400">+{centsToDisplay(Math.round(price.basePriceCents * price.vehicleMultiplier * (price.dirtMultiplier - 1)))}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-white/50">HST (13%)</span>
                <span className="text-white/70">{centsToDisplay(price.hstCents)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
                <span className="text-white">Total</span>
                <span className="text-[#E23232] text-lg">{centsToDisplay(price.totalCents)}</span>
              </div>
              <p className="text-white/30 text-[10px] flex items-center gap-1 pt-1">
                <CreditCard className="w-3 h-3" />
                Card pre-authorized. Charged only after wash is complete.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="flex-1 border-white/10 text-white hover:bg-white/5">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              onClick={handleProceedToPayment}
              disabled={submitting}
              className="flex-1 bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up...</>
              ) : (
                <><CreditCard className="w-4 h-4 mr-2" /> Proceed to Payment</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Payment (Stripe Elements) */}
      {step === 5 && clientSecret && price && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#E23232',
                colorBackground: '#0a0a0a',
                colorText: '#f5f5f5',
                colorTextSecondary: '#999999',
                colorDanger: '#ef4444',
                fontFamily: 'Inter, system-ui, sans-serif',
                borderRadius: '12px',
                spacingUnit: '4px',
              },
              rules: {
                '.Input': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f5f5f5',
                },
                '.Input:focus': {
                  border: '1px solid #E23232',
                  boxShadow: '0 0 0 1px #E23232',
                },
                '.Label': {
                  color: 'rgba(255, 255, 255, 0.5)',
                },
                '.Tab': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
                '.Tab--selected': {
                  backgroundColor: 'rgba(226, 50, 50, 0.1)',
                  border: '1px solid #E23232',
                  color: '#f5f5f5',
                },
                '.Tab:hover': {
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                },
              },
            },
          }}
        >
          <PaymentForm
            onSuccess={handlePaymentSuccess}
            onBack={() => {
              // Go back to review — note: the booking + PI were already created
              // The user can still go back and re-confirm
              setStep(4);
            }}
            totalCents={price.totalCents}
            submitting={submitting}
            setSubmitting={setSubmitting}
          />
        </Elements>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense>
      <BookingForm />
    </Suspense>
  );
}
