'use client';

import { useState, useMemo } from 'react';
import { DirtCanvas } from './DirtCanvas';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import {
  calculatePrice,
  centsToDisplay,
  formatDuration,
  DIRT_LABELS,
  PLAN_LABELS,
} from '@/lib/pricing';
import type { VehicleType, WashPlan } from '@/types';
import { cn } from '@/lib/utils';
import { Car, Sparkles, Zap, Clock, DollarSign } from 'lucide-react';

interface DriveoSlideProps {
  vehicleType: VehicleType;
  vehicleImageUrl: string;
  vehicleLabel: string; // e.g. "2022 Honda CR-V"
  selectedPlan?: WashPlan;
  onPlanSelect?: (plan: WashPlan) => void;
  onDirtLevelChange?: (level: number) => void;
  initialDirtLevel?: number;
}

const planIcons: Record<WashPlan, React.ReactNode> = {
  regular: <Car className="w-5 h-5" />,
  interior_exterior: <Sparkles className="w-5 h-5" />,
  detailing: <Zap className="w-5 h-5" />,
};

export function DriveoSlide({
  vehicleType,
  vehicleImageUrl,
  vehicleLabel,
  selectedPlan,
  onPlanSelect,
  onDirtLevelChange,
  initialDirtLevel = 5,
}: DriveoSlideProps) {
  const [dirtLevel, setDirtLevel] = useState(initialDirtLevel);
  const [activePlan, setActivePlan] = useState<WashPlan>(selectedPlan || 'regular');

  // Calculate prices for all plans at current dirt level + vehicle
  const prices = useMemo(() => ({
    regular: calculatePrice('regular', vehicleType, dirtLevel),
    interior_exterior: calculatePrice('interior_exterior', vehicleType, dirtLevel),
    detailing: calculatePrice('detailing', vehicleType, dirtLevel),
  }), [vehicleType, dirtLevel]);

  const activePrice = prices[activePlan];

  function handleDirtChange(value: number | readonly number[]) {
    const level = Array.isArray(value) ? value[0] : value;
    setDirtLevel(level);
    onDirtLevelChange?.(level);
  }

  function handlePlanSelect(plan: WashPlan) {
    setActivePlan(plan);
    onPlanSelect?.(plan);
  }

  // Color for the slider track based on dirt level
  const sliderColor = dirtLevel <= 3
    ? 'text-green-500'
    : dirtLevel <= 6
      ? 'text-yellow-500'
      : dirtLevel <= 8
        ? 'text-orange-500'
        : 'text-red-500';

  return (
    <div className="space-y-5">
      {/* Car Image with Dirt Overlay */}
      <div className="text-center">
        <p className="text-white/40 text-xs mb-3 uppercase tracking-wider">
          How dirty is your car?
        </p>
        <DirtCanvas
          imageUrl={vehicleImageUrl}
          dirtLevel={dirtLevel}
          width={400}
          height={260}
        />
        <p className="text-white/60 text-xs mt-2">{vehicleLabel}</p>
      </div>

      {/* Dirt Level Slider */}
      <div className="space-y-3 px-2">
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-xs">Clean</span>
          <span className={cn('text-sm font-semibold', sliderColor)}>
            Level {dirtLevel} — {DIRT_LABELS[dirtLevel]}
          </span>
          <span className="text-white/40 text-xs">Extreme</span>
        </div>
        <Slider
          value={[dirtLevel]}
          onValueChange={handleDirtChange}
          min={0}
          max={10}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-white/20 text-[10px] px-0.5">
          {Array.from({ length: 11 }, (_, i) => (
            <span key={i}>{i}</span>
          ))}
        </div>
      </div>

      {/* Plan Selection Cards */}
      <div className="grid grid-cols-3 gap-2">
        {(['regular', 'interior_exterior', 'detailing'] as WashPlan[]).map((plan) => {
          const price = prices[plan];
          const isActive = activePlan === plan;
          return (
            <button
              key={plan}
              onClick={() => handlePlanSelect(plan)}
              className={cn(
                'rounded-xl border p-3 text-center transition-all',
                isActive
                  ? 'border-[#E23232] bg-[#E23232]/10 ring-1 ring-[#E23232]/30'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              )}
            >
              <div className={cn('mx-auto mb-1.5', isActive ? 'text-[#E23232]' : 'text-white/50')}>
                {planIcons[plan]}
              </div>
              <p className={cn('text-xs font-medium leading-tight', isActive ? 'text-white' : 'text-white/70')}>
                {PLAN_LABELS[plan]}
              </p>
              <p className={cn('text-sm font-bold mt-1', isActive ? 'text-[#E23232]' : 'text-white/60')}>
                {centsToDisplay(price.totalCents)}
              </p>
              <p className="text-white/30 text-[10px] mt-0.5">
                {formatDuration(price.estimatedDurationMin)}
              </p>
            </button>
          );
        })}
      </div>

      {/* Price Breakdown for Selected Plan */}
      <Card className="bg-[#0a0a0a] border-white/10">
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">{activePrice.planLabel}</span>
            <span className="text-white">{centsToDisplay(activePrice.basePriceCents)}</span>
          </div>
          {activePrice.vehicleMultiplier !== 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Vehicle surcharge ({activePrice.vehicleMultiplier}x)</span>
              <span className="text-white/70">
                +{centsToDisplay(Math.round(activePrice.basePriceCents * (activePrice.vehicleMultiplier - 1)))}
              </span>
            </div>
          )}
          {activePrice.dirtMultiplier !== 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Dirt surcharge ({activePrice.dirtMultiplier}x)</span>
              <span className="text-amber-400">
                +{centsToDisplay(Math.round(activePrice.basePriceCents * activePrice.vehicleMultiplier * (activePrice.dirtMultiplier - 1)))}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-white/50">HST (13%)</span>
            <span className="text-white/70">{centsToDisplay(activePrice.hstCents)}</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-semibold">
            <span className="text-white">Total</span>
            <span className="text-[#E23232] text-lg">{centsToDisplay(activePrice.totalCents)}</span>
          </div>
          <div className="flex items-center gap-4 pt-1 text-white/40 text-xs">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> ~{formatDuration(activePrice.estimatedDurationMin)}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Washer earns {centsToDisplay(activePrice.washerPayoutCents)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
