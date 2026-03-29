'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AutocompleteInput } from '@/components/AutocompleteInput';
import { VEHICLE_TYPE_LABELS, VEHICLE_MULTIPLIERS } from '@/lib/pricing';
import { VEHICLE_MAKE_LIST, getModelsForMake, getYearRange, getModelVehicleType } from '@/lib/vehicle-data';
import { getVehicleImageUrl } from '@/lib/vehicle-image';
import { toast } from 'sonner';
import {
  Car, Plus, Star, Trash2, ChevronRight, Pencil, CalendarDays,
  Droplets, Shield, Gauge, Palette, X, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vehicle, VehicleType } from '@/types';

const yearOptions = getYearRange().map(String);

const vehicleTypes: VehicleType[] = [
  'sedan', 'coupe', 'crossover', 'suv', 'minivan', 'pickup', 'large_suv', 'convertible',
];

/** Representative car for each vehicle type (popular/iconic models) */
const TYPE_SHOWCASE: Record<VehicleType, { make: string; model: string; year: number }> = {
  sedan: { make: 'BMW', model: '3 Series', year: 2024 },
  coupe: { make: 'Audi', model: 'A5', year: 2024 },
  crossover: { make: 'Mazda', model: 'CX-5', year: 2024 },
  suv: { make: 'Range Rover', model: 'Sport', year: 2024 },
  minivan: { make: 'Toyota', model: 'Sienna', year: 2024 },
  pickup: { make: 'Ford', model: 'F-150', year: 2024 },
  large_suv: { make: 'Cadillac', model: 'Escalade', year: 2024 },
  convertible: { make: 'Porsche', model: 'Boxster', year: 2024 },
};

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [formType, setFormType] = useState<VehicleType>('sedan');
  const [formMake, setFormMake] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formYear, setFormYear] = useState(new Date().getFullYear().toString());
  const [formColor, setFormColor] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteSubCount, setDeleteSubCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

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
      toast.success('Vehicle added');
      setDialogOpen(false);
      setFormStep(1);
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

  async function deleteVehicle(id: string, force = false) {
    setDeletingId(id);
    try {
      const res = await fetch('/api/vehicles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, force }),
      });
      const result = await res.json();

      if (res.status === 409 && result.error === 'has_subscriptions') {
        setDeleteTargetId(id);
        setDeleteSubCount(result.subscriptionCount);
        setDeleteConfirmOpen(true);
        setDeletingId(null);
        return;
      }

      if (!res.ok) {
        toast.error(result.error || 'Failed to delete vehicle');
        setDeletingId(null);
        return;
      }
      toast.success('Vehicle removed');
      if (selectedId === id) setSelectedId(null);
      loadVehicles();
    } catch {
      toast.error('Failed to delete vehicle');
    }
    setDeletingId(null);
  }

  async function confirmDeleteWithSubs() {
    if (!deleteTargetId) return;
    setDeleting(true);
    await deleteVehicle(deleteTargetId, true);
    setDeleting(false);
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
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
          <p className="text-foreground/55 text-sm mt-1">Your vehicles, ready to shine</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setFormStep(1); }}>
          <DialogTrigger className="inline-flex items-center justify-center gap-1.5 px-3 h-8 text-sm font-medium bg-[#E23232] hover:bg-[#c92a2a] text-white rounded-xl transition-colors cursor-pointer">
            <Plus className="w-4 h-4" /> Add
          </DialogTrigger>
          <DialogContent className={cn(
            'bg-secondary border border-border text-foreground rounded-2xl transition-all overflow-visible',
            formStep === 1 ? 'max-w-lg sm:max-w-xl' : 'max-w-md'
          )}>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="font-display text-lg tracking-tight">
                    {formStep === 1 ? 'What type of vehicle?' : 'Vehicle Details'}
                  </DialogTitle>
                  <p className="text-foreground/55 text-xs mt-0.5">
                    {formStep === 1 ? 'Select your vehicle category' : `${VEHICLE_TYPE_LABELS[formType]} — tell us more`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mr-6">
                  <div className={cn('w-6 h-1 rounded-full transition-colors', 'bg-[#E23232]')} />
                  <div className={cn('w-6 h-1 rounded-full transition-colors', formStep === 2 ? 'bg-[#E23232]' : 'bg-foreground/10')} />
                </div>
              </div>
            </DialogHeader>

            {/* ── Step 1: Vehicle Type Cards ── */}
            {formStep === 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                {vehicleTypes.map((t) => {
                  const showcase = TYPE_SHOWCASE[t];
                  const imgUrl = getVehicleImageUrl(showcase.make, showcase.model, showcase.year, {
                    angle: 'front-side',
                    width: 400,
                  });
                  const isSelected = formType === t;
                  return (
                    <button
                      key={t}
                      onClick={() => { setFormType(t); setFormStep(2); }}
                      className={cn(
                        'group relative rounded-xl border overflow-hidden text-left transition-all duration-200',
                        isSelected
                          ? 'border-[#E23232]/60 ring-1 ring-[#E23232]/30'
                          : 'border-border hover:border-foreground/20'
                      )}
                    >
                      {/* Car image */}
                      <div className="relative h-[90px] sm:h-[80px] bg-gradient-to-br from-foreground/[0.03] to-foreground/[0.01] overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={VEHICLE_TYPE_LABELS[t]}
                          className="absolute inset-0 w-full h-full object-contain object-center p-1 transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Car className="w-8 h-8 text-foreground/[0.04]" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent" />
                      </div>
                      {/* Label */}
                      <div className="px-2.5 py-2">
                        <span className={cn(
                          'text-xs font-semibold transition-colors',
                          isSelected ? 'text-[#E23232]' : 'text-foreground/70 group-hover:text-foreground'
                        )}>
                          {VEHICLE_TYPE_LABELS[t]}
                        </span>
                        <span className="block text-[9px] text-foreground/40 mt-0.5">
                          {VEHICLE_MULTIPLIERS[t] === 1 ? 'Standard' : `${VEHICLE_MULTIPLIERS[t]}x pricing`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Step 2: Vehicle Details Form ── */}
            {formStep === 2 && (
              <div className="space-y-5 mt-2 overflow-visible">
                {/* Selected type preview */}
                <button
                  onClick={() => setFormStep(1)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors group"
                >
                  <div className="w-16 h-12 rounded-lg bg-foreground/[0.03] overflow-hidden shrink-0">
                    <img
                      src={getVehicleImageUrl(TYPE_SHOWCASE[formType].make, TYPE_SHOWCASE[formType].model, TYPE_SHOWCASE[formType].year, { angle: 'front-side', width: 200 })}
                      alt={VEHICLE_TYPE_LABELS[formType]}
                      className="w-full h-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-semibold text-foreground">{VEHICLE_TYPE_LABELS[formType]}</span>
                    <span className="block text-[10px] text-foreground/50">Tap to change type</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground/40 group-hover:text-foreground/60 rotate-180 transition-colors" />
                </button>

                <div className="space-y-3 overflow-visible">
                  <div className="space-y-1.5 relative z-30">
                    <Label className="text-xs text-foreground/55">Year</Label>
                    <AutocompleteInput options={yearOptions} value={formYear} onChange={setFormYear} placeholder="e.g. 2024" className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/50 rounded-xl" />
                  </div>
                  <div className="space-y-1.5 relative z-20">
                    <Label className="text-xs text-foreground/55">Make</Label>
                    <AutocompleteInput options={VEHICLE_MAKE_LIST} value={formMake} onChange={(val) => { setFormMake(val); if (val !== formMake) setFormModel(''); }} placeholder="e.g. Honda" className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/50 rounded-xl" />
                  </div>
                  <div className="space-y-1.5 relative z-10">
                    <Label className="text-xs text-foreground/55">Model</Label>
                    <AutocompleteInput options={getModelsForMake(formMake)} value={formModel} onChange={(val) => { setFormModel(val); const detected = getModelVehicleType(formMake, val); if (detected) setFormType(detected); }} placeholder={formMake ? `${formMake} model` : 'Select make first'} className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/50 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground/55">Color (optional)</Label>
                  <Input placeholder="Silver" value={formColor} onChange={(e) => setFormColor(e.target.value)} className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/50 rounded-xl" />
                </div>
                <Button onClick={addVehicle} disabled={saving || !formMake || !formModel} className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white rounded-xl h-11 font-semibold transition-all">
                  {saving ? 'Adding...' : 'Add Vehicle'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Confirmation Dialog (subscription warning) */}
      <Dialog open={deleteConfirmOpen} onOpenChange={(open) => { setDeleteConfirmOpen(open); if (!open) setDeleteTargetId(null); }}>
        <DialogContent className="bg-secondary border border-border text-foreground rounded-2xl max-w-sm">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="font-display text-lg tracking-tight text-center">
              Active Subscription
            </DialogTitle>
            <DialogDescription className="text-foreground/55 text-sm text-center mt-2">
              This vehicle has {deleteSubCount} active subscription{deleteSubCount > 1 ? 's' : ''}. Removing it will cancel the subscription{deleteSubCount > 1 ? 's' : ''} and you won&apos;t be billed further.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2.5 mt-4">
            <Button
              variant="outline"
              onClick={() => { setDeleteConfirmOpen(false); setDeleteTargetId(null); }}
              className="flex-1 rounded-xl border-border text-foreground/70 hover:text-foreground"
            >
              Keep Vehicle
            </Button>
            <Button
              onClick={confirmDeleteWithSubs}
              disabled={deleting}
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Removing...' : 'Remove & Cancel'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-secondary border border-border text-foreground rounded-2xl max-w-md overflow-visible">
          <DialogHeader>
            <DialogTitle className="font-display text-lg tracking-tight">Edit Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2 overflow-visible">
            <div className="space-y-2.5">
              <Label className="text-xs uppercase tracking-widest text-foreground/55 font-semibold">Type</Label>
              <div className="grid grid-cols-4 gap-2">
                {vehicleTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setEditType(t)}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs text-center transition-all duration-200 font-medium',
                      editType === t
                        ? 'border-[#E23232]/60 bg-[#E23232]/10 text-[#E23232]'
                        : 'border-border bg-foreground/[0.02] text-foreground/55 hover:border-border hover:text-foreground/60'
                    )}
                  >
                    {VEHICLE_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3 overflow-visible">
              <div className="space-y-1.5 relative z-30">
                <Label className="text-xs text-foreground/55">Year</Label>
                <AutocompleteInput options={yearOptions} value={editYear} onChange={setEditYear} placeholder="e.g. 2024" className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/50 rounded-xl" />
              </div>
              <div className="space-y-1.5 relative z-20">
                <Label className="text-xs text-foreground/55">Make</Label>
                <AutocompleteInput options={VEHICLE_MAKE_LIST} value={editMake} onChange={(val) => { setEditMake(val); if (val !== editMake) setEditModel(''); }} placeholder="e.g. Honda" className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/50 rounded-xl" />
              </div>
              <div className="space-y-1.5 relative z-10">
                <Label className="text-xs text-foreground/55">Model</Label>
                <AutocompleteInput options={getModelsForMake(editMake)} value={editModel} onChange={(val) => { setEditModel(val); const detected = getModelVehicleType(editMake, val); if (detected) setEditType(detected); }} placeholder={editMake ? `${editMake} model` : 'Select make first'} className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/50 rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground/55">Color (optional)</Label>
              <Input placeholder="Silver" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground text-sm placeholder:text-foreground/50 rounded-xl" />
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
                <Car className="w-7 h-7 text-foreground/50" />
              </div>
              <p className="text-foreground/50 text-sm font-medium">No vehicles yet</p>
              <p className="text-foreground/50 text-xs mt-1.5">Add your first car to get started</p>
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
                    disabled={deletingId === v.id}
                    onClick={(e) => { e.stopPropagation(); deleteVehicle(v.id); }}
                    className={cn(
                      'absolute top-3 right-3 z-20 w-7 h-7 rounded-lg backdrop-blur-sm border flex items-center justify-center transition-all',
                      deletingId === v.id
                        ? 'bg-foreground/10 border-border text-foreground/50 opacity-100 cursor-not-allowed animate-pulse'
                        : 'bg-background/60 border-border text-foreground/55 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 opacity-0 group-hover:opacity-100'
                    )}
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
                          <Gauge className="w-3 h-3 text-foreground/50" />
                          <span className="text-foreground/55 text-xs">{VEHICLE_TYPE_LABELS[v.type]}</span>
                        </div>
                        {v.color && (
                          <div className="flex items-center gap-1">
                            <Palette className="w-3 h-3 text-foreground/50" />
                            <span className="text-foreground/55 text-xs">{v.color}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {!v.is_primary && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setPrimary(v.id); }}
                        className="p-1.5 rounded-lg text-foreground/50 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-400/10 transition-all"
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
