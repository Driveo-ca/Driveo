'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AutocompleteInput } from '@/components/AutocompleteInput';
import { toast } from 'sonner';
import { VEHICLE_TYPE_LABELS } from '@/lib/pricing';
import { VEHICLE_MAKE_LIST, getModelsForMake, getYearRange } from '@/lib/vehicle-data';
import type { VehicleType } from '@/types';
import { Car, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const yearOptions = getYearRange().map(String);

const vehicleTypes: { type: VehicleType; emoji: string }[] = [
  { type: 'sedan', emoji: '🚗' },
  { type: 'coupe', emoji: '🏎️' },
  { type: 'crossover', emoji: '🚙' },
  { type: 'suv', emoji: '🚙' },
  { type: 'minivan', emoji: '🚐' },
  { type: 'pickup', emoji: '🛻' },
  { type: 'large_suv', emoji: '🚛' },
  { type: 'convertible', emoji: '🏎️' },
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-[#E23232]/10 flex items-center justify-center">
              <Car className="w-6 h-6 text-[#E23232]" />
            </div>
          </div>
          <CardTitle className="text-xl font-display text-foreground">
            {step === 1 ? 'What type of car?' : 'Car details'}
          </CardTitle>
          <CardDescription className="text-foreground/50">
            {step === 1
              ? 'Select your vehicle type for accurate pricing'
              : 'Tell us about your ride'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {vehicleTypes.map(({ type, emoji }) => (
                  <button
                    key={type}
                    onClick={() => setVehicleType(type)}
                    className={cn(
                      'p-4 rounded-xl border text-left transition-all',
                      vehicleType === type
                        ? 'border-[#E23232] bg-[#E23232]/10'
                        : 'border-border bg-foreground/5 hover:border-border'
                    )}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <p className="text-foreground text-sm font-medium mt-2">
                      {VEHICLE_TYPE_LABELS[type]}
                    </p>
                  </button>
                ))}
              </div>
              <Button
                onClick={() => vehicleType && setStep(2)}
                disabled={!vehicleType}
                className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white"
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <AutocompleteInput
                  options={yearOptions}
                  value={year}
                  onChange={setYear}
                  placeholder="e.g. 2024"
                  className="bg-foreground/5 border-border text-foreground placeholder:text-foreground/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Make</Label>
                <AutocompleteInput
                  options={VEHICLE_MAKE_LIST}
                  value={make}
                  onChange={(val) => {
                    setMake(val);
                    if (val !== make) setModel('');
                  }}
                  placeholder="e.g. Honda, Toyota, BMW"
                  className="bg-foreground/5 border-border text-foreground placeholder:text-foreground/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <AutocompleteInput
                  options={modelOptions}
                  value={model}
                  onChange={setModel}
                  placeholder={make ? `Select ${make} model` : 'Select make first'}
                  className="bg-foreground/5 border-border text-foreground placeholder:text-foreground/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Color (optional)</Label>
                <Input
                  placeholder="e.g. Silver, Black"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="bg-foreground/5 border-border text-foreground placeholder:text-foreground/30"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-border text-foreground hover:bg-foreground/5"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSaveVehicle}
                  disabled={loading || !make || !model}
                  className="flex-1 bg-[#E23232] hover:bg-[#c92a2a] text-white"
                >
                  {loading ? 'Saving...' : 'Save Vehicle'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
