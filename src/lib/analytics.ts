import { getUtmParams } from './utm';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a GA4 event with automatic UTM campaign context.
 * Safe to call server-side (no-ops) or when gtag hasn't loaded yet.
 */
export function trackEvent(
  eventName: string,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  const utm = getUtmParams();

  window.gtag('event', eventName, {
    ...params,
    campaign_source: utm.utm_source,
    campaign_medium: utm.utm_medium,
    campaign_name: utm.utm_campaign,
    campaign_content: utm.utm_content,
    campaign_term: utm.utm_term,
  });
}
