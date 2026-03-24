'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  User, Mail, Phone, Copy, Check, Pencil, Save,
  LogOut, Shield, ChevronRight, X, Camera, Loader2,
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

      // Build name from every possible source
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
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `avatars/${profile.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error('Failed to upload photo');
      setUploadingPhoto(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', profile.id);

    if (updateError) {
      toast.error('Failed to update profile photo');
    } else {
      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success('Profile photo updated');
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
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-10 w-48 bg-foreground/5 rounded-lg" />
        <Skeleton className="h-28 w-full bg-foreground/5 rounded-2xl" />
        <Skeleton className="h-56 w-full bg-foreground/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display text-foreground tracking-tight">Profile</h1>
        {!editing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            className="border-border text-foreground/70 hover:bg-foreground/5 hover:text-foreground rounded-xl gap-2"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(false);
                setForm({ full_name: profile?.full_name || '', phone: profile?.phone || '' });
              }}
              className="border-border text-foreground/60 dark:text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-xl"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-[#E23232] hover:bg-[#c92a2a] text-white rounded-xl gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {/* Avatar Hero */}
      <div className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-5">
        {/* Avatar with upload */}
        <div className="relative shrink-0">
          <div className="w-[72px] h-[72px] rounded-full bg-[#E23232]/10 border-2 border-[#E23232]/30 flex items-center justify-center overflow-hidden">
            {uploadingPhoto ? (
              <Loader2 className="w-6 h-6 text-[#E23232] animate-spin" />
            ) : profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#E23232] font-display text-2xl">{initials}</span>
            )}
          </div>
          {/* Camera button */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#E23232] flex items-center justify-center border-2 border-[#050505] hover:bg-[#c92a2a] transition-colors"
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

        <div className="min-w-0">
          <p className="text-xl font-semibold text-foreground truncate">
            {profile?.full_name || <span className="text-foreground/55 dark:text-foreground/50 italic text-base">No name set</span>}
          </p>
          <p className="text-sm text-foreground/60 dark:text-foreground/40 mt-0.5 capitalize">{profile?.role || 'Customer'}</p>
          {displayEmail && (
            <p className="text-xs text-foreground/55 dark:text-foreground/50 mt-1 truncate">{displayEmail}</p>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
        <h2 className="text-xs uppercase tracking-[0.2em] text-foreground/60 dark:text-foreground/40 font-semibold">Personal Information</h2>

        {/* Full Name */}
        <div>
          <Label className="text-foreground/60 dark:text-foreground/40 text-xs uppercase tracking-widest font-medium">Full Name</Label>
          {editing ? (
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Enter your full name"
              className="mt-2 bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground rounded-xl placeholder:text-foreground/50 dark:placeholder:text-foreground/20"
            />
          ) : (
            <div className="flex items-center gap-3 mt-2">
              <div className="w-8 h-8 rounded-lg bg-foreground/[0.07] dark:bg-foreground/[0.04] flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-foreground/55 dark:text-foreground/50" />
              </div>
              <span className={profile?.full_name ? 'text-foreground/70' : 'text-foreground/50 dark:text-foreground/45 italic'}>
                {profile?.full_name || 'Not set'}
              </span>
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <Label className="text-foreground/60 dark:text-foreground/40 text-xs uppercase tracking-widest font-medium">Email</Label>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-8 h-8 rounded-lg bg-foreground/[0.07] dark:bg-foreground/[0.04] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-foreground/55 dark:text-foreground/50" />
            </div>
            <span className={displayEmail ? 'text-foreground/70' : 'text-foreground/50 dark:text-foreground/45 italic'}>
              {displayEmail || 'Not set'}
            </span>
          </div>
        </div>

        {/* Phone */}
        <div>
          <Label className="text-foreground/60 dark:text-foreground/40 text-xs uppercase tracking-widest font-medium">Phone</Label>
          {editing ? (
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 (416) 555-0123"
              className="mt-2 bg-foreground/[0.06] dark:bg-foreground/[0.03] border-border text-foreground rounded-xl placeholder:text-foreground/50 dark:placeholder:text-foreground/20"
            />
          ) : (
            <div className="flex items-center gap-3 mt-2">
              <div className="w-8 h-8 rounded-lg bg-foreground/[0.07] dark:bg-foreground/[0.04] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-foreground/55 dark:text-foreground/50" />
              </div>
              <span className={profile?.phone ? 'text-foreground/70' : 'text-foreground/50 dark:text-foreground/45 italic'}>
                {profile?.phone || 'Not set'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Referral Code */}
      {profile?.customer_profiles?.referral_code && (
        <div className="bg-surface border border-[#E23232]/20 rounded-2xl p-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-foreground/60 dark:text-foreground/40 font-semibold mb-4">Referral Code</h2>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-foreground/[0.06] dark:bg-foreground/[0.03] border border-border rounded-xl px-4 py-3 text-lg font-mono text-[#E23232] tracking-[0.2em] text-center font-bold">
              {profile.customer_profiles.referral_code}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={copyReferral}
              className="border-border text-foreground hover:bg-foreground/5 shrink-0 rounded-xl w-12 h-12"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-foreground/55 dark:text-foreground/50 mt-3">Share this code with friends to earn rewards</p>
        </div>
      )}

      {/* Account Actions */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <h2 className="text-xs uppercase tracking-[0.2em] text-foreground/60 dark:text-foreground/40 font-semibold px-6 pt-5 pb-3">Account</h2>

        <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-foreground/[0.06] dark:bg-foreground/[0.03] transition-colors border-t border-border">
          <div className="w-8 h-8 rounded-lg bg-foreground/[0.07] dark:bg-foreground/[0.04] flex items-center justify-center">
            <Shield className="w-4 h-4 text-foreground/55 dark:text-foreground/50" />
          </div>
          <span className="flex-1 text-left text-foreground/70 text-sm">Privacy & Security</span>
          <ChevronRight className="w-4 h-4 text-foreground/50 dark:text-foreground/45" />
        </button>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-red-500/5 transition-colors border-t border-border disabled:opacity-60"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            {loggingOut ? <Loader2 className="w-4 h-4 text-red-400 animate-spin" /> : <LogOut className="w-4 h-4 text-red-400" />}
          </div>
          <span className="flex-1 text-left text-red-400 text-sm font-medium">
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </span>
        </button>
      </div>

      <div className="pb-6" />
    </div>
  );
}
