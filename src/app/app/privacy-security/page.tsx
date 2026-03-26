'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Shield, Lock, Eye, EyeOff, KeyRound,
  Trash2, Loader2, AlertTriangle, ChevronDown, ChevronUp,
  Smartphone, LogOut, CheckCircle2,
} from 'lucide-react';

export default function PrivacySecurityPage() {
  const router = useRouter();
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ password: '', confirm: '' });

  const [deleteExpanded, setDeleteExpanded] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [signingOutAll, setSigningOutAll] = useState(false);

  const handleChangePassword = async () => {
    if (passwordForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (passwordForm.password !== passwordForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: passwordForm.password });

    if (error) {
      toast.error(error.message || 'Failed to update password');
    } else {
      toast.success('Password updated successfully');
      setChangingPassword(false);
      setPasswordForm({ password: '', confirm: '' });
    }
    setSaving(false);
  };

  const handleSignOutAll = async () => {
    setSigningOutAll(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      toast.error('Failed to sign out other sessions');
      setSigningOutAll(false);
    } else {
      router.push('/auth/login');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    // Call a server-side endpoint that handles account deletion
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch {
      toast.error('Failed to delete account. Please contact support.');
      setDeleting(false);
    }
  };

  const passwordStrength = (pwd: string) => {
    if (pwd.length === 0) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 4) return { level: 3, label: 'Strong', color: 'bg-emerald-500' };
    return { level: 4, label: 'Very Strong', color: 'bg-emerald-400' };
  };

  const strength = passwordStrength(passwordForm.password);

  return (
    <div className="min-h-screen text-foreground">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-foreground/[0.05] hover:bg-foreground/[0.08] flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Privacy & Security</h1>
            <p className="text-xs text-foreground/55 mt-0.5">Manage your account security</p>
          </div>
        </div>

        {/* ─── Password Section ─── */}
        <div className="rounded-2xl border border-border/50 overflow-hidden mb-5">
          <div className="px-5 pt-5 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/55">Password</span>
              <div className="h-px flex-1 bg-border/50" />
            </div>
          </div>

          {!changingPassword ? (
            <div className="px-5 py-4">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-foreground/[0.05] flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4 text-foreground/55" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground/80">Password</p>
                  <p className="text-[11px] text-foreground/55 mt-0.5">Last changed: Unknown</p>
                </div>
                <button
                  onClick={() => setChangingPassword(true)}
                  className="text-xs font-medium text-[#E23232] hover:text-[#c92a2a] px-3 py-1.5 rounded-lg hover:bg-[#E23232]/[0.06] transition-all"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4 space-y-4">
              {/* New Password */}
              <div>
                <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground/55 mb-2 block">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                    placeholder="Enter new password"
                    className="bg-foreground/[0.04] border-border/60 text-foreground rounded-xl h-11 pr-10 placeholder:text-foreground/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/50 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength meter */}
                {passwordForm.password.length > 0 && (
                  <div className="mt-2.5">
                    <div className="flex gap-1 h-1 rounded-full overflow-hidden">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            'flex-1 rounded-full transition-colors duration-300',
                            i <= strength.level ? strength.color : 'bg-foreground/[0.06]'
                          )}
                        />
                      ))}
                    </div>
                    <p className={cn(
                      'text-[10px] font-medium mt-1',
                      strength.level <= 1 ? 'text-red-500 dark:text-red-400' :
                      strength.level <= 2 ? 'text-amber-600 dark:text-amber-400' :
                      'text-emerald-600 dark:text-emerald-400'
                    )}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground/55 mb-2 block">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    placeholder="Confirm new password"
                    className={cn(
                      'bg-foreground/[0.04] border-border/60 text-foreground rounded-xl h-11 pr-10 placeholder:text-foreground/50',
                      passwordForm.confirm.length > 0 && passwordForm.password !== passwordForm.confirm && 'border-red-500/50'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/50 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.confirm.length > 0 && passwordForm.password === passwordForm.confirm && (
                  <p className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-1.5">
                    <CheckCircle2 className="w-3 h-3" /> Passwords match
                  </p>
                )}
                {passwordForm.confirm.length > 0 && passwordForm.password !== passwordForm.confirm && (
                  <p className="text-[10px] font-medium text-red-500 dark:text-red-400 mt-1.5">Passwords do not match</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setChangingPassword(false);
                    setPasswordForm({ password: '', confirm: '' });
                  }}
                  className="flex-1 text-sm font-medium text-foreground/50 hover:text-foreground/70 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={saving || passwordForm.password.length < 8 || passwordForm.password !== passwordForm.confirm}
                  className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#E23232] hover:bg-[#c92a2a] py-2.5 rounded-xl transition-all active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Sessions ─── */}
        <div className="rounded-2xl border border-border/50 overflow-hidden mb-5">
          <div className="px-5 pt-5 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/55">Sessions</span>
              <div className="h-px flex-1 bg-border/50" />
            </div>
          </div>

          <div className="divide-y divide-border/40">
            {/* Current session */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground/80">Current Session</p>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground/55 mt-0.5">This device</p>
                </div>
              </div>
            </div>

            {/* Sign out all */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-foreground/[0.05] flex items-center justify-center shrink-0">
                  <LogOut className="w-4 h-4 text-foreground/55" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground/80">Sign Out Everywhere</p>
                  <p className="text-[11px] text-foreground/55 mt-0.5">End all sessions on other devices</p>
                </div>
                <button
                  onClick={handleSignOutAll}
                  disabled={signingOutAll}
                  className="text-xs font-medium text-foreground/50 hover:text-foreground/70 px-3 py-1.5 rounded-lg hover:bg-foreground/[0.05] transition-all disabled:opacity-50"
                >
                  {signingOutAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Sign Out All'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Data & Privacy ─── */}
        <div className="rounded-2xl border border-border/50 overflow-hidden mb-5">
          <div className="px-5 pt-5 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/55">Data & Privacy</span>
              <div className="h-px flex-1 bg-border/50" />
            </div>
          </div>

          <div className="divide-y divide-border/40">
            <div className="px-5 py-4">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-foreground/[0.05] flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-foreground/55" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground/80">Your Data</p>
                  <p className="text-[11px] text-foreground/55 mt-0.5 leading-relaxed">
                    We store your profile, booking history, and vehicle info to provide our service. Your data is encrypted and never sold.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Danger Zone ─── */}
        <div className="rounded-2xl border border-red-500/20 overflow-hidden">
          <div className="px-5 pt-5 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-red-500/60">Danger Zone</span>
              <div className="h-px flex-1 bg-red-500/10" />
            </div>
          </div>

          <div className="px-5 py-4">
            <button
              onClick={() => setDeleteExpanded(!deleteExpanded)}
              className="w-full flex items-center gap-3.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-red-500 dark:text-red-400">Delete Account</p>
                <p className="text-[11px] text-foreground/55 mt-0.5">Permanently delete your account and all data</p>
              </div>
              {deleteExpanded ? (
                <ChevronUp className="w-4 h-4 text-foreground/50" />
              ) : (
                <ChevronDown className="w-4 h-4 text-foreground/50" />
              )}
            </button>

            {deleteExpanded && (
              <div className="mt-4 pt-4 border-t border-red-500/10 space-y-3">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/10">
                  <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-500/80 dark:text-red-400/80 leading-relaxed">
                    This action is <strong>irreversible</strong>. All your bookings, vehicles, membership, and personal data will be permanently deleted.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground/55 mb-2 block">
                    Type DELETE to confirm
                  </label>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="bg-foreground/[0.04] border-red-500/20 text-foreground rounded-xl h-11 placeholder:text-foreground/20 font-mono tracking-widest"
                  />
                </div>

                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || deleting}
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 py-2.5 rounded-xl transition-all active:scale-[0.97] disabled:opacity-30 disabled:pointer-events-none"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  {deleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pb-20" />
      </div>
    </div>
  );
}
