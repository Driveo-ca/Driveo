type GtagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function trackEvent({ action, category, label, value }: GtagEvent) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
}

// --- Conversion Events ---

export function trackSignup(method: 'email' | 'google', role: 'customer' | 'washer') {
  trackEvent({ action: 'sign_up', category: 'auth', label: `${method}_${role}` });
}

export function trackLogin(method: 'email' | 'google') {
  trackEvent({ action: 'login', category: 'auth', label: method });
}

export function trackBookingCreated(plan: string, totalCents: number) {
  trackEvent({
    action: 'purchase',
    category: 'booking',
    label: plan,
    value: totalCents / 100,
  });
}

export function trackSubscriptionPurchased(plan: string, priceCents: number) {
  trackEvent({
    action: 'subscribe',
    category: 'subscription',
    label: plan,
    value: priceCents / 100,
  });
}

export function trackWasherApplicationSubmitted() {
  trackEvent({ action: 'washer_application_submitted', category: 'apply' });
}

export function trackCtaClick(location: string) {
  trackEvent({ action: 'cta_click', category: 'engagement', label: location });
}
