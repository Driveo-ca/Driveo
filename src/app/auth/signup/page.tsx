'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { UserRole } from '@/types';

function SignupForm() {
  const searchParams = useSearchParams();
  const isWasher = searchParams.get('role') === 'washer';
  const redirectTo = searchParams.get('redirect');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const role: UserRole = isWasher ? 'washer' : 'customer';
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, phone, role } },
    });

    if (error) { toast.error(error.message); setLoading(false); return; }

    if (data.user) {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id, fullName, email, phone, role }),
      });
      if (!res.ok) {
        const errData = await res.json();
        toast.error(errData.error || 'Failed to create profile');
        setLoading(false);
        return;
      }
    }

    toast.success('Account created! Welcome to Driveo.');
    if (redirectTo) router.push(redirectTo);
    else if (isWasher) router.push('/washer/dashboard');
    else router.push('/app/onboarding');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#050505]">
      <div className="w-full max-w-[400px] animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <Image src="/Driveo-logo.png" alt="Driveo" width={48} height={48} />
          </Link>
          <h1 className="font-display text-2xl text-white mt-5 tracking-wide">
            {isWasher ? 'JOIN THE TEAM' : 'GET STARTED'}
          </h1>
          <p className="text-white/40 text-sm mt-2">
            {isWasher ? 'Apply as a washer and start earning' : 'Book your first car wash in 60 seconds'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-7">
          {/* Google Sign Up (customers only) */}
          {!isWasher && (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  const supabase = createClient();
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                      queryParams: { access_type: 'offline', prompt: 'consent' },
                    },
                  });
                  if (error) { toast.error(error.message); setLoading(false); }
                }}
                className="w-full h-12 bg-white/[0.04] border-white/[0.10] text-white hover:bg-white/[0.08] font-medium rounded-xl"
              >
                <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.08]" /></div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 text-white/30 bg-[#111]">or sign up with email</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-white/50 text-xs font-medium">Full Name</Label>
              <Input id="fullName" type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-12 bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 rounded-xl premium-input" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/50 text-xs font-medium">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 rounded-xl premium-input" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-white/50 text-xs font-medium">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 (416) 555-0123" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 rounded-xl premium-input" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white/50 text-xs font-medium">Password</Label>
              <Input id="password" type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="h-12 bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 rounded-xl premium-input" />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold rounded-xl mt-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (<>{isWasher ? 'Apply Now' : 'Create Account'}<ArrowRight className="w-4 h-4 ml-2" /></>)}
            </Button>
          </form>

          <div className="mt-7 text-center space-y-2">
            <p className="text-sm text-white/40">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-[#E23232] font-medium">Sign in</Link>
            </p>
            {!isWasher && (
              <p className="text-sm text-white/40">
                Want to wash cars?{' '}
                <Link href="/apply" className="text-[#E23232] font-medium">Apply as a washer</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return <Suspense><SignupForm /></Suspense>;
}
