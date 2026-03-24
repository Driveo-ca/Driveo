'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AutocompleteInput } from '@/components/AutocompleteInput';
import { VEHICLE_TYPE_LABELS } from '@/lib/pricing';
import { VEHICLE_MAKE_LIST, getModelsForMake, getYearRange } from '@/lib/vehicle-data';
import { toast } from 'sonner';
import { Car, Plus, Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vehicle, VehicleType } from '@/types';

/** Fire-and-forget: generate all 11 dirty images using Gemini (no Imagin Studio) */
function triggerDirtyCarGeneration(vehicleId: string, make: string, model: string, year: number, color?: string) {
  const vehicleLabel = `${year} ${make} ${model}`;
  for (let level = 0; level <= 10; level++) {
    fetch('/api/generate-dirty-car', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId, dirtLevel: level, vehicleLabel, vehicleColor: color || 'Pearl White' }),
    }).catch(() => {});
  }
}

const yearOptions = getYearRange().map(String);

const vehicleTypes: VehicleType[] = [
  'sedan', 'coupe', 'crossover', 'suv', 'minivan', 'pickup', 'large_suv', 'convertible',
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formType, setFormType] = useState<VehicleType>('sedan');
  const [formMake, setFormMake] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formYear, setFormYear] = useState(new Date().getFullYear().toString());
  const [formColor, setFormColor] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadVehicles() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('customer_id', user.id)
      .order('is_primary', { ascending: false });

    if (data) setVehicles(data);
    setLoading(false);
  }

  useEffect(() => { loadVehicles(); }, []);

  async function addVehicle() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: inserted, error } = await supabase.from('vehicles').insert({
      customer_id: user.id,
      make: formMake,
      model: formModel,
      year: parseInt(formYear),
      color: formColor || null,
      type: formType,
      is_primary: vehicles.length === 0,
    }).select('id').single();

    if (error) {
      toast.error('Failed to add vehicle');
    } else {
      toast.success('Vehicle added — generating car images in the background');
      // Kick off AI dirty-car generation for all 11 levels (fire & forget)
      if (inserted?.id) {
        triggerDirtyCarGeneration(inserted.id, formMake, formModel, parseInt(formYear), formColor || undefined);
      }
      setDialogOpen(false);
      setFormMake('');
      setFormModel('');
      setFormColor('');
      loadVehicles();
    }
    setSaving(false);
  }

  async function setPrimary(id: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Unset all primary
    await supabase.from('vehicles').update({ is_primary: false }).eq('customer_id', user.id);
    // Set new primary
    await supabase.from('vehicles').update({ is_primary: true }).eq('id', id);
    toast.success('Primary vehicle updated');
    loadVehicles();
  }

  async function deleteVehicle(id: string) {
    if (!confirm('Remove this vehicle?')) return;
    try {
      const res = await fetch('/api/vehicles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || 'Failed to delete vehicle');
        return;
      }
      toast.success('Vehicle removed');
      loadVehicles();
    } catch {
      toast.error('Failed to delete vehicle');
    }
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display text-foreground tracking-tight">My Vehicles</h1>
          <p className="text-foreground/60 dark:text-foreground/40 text-sm mt-1">Manage your vehicle garage</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button size="sm" className="bg-[#E23232] hover:bg-[#c92a2a] text-white rounded-xl gap-1.5">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-secondary border border-border text-foreground rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-lg tracking-tight">Add Vehicle</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 mt-2">
              {/* Vehicle Type Grid */}
              <div className="space-y-2.5">
                <Label className="text-xs uppercase tracking-widest text-foreground/60 dark:text-foreground/40 font-semibold">Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {vehicleTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setFormType(t)}
                      className={cn(
                        'p-2.5 rounded-xl border text-xs text-center transition-all duration-200 font-medium',
                        formType === t
                          ? 'border-[#E23232]/60 bg-[#E23232]/10 text-white'
                          : 'border-border bg-foreground/[0.02] text-foreground/60 dark:text-foreground/40 hover:border-border hover:text-foreground/60'
                      )}
                    >
                      {VEHICLE_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground/60 dark:text-foreground/40">Year</Label>
                  <AutocompleteInput options={yearOptions} value={formYear} onChange={setFormYear} placeholder="e.g. 2024" className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/50 dark:placeholder:text-foreground/20 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground/60 dark:text-foreground/40">Make</Label>
                  <AutocompleteInput options={VEHICLE_MAKE_LIST} value={formMake} onChange={(val) => { setFormMake(val); if (val !== formMake) setFormModel(''); }} placeholder="e.g. Honda" className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/50 dark:placeholder:text-foreground/20 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground/60 dark:text-foreground/40">Model</Label>
                  <AutocompleteInput options={getModelsForMake(formMake)} value={formModel} onChange={setFormModel} placeholder={formMake ? `${formMake} model` : 'Select make first'} className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/50 dark:placeholder:text-foreground/20 rounded-xl" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-foreground/60 dark:text-foreground/40">Color (optional)</Label>
                <Input placeholder="Silver" value={formColor} onChange={(e) => setFormColor(e.target.value)} className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/50 dark:placeholder:text-foreground/20 rounded-xl" />
              </div>

              <Button onClick={addVehicle} disabled={saving || !formMake || !formModel} className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white rounded-xl h-11 font-semibold transition-all">
                {saving ? 'Adding...' : 'Add Vehicle'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl">
              <div className="p-4 h-20 animate-pulse" />
            </div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="mt-8">
          <div className="rounded-2xl border-2 border-dashed border-border hover:border-border transition-colors duration-300">
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-foreground/[0.06] dark:bg-foreground/[0.03] border border-border flex items-center justify-center mx-auto mb-5">
                <Car className="w-7 h-7 text-foreground/50 dark:text-foreground/45" />
              </div>
              <p className="text-foreground/60 dark:text-foreground/40 text-sm font-medium">No vehicles yet</p>
              <p className="text-foreground/50 dark:text-foreground/45 text-xs mt-1.5">Add one to get started</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="stagger-children space-y-3">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className={cn(
                'bg-surface border border-border rounded-2xl transition-all duration-300 hover:border-border',
                v.is_primary && 'border-[#E23232]/40'
              )}
            >
              <div className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-foreground/[0.07] dark:bg-foreground/[0.04] border border-border flex items-center justify-center">
                  <Car className="w-5 h-5 text-foreground/60 dark:text-foreground/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <p className="text-foreground text-sm font-medium truncate">
                      {v.year} {v.make} {v.model}
                    </p>
                    {v.is_primary && (
                      <span className="text-[9px] uppercase tracking-[0.15em] text-[#E23232] bg-[#E23232]/10 border border-[#E23232]/20 px-2 py-0.5 rounded-md font-bold shrink-0">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-foreground/60 dark:text-foreground/40 text-xs capitalize mt-0.5">
                    {VEHICLE_TYPE_LABELS[v.type]}{v.color ? ` · ${v.color}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  {!v.is_primary && (
                    <button
                      onClick={() => setPrimary(v.id)}
                      className="p-2.5 rounded-lg text-foreground/55 dark:text-foreground/50 hover:text-[#E23232] hover:bg-[#E23232]/10 transition-all duration-200"
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteVehicle(v.id)}
                    className="p-2.5 rounded-lg text-foreground/55 dark:text-foreground/50 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
