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
    const utm = getUtmParams();
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
      ...(utm.utm_source ? { campaign_source: utm.utm_source } : {}),
      ...(utm.utm_medium ? { campaign_medium: utm.utm_medium } : {}),
      ...(utm.utm_campaign ? { campaign_name: utm.utm_campaign } : {}),
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

// --- UTM Parameter Tracking ---

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

const UTM_KEYS: (keyof UtmParams)[] = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
];

const UTM_STORAGE_KEY = 'driveo_utm';

/** Call on landing page load to capture UTM params from the URL into sessionStorage. */
export function captureUtmParams() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const utm: UtmParams = {};
  let found = false;
  for (const key of UTM_KEYS) {
    const val = params.get(key);
    if (val) { utm[key] = val; found = true; }
  }
  // Only overwrite if new UTM params are present (preserve earlier attribution)
  if (found) {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
  }
}

/** Retrieve stored UTM params (returns empty object if none). */
export function getUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
