'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function StripeConnectRefreshPage() {
  const [loading, setLoading] = useState(false);

  async function handleRetry() {
    setLoading(true);
    const res = await fetch('/api/washer/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        returnUrl: `${window.location.origin}/washer/profile`,
        refreshUrl: `${window.location.origin}/washer/connect/refresh`,
      }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-7 h-7 text-amber-400" />
        </div>
        <h1 className="text-2xl font-display text-foreground tracking-tight mb-2">Session Expired</h1>
        <p className="text-foreground/50 text-sm mb-8 max-w-sm mx-auto">
          Your Stripe Connect onboarding session has expired. Click below to start a fresh session and complete your payout account setup.
        </p>
        <Button
          onClick={handleRetry}
          disabled={loading}
          className="bg-[#E23232] hover:bg-[#c92a2a] text-white rounded-xl px-8 h-11 font-semibold border-0 gap-2"
        >
          <RefreshCw className={loading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
          {loading ? 'Opening...' : 'Retry Setup'}
        </Button>
      </motion.div>
    </div>
  );
}
