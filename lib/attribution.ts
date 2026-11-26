export const attributionKeys = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid',
] as const;

export function campaignValue(value: unknown) {
  if (typeof value !== 'string') return '';
  const clean = value.trim().slice(0, 200);
  // Reject free text likely to contain email addresses or phone numbers.
  return /[@\r\n]|(?:^|\D)\+?\d(?:[ .-]?\d){9,14}(?:$|\D)/.test(clean) ? '' : clean;
}

export function webUrl(value: unknown) {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}

export function captureAttribution(window: Window) {
  const clean = sanitizeAttribution({ landing: window.location.href, referrer: window.document.referrer }, window.location.origin);
  return { landing: clean.landingPage, referrer: clean.referrer };
}

export function sanitizeAttribution(input: unknown, origin: string) {
  const data = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const landing = webUrl(data.landing);
  const referrer = webUrl(data.referrer);
  const params = new URLSearchParams();
  if (landing?.origin === origin && landing.pathname === '/') {
    for (const key of attributionKeys) {
      const value = campaignValue(landing.searchParams.get(key));
      if (value) params.set(key, value);
    }
  }
  return {
    ...Object.fromEntries(params),
    landingPage: `${origin}/${params.size ? '?' + params : ''}`,
    referrer: referrer?.origin ?? null,
  };
}
