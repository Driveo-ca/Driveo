'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  User, Mail, Phone, Copy, Check, Pencil, Save,
  LogOut, Shield, ChevronRight, X, Camera, Loader2,
  Gift, Car, CreditCard, HelpCircle, Bell, Receipt,
} from 'lucide-react';

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  customer_profiles: {
    referral_code: string | null;
    default_address: string | null;
  } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '' });

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const email = user.email || '';
      setAuthEmail(email);

      const { data } = await supabase
        .from('profiles')
        .select('*, customer_profiles(*)')
        .eq('id', user.id)
        .single();

      const fullName =
        (data?.full_name && data.full_name.trim()) ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        '';

      const merged: ProfileData = {
        id: user.id,
        full_name: fullName,
        email: data?.email || email,
        phone: data?.phone || null,
        avatar_url: data?.avatar_url || user.user_metadata?.avatar_url || null,
        role: data?.role || 'customer',
        customer_profiles: data?.customer_profiles || null,
      };

      setProfile(merged);
      setForm({ full_name: fullName, phone: data?.phone || '' });
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, phone: form.phone || null, updated_at: new Date().toISOString() })
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to save changes');
    } else {
      setProfile({ ...profile, full_name: form.full_name, phone: form.phone });
      setEditing(false);
      toast.success('Profile updated');
    }
    setSaving(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/auth/upload-avatar', { method: 'POST', body: formData });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Failed to upload photo');
      } else {
        setProfile({ ...profile, avatar_url: json.url });
        toast.success('Profile photo updated');
      }
    } catch {
      toast.error('Failed to upload photo');
    }
    setUploadingPhoto(false);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const copyReferral = () => {
    const code = profile?.customer_profiles?.referral_code;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayEmail = profile?.email || authEmail;
  const initials = (profile?.full_name || displayEmail || 'U').charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen text-foreground">
        <div className="max-w-xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-10 w-48 bg-foreground/[0.04] rounded-lg" />
          <Skeleton className="h-36 w-full bg-foreground/[0.04] rounded-2xl" />
          <Skeleton className="h-56 w-full bg-foreground/[0.04] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Profile</h1>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 text-xs font-medium text-foreground/50 hover:text-foreground/70 px-3 py-1.5 rounded-lg hover:bg-foreground/[0.05] transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(false);
                  setForm({ full_name: profile?.full_name || '', phone: profile?.phone || '' });
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-foreground/50 hover:text-foreground/70 px-3 py-1.5 rounded-lg hover:bg-foreground/[0.05] transition-all"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#E23232] hover:bg-[#c92a2a] px-4 py-1.5 rounded-lg transition-all active:scale-[0.97] disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {/* ─── Avatar Hero Card ─── */}
        <div className="relative rounded-2xl border border-border/50 overflow-hidden mb-5">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E23232]/[0.06] via-transparent to-[#E23232]/[0.03]" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#E23232]/40 via-[#E23232]/15 to-transparent" />

          <div className="relative flex items-center gap-5 p-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-[#E23232]/10 border-2 border-[#E23232]/20 flex items-center justify-center overflow-hidden">
                {uploadingPhoto ? (
                  <Loader2 className="w-6 h-6 text-[#E23232] animate-spin" />
                ) : profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#E23232] font-bold text-3xl">{initials}</span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-[#E23232] flex items-center justify-center border-2 border-background hover:bg-[#c92a2a] transition-colors shadow-md"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {/* Name & meta */}
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-foreground truncate leading-tight">
                {profile?.full_name || <span className="text-foreground/55 italic text-base font-normal">No name set</span>}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E23232]/10 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#E23232]">
                  {profile?.role || 'Customer'}
                </span>
              </div>
              {displayEmail && (
                <p className="text-xs text-foreground/50 mt-2 truncate">{displayEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* ─── Personal Information ─── */}
        <div className="rounded-2xl border border-border/50 overflow-hidden mb-5">
          <div className="px-5 pt-5 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/55">Personal Information</span>
              <div className="h-px flex-1 bg-border/50" />
            </div>
          </div>

          <div className="divide-y divide-border/40">
            {/* Full Name */}
            <div className="px-5 py-4">
              {editing ? (
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground/55 mb-2 block">Full Name</label>
                  <Input
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    className="bg-foreground/[0.04] border-border/60 text-foreground rounded-xl h-11 placeholder:text-foreground/50"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-foreground/[0.05] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-foreground/55" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground/55 mb-0.5">Full Name</p>
                    <p className={cn('text-sm', profile?.full_name ? 'text-foreground/80 font-medium' : 'text-foreground/55 italic')}>
                      {profile?.full_name || 'Not set'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-foreground/[0.05] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-foreground/55" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground/55 mb-0.5">Email</p>
                  <p className={cn('text-sm', displayEmail ? 'text-foreground/80 font-medium' : 'text-foreground/55 italic')}>
                    {displayEmail || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="px-5 py-4">
              {editing ? (
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground/55 mb-2 block">Phone</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (416) 555-0123"
                    className="bg-foreground/[0.04] border-border/60 text-foreground rounded-xl h-11 placeholder:text-foreground/50"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-foreground/[0.05] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-foreground/55" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground/55 mb-0.5">Phone</p>
                    <p className={cn('text-sm', profile?.phone ? 'text-foreground/80 font-medium' : 'text-foreground/55 italic')}>
                      {profile?.phone || 'Not set'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Referral Code ─── */}
        {profile?.customer_profiles?.referral_code && (
          <div className="relative rounded-2xl border border-[#E23232]/20 overflow-hidden mb-5">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E23232]/[0.05] via-transparent to-[#E23232]/[0.02]" />
            <div className="relative p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#E23232]/10 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-[#E23232]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Referral Code</p>
                  <p className="text-[11px] text-foreground/60 mt-0.5">Share with friends to earn rewards</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex-1 bg-foreground/[0.04] border border-border/50 rounded-xl px-4 py-3 text-center">
                  <code className="text-lg font-mono text-[#E23232] tracking-[0.25em] font-bold">
                    {profile.customer_profiles.referral_code}
                  </code>
                </div>
                <button
                  onClick={copyReferral}
                  className={cn(
                    'w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-all',
                    copied
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                      : 'bg-foreground/[0.04] border-border/50 text-foreground/50 hover:text-foreground/70 hover:bg-foreground/[0.06]'
                  )}
                >
                  {copied ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Quick Links ─── */}
        <div className="rounded-2xl border border-border/50 overflow-hidden mb-5">
          <div className="px-5 pt-5 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/55">Account</span>
              <div className="h-px flex-1 bg-border/50" />
            </div>
          </div>

          <div className="divide-y divide-border/40">
            {([
              { icon: Car, label: 'My Vehicles', desc: 'Manage your cars', href: '/app/vehicles' },
              { icon: CreditCard, label: 'Subscription', desc: 'Membership & billing', href: '/app/membership' },
              { icon: Receipt, label: 'Billing & History', desc: 'Payments & transactions', href: '/app/billing' },
              { icon: Bell, label: 'Notifications', desc: 'Alerts & preferences', href: '/app/notifications' },
              { icon: Shield, label: 'Privacy & Security', desc: 'Password & data', href: '/app/privacy-security' },
            ] as const).map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-foreground/[0.03] transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-foreground/[0.05] group-hover:bg-foreground/[0.07] flex items-center justify-center shrink-0 transition-colors">
                  <item.icon className="w-4 h-4 text-foreground/55 group-hover:text-foreground/60 transition-colors" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">{item.label}</p>
                  <p className="text-[11px] text-foreground/55 mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/55 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* ─── Sign Out ─── */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl border border-red-500/20 hover:border-red-500/30 bg-red-500/[0.04] hover:bg-red-500/[0.07] transition-all disabled:opacity-50 group"
        >
          {loggingOut ? (
            <Loader2 className="w-4 h-4 text-red-500 dark:text-red-400 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4 text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors" />
          )}
          <span className="text-sm font-medium text-red-500 dark:text-red-400">
            {loggingOut ? 'Signing out...' : 'Sign Out'}
          </span>
        </button>

        <div className="pb-20" />
      </div>
    </div>
  );
}
