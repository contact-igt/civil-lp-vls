import { course } from './course';

type EventName = 'course_page_view' | 'curriculum_view' | 'enquire_click' | 'form_start' | 'form_submit_success' | 'form_submit_error' | 'whatsapp_click' | 'phone_click';
type EventDetails = { placement?: 'header' | 'hero' | 'sticky'; reason?: 'validation' | 'rate_limit' | 'delivery' };
type VendorQueue = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[][]; push?: VendorQueue; loaded?: boolean; version?: string };
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; fbq?: VendorQueue; _fbq?: VendorQueue };

let initialized = false;
const global = () => window as AnalyticsWindow;
const gtm = process.env.NEXT_PUBLIC_CIVIL_GTM_ID;
const ga4 = process.env.NEXT_PUBLIC_CIVIL_GA4_ID;
const meta = process.env.NEXT_PUBLIC_CIVIL_META_PIXEL_ID;

function loadScript(src: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.append(script);
}

export function initializeAnalytics() {
  if (initialized) return;
  initialized = true;
  const w = global();
  w.dataLayer ??= [];
  // GTM is the sole vendor dispatcher when configured.
  if (gtm && /^GTM-[A-Z0-9]+$/.test(gtm)) {
    w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    loadScript(`https://www.googletagmanager.com/gtm.js?id=${gtm}`);
    return;
  }
  if (ga4 && /^G-[A-Z0-9]+$/.test(ga4)) {
    // Google’s queue expects the arguments object used by the official gtag stub.
    // eslint-disable-next-line prefer-rest-params
    w.gtag = function () { w.dataLayer?.push(arguments); };
    w.gtag('js', new Date());
    w.gtag('config', ga4, { send_page_view: false, page_location: location.origin + location.pathname, page_referrer: '' });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${ga4}`);
  }
  if (meta && /^\d{5,20}$/.test(meta)) {
    const queue: VendorQueue = function (...args) {
      if (queue.callMethod) queue.callMethod(...args);
      else queue.queue?.push(args);
    };
    queue.queue = [];
    queue.push = queue;
    queue.loaded = true;
    queue.version = '2.0';
    w.fbq = w._fbq = queue;
    w.fbq('set', 'autoConfig', false, meta);
    w.fbq('init', meta);
    loadScript('https://connect.facebook.net/en_US/fbevents.js');
  }
}

export function track(event: EventName, details: EventDetails = {}) {
  initializeAnalytics();
  const w = global();
  const fields = { course_id: course.id, ...details };
  w.dataLayer?.push({ event, ...fields });
  w.gtag?.('event', event, fields);
  w.fbq?.('trackCustom', event, fields);
}
