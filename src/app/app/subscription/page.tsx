'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Sparkles, Star, Check } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  wash_plan: string;
  monthly_price: number;
  washes_per_month: number;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  subscription_plans: SubscriptionPlan;
}

interface SubscriptionUsage {
  allocated: number;
  used: number;
  period_start: string;
  period_end: string;
}

const planIcons: Record<string, React.ReactNode> = {
  regular: <Star className="w-6 h-6" />,
  interior_exterior: <Sparkles className="w-6 h-6" />,
  detailing: <Crown className="w-6 h-6" />,
};

const planFeatures: Record<string, string[]> = {
  regular: [
    'Exterior hand wash',
    'Tire & rim cleaning',
    'Window cleaning',
    '8 washes per month',
  ],
  interior_exterior: [
    'Full exterior wash',
    'Interior vacuum & wipe',
    'Dashboard & console detail',
    '8 washes per month',
  ],
  detailing: [
    'Full paint correction',
    'Clay bar treatment',
    'Interior deep clean',
    '8 washes per month',
  ],
};

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Fetch all plans
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (plansData) setPlans(plansData as SubscriptionPlan[]);

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch active subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('customer_id', user.id)
        .eq('status', 'active')
        .single();

      if (subData) {
        setSubscription(subData as Subscription);

        // Fetch usage for current period
        const { data: usageData } = await supabase
          .from('subscription_usage')
          .select('*')
          .eq('subscription_id', subData.id)
          .order('period_start', { ascending: false })
          .limit(1)
          .single();

        if (usageData) setUsage(usageData as SubscriptionUsage);
      }

      setLoading(false);
    }

    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-48 bg-white/[0.06] shimmer rounded-lg" />
          <Skeleton className="h-44 w-full bg-white/[0.06] shimmer rounded-2xl" />
          <Skeleton className="h-6 w-32 bg-white/[0.06] shimmer rounded-lg" />
          <Skeleton className="h-64 w-full bg-white/[0.06] shimmer rounded-2xl" />
          <Skeleton className="h-64 w-full bg-white/[0.06] shimmer rounded-2xl" />
          <Skeleton className="h-64 w-full bg-white/[0.06] shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="animate-fade-in-up mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Subscription
          </h1>
          <p className="text-sm text-white/40">
            Manage your plan and track usage
          </p>
        </div>

        {/* Current Subscription */}
        {subscription && (
          <div className="animate-fade-in-up mb-10" style={{ animationDelay: '60ms' }}>
            <Card className="bg-[#111] border border-[#E23232]/30 rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white font-semibold">
                    Current Plan
                  </CardTitle>
                  <Badge className="bg-green-500/15 text-green-400 border border-green-500/20">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-5">
                  <div className="p-3.5 rounded-2xl bg-[#E23232]/15 text-[#E23232]">
                    {planIcons[subscription.subscription_plans.wash_plan]}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-lg">
                      {subscription.subscription_plans.name}
                    </p>
                    <p className="text-sm text-white/40">
                      <span className="text-2xl font-bold text-white">
                        ${(subscription.subscription_plans.monthly_price / 100).toFixed(0)}
                      </span>
                      <span className="text-white/30 ml-0.5">/month</span>
                    </p>
                  </div>
                </div>

                {/* Usage Bar */}
                {usage && (
                  <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-white/50">Washes this period</span>
                      <span className="text-white font-semibold">
                        {usage.used} / {usage.allocated}
                      </span>
                    </div>
                    <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E23232] rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.min((usage.used / usage.allocated) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-white/30 mt-2.5">
                      Period ends{' '}
                      {new Date(usage.period_end).toLocaleDateString('en-CA', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Plan Cards */}
        <h2
          className="text-lg font-semibold mb-5 animate-fade-in-up"
          style={{ animationDelay: '120ms' }}
        >
          {subscription ? 'Change Plan' : 'Choose a Plan'}
        </h2>

        <div className="space-y-4 stagger-children">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.plan_id === plan.id;
            return (
              <Card
                key={plan.id}
                className={`rounded-2xl overflow-hidden transition-all duration-300 animate-fade-in-up ${
                  isCurrentPlan
                    ? 'bg-[#111] border border-[#E23232]/30'
                    : 'bg-[#111] border border-white/[0.08]'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-2xl transition-colors ${
                          isCurrentPlan
                            ? 'bg-[#E23232]/15 text-[#E23232]'
                            : 'bg-white/[0.04] text-white/40'
                        }`}
                      >
                        {planIcons[plan.wash_plan]}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-base">
                          {plan.name}
                        </p>
                        <div className="flex items-baseline gap-0.5 mt-1">
                          <span className="text-3xl font-bold text-white tracking-tight">
                            ${(plan.monthly_price / 100).toFixed(0)}
                          </span>
                          <span className="text-sm font-normal text-white/30 ml-0.5">
                            /mo
                          </span>
                        </div>
                      </div>
                    </div>
                    {isCurrentPlan && (
                      <Badge className="bg-[#E23232]/15 text-[#E23232] border border-[#E23232]/20 text-xs">
                        Current
                      </Badge>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-5">
                    {(planFeatures[plan.wash_plan] || []).map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2.5 text-sm text-white/50"
                      >
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E23232]/10">
                          <Check className="w-3 h-3 text-[#E23232]" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {!isCurrentPlan && (
                    <Button
                      className="w-full bg-[#E23232] hover:bg-[#E23232]/90 text-white font-medium rounded-xl h-11 transition-all duration-200"
                    >
                      {subscription ? 'Switch Plan' : 'Subscribe'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
