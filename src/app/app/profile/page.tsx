'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Phone, Copy, Check, Pencil, Save } from 'lucide-react';

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  customer_profiles: {
    referral_code: string | null;
    default_address: string | null;
  } | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*, customer_profiles(*)')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data as ProfileData);
        setForm({ full_name: data.full_name, phone: data.phone || '' });
      }
      setLoading(false);
    }

    fetchProfile();
  }, [supabase]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, full_name: form.full_name, phone: form.phone });
      setEditing(false);
    }
    setSaving(false);
  };

  const copyReferral = () => {
    const code = profile?.customer_profiles?.referral_code;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white">
        <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-10 w-48 bg-white/5 rounded-lg" />
          <Skeleton className="h-32 w-full bg-white/5 rounded-2xl" />
          <Skeleton className="h-64 w-full bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in-up">
        <div className="stagger-children space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display text-white tracking-tight">Profile</h1>
            {!editing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="border-white/[0.08] text-white/70 hover:bg-white/5 hover:text-white rounded-xl gap-2 transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-[#E23232] hover:bg-[#c92a2a] text-white rounded-xl gap-2 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            )}
          </div>

          {/* Avatar + Name Hero */}
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center gap-5">
              {/* Avatar — simple circle */}
              <div className="w-[72px] h-[72px] rounded-full bg-[#E23232]/10 border-2 border-[#E23232]/30 flex items-center justify-center">
                <User className="w-8 h-8 text-[#E23232]" />
              </div>
              <div>
                <p className="text-xl font-semibold text-white tracking-tight">{profile?.full_name}</p>
                <p className="text-sm text-white/40 mt-0.5">Customer</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6">
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-semibold mb-5">Personal Information</h2>
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <Label className="text-white/40 text-xs uppercase tracking-widest font-medium">
                  Full Name
                </Label>
                {editing ? (
                  <Input
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({ ...form, full_name: e.target.value })
                    }
                    className="mt-2 bg-white/[0.03] border-white/[0.08] text-white rounded-xl"
                  />
                ) : (
                  <p className="mt-2 text-white font-medium">{profile?.full_name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label className="text-white/40 text-xs uppercase tracking-widest font-medium">
                  Email
                </Label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white/30" />
                  </div>
                  <span className="text-white/70">{profile?.email}</span>
                </div>
              </div>

              {/* Phone */}
              <div>
                <Label className="text-white/40 text-xs uppercase tracking-widest font-medium">
                  Phone
                </Label>
                {editing ? (
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="+1 (416) 555-0123"
                    className="mt-2 bg-white/[0.03] border-white/[0.08] text-white rounded-xl placeholder:text-white/20"
                  />
                ) : (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                      <Phone className="w-4 h-4 text-white/30" />
                    </div>
                    <span className="text-white/70">{profile?.phone || 'Not set'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Referral Code */}
          {profile?.customer_profiles?.referral_code && (
            <div className="bg-[#111] border border-[#E23232]/30 rounded-2xl">
              <div className="p-6">
                <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-semibold mb-4">
                  Referral Code
                </h2>
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5 text-lg font-mono text-[#E23232] tracking-[0.2em] text-center font-bold">
                    {profile.customer_profiles.referral_code}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferral}
                    className="border-white/[0.08] text-white hover:bg-white/5 shrink-0 rounded-xl w-12 h-12 transition-all"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-white/25 mt-3">
                  Share this code with friends to earn rewards
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
