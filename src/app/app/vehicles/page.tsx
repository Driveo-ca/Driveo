'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AutocompleteInput } from '@/components/AutocompleteInput';
import { VEHICLE_TYPE_LABELS } from '@/lib/pricing';
import { VEHICLE_MAKE_LIST, getModelsForMake, getYearRange } from '@/lib/vehicle-data';
import { getVehicleImageUrl } from '@/lib/vehicle-image';
import { toast } from 'sonner';
import {
  Car, Plus, Star, Trash2, ChevronRight, Pencil, CalendarDays,
  Droplets, Shield, Gauge, Palette, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vehicle, VehicleType } from '@/types';

/** Fire-and-forget: generate all 11 dirty images using Gemini */
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
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formType, setFormType] = useState<VehicleType>('sedan');
  const [formMake, setFormMake] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formYear, setFormYear] = useState(new Date().getFullYear().toString());
  const [formColor, setFormColor] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [editType, setEditType] = useState<VehicleType>('sedan');
  const [editMake, setEditMake] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editSaving, setEditSaving] = useState(false);

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

    await supabase.from('vehicles').update({ is_primary: false }).eq('customer_id', user.id);
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
      if (selectedId === id) setSelectedId(null);
      loadVehicles();
    } catch {
      toast.error('Failed to delete vehicle');
    }
  }

  function openEdit(v: Vehicle) {
    setEditVehicle(v);
    setEditType(v.type);
    setEditMake(v.make);
    setEditModel(v.model);
    setEditYear(String(v.year));
    setEditColor(v.color || '');
    setEditDialogOpen(true);
  }

  async function saveEdit() {
    if (!editVehicle) return;
    setEditSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('vehicles').update({
      type: editType,
      make: editMake,
      model: editModel,
      year: parseInt(editYear),
      color: editColor || null,
    }).eq('id', editVehicle.id);

    if (error) {
      toast.error('Failed to update vehicle');
    } else {
      toast.success('Vehicle updated');
      setEditDialogOpen(false);
      setEditVehicle(null);
      loadVehicles();
    }
    setEditSaving(false);
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display text-foreground tracking-tight">My Garage</h1>
          <p className="text-foreground/40 text-sm mt-1">Your vehicles, ready to shine</p>
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
              <div className="space-y-2.5">
                <Label className="text-xs uppercase tracking-widest text-foreground/40 font-semibold">Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {vehicleTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setFormType(t)}
                      className={cn(
                        'p-2.5 rounded-xl border text-xs text-center transition-all duration-200 font-medium',
                        formType === t
                          ? 'border-[#E23232]/60 bg-[#E23232]/10 text-white'
                          : 'border-border bg-foreground/[0.02] text-foreground/40 hover:border-border hover:text-foreground/60'
                      )}
                    >
                      {VEHICLE_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground/40">Year</Label>
                  <AutocompleteInput options={yearOptions} value={formYear} onChange={setFormYear} placeholder="e.g. 2024" className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/20 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground/40">Make</Label>
                  <AutocompleteInput options={VEHICLE_MAKE_LIST} value={formMake} onChange={(val) => { setFormMake(val); if (val !== formMake) setFormModel(''); }} placeholder="e.g. Honda" className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/20 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground/40">Model</Label>
                  <AutocompleteInput options={getModelsForMake(formMake)} value={formModel} onChange={setFormModel} placeholder={formMake ? `${formMake} model` : 'Select make first'} className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/20 rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground/40">Color (optional)</Label>
                <Input placeholder="Silver" value={formColor} onChange={(e) => setFormColor(e.target.value)} className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/20 rounded-xl" />
              </div>
              <Button onClick={addVehicle} disabled={saving || !formMake || !formModel} className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white rounded-xl h-11 font-semibold transition-all">
                {saving ? 'Adding...' : 'Add Vehicle'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Vehicle Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-secondary border border-border text-foreground rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg tracking-tight">Edit Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div className="space-y-2.5">
              <Label className="text-xs uppercase tracking-widest text-foreground/40 font-semibold">Type</Label>
              <div className="grid grid-cols-4 gap-2">
                {vehicleTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setEditType(t)}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs text-center transition-all duration-200 font-medium',
                      editType === t
                        ? 'border-[#E23232]/60 bg-[#E23232]/10 text-white'
                        : 'border-border bg-foreground/[0.02] text-foreground/40 hover:border-border hover:text-foreground/60'
                    )}
                  >
                    {VEHICLE_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground/40">Year</Label>
                <AutocompleteInput options={yearOptions} value={editYear} onChange={setEditYear} placeholder="e.g. 2024" className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/20 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground/40">Make</Label>
                <AutocompleteInput options={VEHICLE_MAKE_LIST} value={editMake} onChange={(val) => { setEditMake(val); if (val !== editMake) setEditModel(''); }} placeholder="e.g. Honda" className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/20 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground/40">Model</Label>
                <AutocompleteInput options={getModelsForMake(editMake)} value={editModel} onChange={setEditModel} placeholder={editMake ? `${editMake} model` : 'Select make first'} className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/20 rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground/40">Color (optional)</Label>
              <Input placeholder="Silver" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/20 rounded-xl" />
            </div>
            <Button onClick={saveEdit} disabled={editSaving || !editMake || !editModel} className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white rounded-xl h-11 font-semibold transition-all">
              {editSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-foreground/[0.02] h-[280px] animate-pulse" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="mt-8">
          <div className="rounded-2xl border-2 border-dashed border-border hover:border-foreground/15 transition-colors duration-300">
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-foreground/[0.04] border border-border flex items-center justify-center mx-auto mb-5">
                <Car className="w-7 h-7 text-foreground/30" />
              </div>
              <p className="text-foreground/50 text-sm font-medium">No vehicles yet</p>
              <p className="text-foreground/30 text-xs mt-1.5">Add your first car to get started</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {vehicles.map((v) => {
            const isSelected = selectedId === v.id;
            const imgUrl = getVehicleImageUrl(v.make, v.model, v.year, {
              angle: 'front-side',
              width: 600,
              color: v.color || undefined,
            });

            return (
              <div
                key={v.id}
                onClick={() => setSelectedId(isSelected ? null : v.id)}
                className={cn(
                  'group relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300',
                  isSelected
                    ? 'border-[#E23232]/60 ring-1 ring-[#E23232]/30'
                    : v.is_primary
                    ? 'border-[#E23232]/30 hover:border-[#E23232]/50'
                    : 'border-border hover:border-foreground/15'
                )}
              >
                {/* Car image area */}
                <div className="relative h-[160px] overflow-hidden bg-gradient-to-br from-foreground/[0.04] to-foreground/[0.02]">
                  {/* Subtle gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-10" />

                  {/* Car image */}
                  <img
                    src={imgUrl}
                    alt={`${v.year} ${v.make} ${v.model}`}
                    className={cn(
                      'absolute inset-0 w-full h-full object-contain object-center p-2 transition-transform duration-500',
                      isSelected ? 'scale-105' : 'group-hover:scale-[1.03]'
                    )}
                    onError={(e) => {
                      // Hide broken image, show fallback
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />

                  {/* Fallback icon (shows through if image fails) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Car className="w-16 h-16 text-foreground/[0.06]" />
                  </div>

                  {/* Primary badge */}
                  {v.is_primary && (
                    <div className="absolute top-3 left-3 z-20">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E23232] text-white text-[10px] font-bold uppercase tracking-wider">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        Primary
                      </div>
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteVehicle(v.id); }}
                    className="absolute top-3 right-3 z-20 w-7 h-7 rounded-lg bg-background/60 backdrop-blur-sm border border-border flex items-center justify-center text-foreground/40 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Car info */}
                <div className="px-4 pt-3 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="text-foreground font-semibold text-[15px] truncate">
                        {v.year} {v.make} {v.model}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-foreground/25" />
                          <span className="text-foreground/40 text-xs">{VEHICLE_TYPE_LABELS[v.type]}</span>
                        </div>
                        {v.color && (
                          <div className="flex items-center gap-1">
                            <Palette className="w-3 h-3 text-foreground/25" />
                            <span className="text-foreground/40 text-xs">{v.color}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {!v.is_primary && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setPrimary(v.id); }}
                        className="p-1.5 rounded-lg text-foreground/25 hover:text-amber-400 hover:bg-amber-400/10 transition-all"
                        title="Set as primary"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded action buttons */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                    isSelected ? 'max-h-[80px] opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/app/book?vehicle=${v.id}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#E23232] hover:bg-[#c92a2a] text-white text-sm font-semibold transition-all active:scale-[0.98]"
                    >
                      <Droplets className="w-3.5 h-3.5" />
                      Book Now
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(v);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-foreground/[0.03] hover:bg-foreground/[0.06] text-foreground/60 hover:text-foreground text-sm font-medium transition-all active:scale-[0.98]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
