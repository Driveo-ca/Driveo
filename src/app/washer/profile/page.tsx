'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User, Star, MapPin, Wrench, Briefcase, Car, Edit2, Save, X, CreditCard, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  washer_profiles: {
    status: string;
    bio: string | null;
    service_zones: string[] | null;
    vehicle_make: string | null;
    vehicle_model: string | null;
    vehicle_year: number | null;
    tools_owned: string[] | null;
    rating_avg: number;
    jobs_completed: number;
    is_online: boolean;
    stripe_account_id: string | null;
  } | null;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  pending:   { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',  label: 'Pending Approval' },
  approved:  { color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',   label: 'Approved' },
  suspended: { color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',          label: 'Suspended' },
  rejected:  { color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',          label: 'Rejected' },
};

export default function WasherProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [bio, setBio] = useState('');
  const [zonesInput, setZonesInput] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [toolsInput, setToolsInput] = useState('');
  const [stripeLoading, setStripeLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*, washer_profiles(*)').eq('id', user.id).single();
    if (data) {
      setProfile(data as ProfileData);
      const wp = (data as ProfileData).washer_profiles;
      if (wp) {
        setBio(wp.bio || '');
        setZonesInput((wp.service_zones || []).join(', '));
        setVehicleMake(wp.vehicle_make || '');
        setVehicleModel(wp.vehicle_model || '');
        setVehicleYear(wp.vehicle_year ? String(wp.vehicle_year) : '');
        setToolsInput((wp.tools_owned || []).join(', '));
      }
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const zones = zonesInput.split(',').map((s) => s.trim()).filter(Boolean);
    const tools = toolsInput.split(',').map((s) => s.trim()).filter(Boolean);

    const { error } = await supabase.from('washer_profiles').update({
      bio: bio || null,
      service_zones: zones.length ? zones : null,
      vehicle_make: vehicleMake || null,
      vehicle_model: vehicleModel || null,
      vehicle_year: vehicleYear ? parseInt(vehicleYear) : null,
      tools_owned: tools.length ? tools : null,
    }).eq('id', user.id);

    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile updated!');
      setEditing(false);
      fetchProfile();
    }
    setSaving(false);
  }

  async function handleStripeConnect() {
    setStripeLoading(true);
    const res = await fetch('/api/washer/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnUrl: `${window.location.origin}/washer/profile`, refreshUrl: `${window.location.origin}/washer/connect/refresh` }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else toast.error('Failed to open Stripe Connect');
    setStripeLoading(false);
  }

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-5 pt-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-4">
            <div className="h-8 w-48 rounded-lg bg-foreground/[0.04] animate-pulse" />
            <div className="h-56 w-full rounded-2xl bg-foreground/[0.04] animate-pulse" />
            <div className="h-32 w-full rounded-2xl bg-foreground/[0.04] animate-pulse" />
          </div>
          <div className="hidden lg:block space-y-4">
            <div className="h-40 w-full rounded-2xl bg-foreground/[0.04] animate-pulse" />
            <div className="h-32 w-full rounded-2xl bg-foreground/[0.04] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const wp = profile?.washer_profiles;
  const statusCfg = statusConfig[wp?.status || 'pending'];

  return (
    <div className="max-w-[1280px] mx-auto px-5 pt-4 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Profile</h1>
          <p className="text-foreground/65 text-xs mt-0.5 font-mono">{profile?.email}</p>
        </div>
        {!editing ? (
          <Button
            onClick={() => setEditing(true)}
            variant="outline"
            className="rounded-xl h-9 px-4 text-sm border-border/60 gap-2"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setEditing(false)}
              variant="ghost"
              className="rounded-xl h-9 px-3 text-foreground/60"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#E23232] hover:bg-[#c92a2a] text-white rounded-xl h-9 px-5 border-0 gap-2 text-sm font-semibold active:scale-[0.98] transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

        {/* ── LEFT: Identity + Bio + Stripe ── */}
        <div className="space-y-4 min-w-0">

          {/* Identity Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="border border-border/50 rounded-2xl p-5 overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#E23232]/40 via-[#E23232]/20 to-transparent" />
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-foreground/[0.05] border border-border/50 flex items-center justify-center">
                  <User className="w-6 h-6 text-foreground/60" />
                </div>
                {wp?.is_online && (
                  <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-background border-2 border-background flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-foreground">{profile?.full_name}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge variant="outline" className={cn('rounded-md px-2.5 py-0.5 text-[10px] uppercase tracking-[0.08em]', statusCfg?.color)}>
                    {statusCfg?.label}
                  </Badge>
                  {wp?.is_online && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            {wp && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-foreground/[0.04] rounded-xl p-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Star className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-400" />
                    <span className="text-foreground font-bold text-xl">{Number(wp.rating_avg).toFixed(1)}</span>
                  </div>
                  <p className="font-mono text-[10px] text-foreground/65 uppercase tracking-[0.08em]">Rating</p>
                </div>
                <div className="bg-foreground/[0.04] rounded-xl p-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Briefcase className="w-4 h-4 text-foreground/65" />
                    <span className="text-foreground font-bold text-xl">{wp.jobs_completed}</span>
                  </div>
                  <p className="font-mono text-[10px] text-foreground/65 uppercase tracking-[0.08em]">Jobs Done</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="border border-border/50 rounded-2xl p-5"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-foreground/65 font-semibold mb-3">Bio</p>
            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell customers about yourself..."
                rows={3}
                className="w-full bg-foreground/[0.04] border border-border/60 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-[#E23232]/50"
              />
            ) : (
              <p className="text-sm text-foreground/60 leading-relaxed">
                {wp?.bio || <span className="text-foreground/50 italic">No bio yet. Tap Edit to add one.</span>}
              </p>
            )}
          </motion.div>

          {/* Stripe Connect */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="border border-border/50 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-3.5 h-3.5 text-foreground/65" />
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-foreground/65 font-semibold">Payout Account</p>
            </div>
            {wp?.stripe_account_id ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Connected</p>
                  <p className="text-[10px] text-foreground/60 mt-0.5 font-mono">{wp.stripe_account_id}</p>
                </div>
                <Button
                  onClick={handleStripeConnect}
                  disabled={stripeLoading}
                  variant="outline"
                  className="rounded-xl h-9 px-4 text-xs border-border/60 gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Manage
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-foreground/65 mb-3">Connect your bank account to receive payouts after each job.</p>
                <Button
                  onClick={handleStripeConnect}
                  disabled={stripeLoading}
                  className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white rounded-xl h-11 border-0 font-semibold text-sm active:scale-[0.98] transition-all"
                >
                  {stripeLoading ? 'Opening...' : 'Set Up Payouts'}
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── RIGHT: Details Sidebar ── */}
        <div className="space-y-4">

          {/* Service Zones */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-border/50 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-3.5 h-3.5 text-foreground/65" />
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-foreground/65 font-semibold">Service Zones</p>
            </div>
            {editing ? (
              <div>
                <Input
                  value={zonesInput}
                  onChange={(e) => setZonesInput(e.target.value)}
                  placeholder="Scarborough, Markham, North York..."
                  className="bg-foreground/[0.04] border-border/60 text-sm h-11 rounded-xl placeholder:text-foreground/50"
                />
                <p className="text-[10px] text-foreground/65 mt-1.5 font-mono">Comma-separated</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {wp?.service_zones?.length ? wp.service_zones.map((z) => (
                  <span key={z} className="bg-foreground/[0.04] border border-border/50 px-3 py-1.5 rounded-md text-xs text-foreground/60 font-medium">{z}</span>
                )) : <span className="text-foreground/50 text-sm italic">No zones set</span>}
              </div>
            )}
          </motion.div>

          {/* Vehicle */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="border border-border/50 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Car className="w-3.5 h-3.5 text-foreground/65" />
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-foreground/65 font-semibold">Vehicle</p>
            </div>
            {editing ? (
              <div className="grid grid-cols-3 gap-2">
                <Input value={vehicleYear} onChange={(e) => setVehicleYear(e.target.value)} placeholder="Year" className="bg-foreground/[0.04] border-border/60 text-sm h-11 rounded-xl placeholder:text-foreground/50" />
                <Input value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} placeholder="Make" className="bg-foreground/[0.04] border-border/60 text-sm h-11 rounded-xl placeholder:text-foreground/50" />
                <Input value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} placeholder="Model" className="bg-foreground/[0.04] border-border/60 text-sm h-11 rounded-xl placeholder:text-foreground/50" />
              </div>
            ) : (
              <p className="text-sm text-foreground/60 font-medium">
                {wp?.vehicle_make
                  ? `${wp.vehicle_year} ${wp.vehicle_make} ${wp.vehicle_model}`
                  : <span className="text-foreground/50 italic">No vehicle set</span>}
              </p>
            )}
          </motion.div>

          {/* Tools */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="border border-border/50 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-3.5 h-3.5 text-foreground/65" />
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-foreground/65 font-semibold">Tools Owned</p>
            </div>
            {editing ? (
              <div>
                <Input
                  value={toolsInput}
                  onChange={(e) => setToolsInput(e.target.value)}
                  placeholder="Foam cannon, pressure washer, microfibre..."
                  className="bg-foreground/[0.04] border-border/60 text-sm h-11 rounded-xl placeholder:text-foreground/50"
                />
                <p className="text-[10px] text-foreground/65 mt-1.5 font-mono">Comma-separated</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {wp?.tools_owned?.length ? wp.tools_owned.map((t) => (
                  <span key={t} className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#E23232]/10 text-[#E23232]/70 border border-[#E23232]/20">{t}</span>
                )) : <span className="text-foreground/50 text-sm italic">No tools listed</span>}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
