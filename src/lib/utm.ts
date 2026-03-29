const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const STORAGE_KEY = 'driveo_utm';

export interface UtmData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

/** Capture UTM params from the current URL and persist in sessionStorage. */
export function captureUtmParams(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const utm: UtmData = {};
  let hasAny = false;

  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) {
      utm[key] = value;
      hasAny = true;
    }
  }

  // Only overwrite if the current page actually has UTM params
  if (hasAny) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
  }
}

/** Retrieve stored UTM params (returns empty object if none). */
export function getUtmParams(): UtmData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
