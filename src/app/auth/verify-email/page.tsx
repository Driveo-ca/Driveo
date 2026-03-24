'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleResend() {
    if (countdown > 0 || !email) return;
    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      setResent(true);
      setCountdown(60);
      toast.success('Verification email sent!');
    }
    setResending(false);
  }

  // Mask email for display
  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, start, middle, end) => start + '*'.repeat(Math.min(middle.length, 6)) + end)
    : '';

  return (
    <div className="min-h-screen flex bg-background">
      <style jsx global>{`
        @keyframes authSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes authFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes emailFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .auth-in {
          animation: authSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .auth-fade {
          animation: authFadeIn 0.6s ease forwards;
          opacity: 0;
        }
        .email-float {
          animation: emailFloat 3s ease-in-out infinite;
        }
        .pulse-ring {
          animation: pulseRing 2s ease-out infinite;
        }
      `}</style>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Top nav */}
        <div className={`fixed top-0 left-0 right-0 flex items-center justify-between px-6 sm:px-8 pt-5 pb-2 z-10 ${mounted ? 'auth-fade' : 'opacity-0'}`} style={{ animationDelay: '0.05s' }}>
          <Link href="/">
            <Image src="/Driveo-logo.png" alt="Driveo" width={100} height={36} className="h-8 w-auto" />
          </Link>
          <ThemeToggle />
        </div>

        {/* Main content */}
        <div className="w-full max-w-md text-center">
          {/* Animated email icon */}
          <div className={`flex justify-center mb-8 ${mounted ? 'auth-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center email-float">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 pulse-ring" />
            </div>
          </div>

          {/* Heading */}
          <div className={mounted ? 'auth-in' : 'opacity-0'} style={{ animationDelay: '0.2s' }}>
            <h1 className="font-display text-[2rem] sm:text-[2.4rem] leading-none text-foreground tracking-wide mb-2">
              CHECK YOUR EMAIL
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              We&apos;ve sent a verification link to
            </p>
            {email && (
              <p className="text-foreground font-medium text-sm mt-1">
                {maskedEmail}
              </p>
            )}
          </div>

          {/* Instructions card */}
          <div className={`mt-8 ${mounted ? 'auth-in' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
            <div className="rounded-2xl border border-border bg-card p-6 text-left space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[11px] font-bold text-primary">1</span>
                </div>
                <p className="text-sm text-muted-foreground">Open the email from <span className="text-foreground font-medium">Driveo</span></p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[11px] font-bold text-primary">2</span>
                </div>
                <p className="text-sm text-muted-foreground">Click the <span className="text-foreground font-medium">verification link</span> in the email</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[11px] font-bold text-primary">3</span>
                </div>
                <p className="text-sm text-muted-foreground">You&apos;ll be redirected to <span className="text-foreground font-medium">start using Driveo</span></p>
              </div>
            </div>
          </div>

          {/* Resend */}
          <div className={`mt-6 ${mounted ? 'auth-in' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {resent && countdown <= 0 ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
              )}
              {countdown > 0
                ? `Resend in ${countdown}s`
                : resending
                  ? 'Sending...'
                  : 'Resend verification email'
              }
            </button>
          </div>

          {/* Spam note */}
          <div className={`mt-4 ${mounted ? 'auth-in' : 'opacity-0'}`} style={{ animationDelay: '0.45s' }}>
            <p className="text-[12px] text-muted-foreground/60">
              Can&apos;t find it? Check your spam or junk folder.
            </p>
          </div>

          {/* Back to login */}
          <div className={`mt-8 ${mounted ? 'auth-in' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className={`fixed bottom-0 left-0 right-0 px-6 sm:px-8 pb-4 text-center ${mounted ? 'auth-fade' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-center gap-2 text-muted-foreground/40 text-[11px]">
            <span>&copy; {new Date().getFullYear()} Driveo</span>
            <span>·</span>
            <span>GTA&apos;s Premium Car Wash</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyEmailContent /></Suspense>;
}
