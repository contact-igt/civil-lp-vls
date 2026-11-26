import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { sanitizeAttribution, webUrl } from '../../../lib/attribution';
import { course, statuses } from '../../../lib/course';
import { acceptAttempt, deliverToSheet, deliverToWebhook, modeFor, storeLocally, type Lead } from '../../../lib/enquiry-storage';
import { siteUrl } from '../../../lib/site';

export const runtime = 'nodejs';

const maxBytes = 8192;
const reply = (data: object, status: number, headers?: Record<string, string>) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

async function readBody(request: Request) {
  if (!request.body || Number(request.headers.get('content-length')) > maxBytes) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0;
  let body = '';
  try {
    for (let part = await reader.read(); !part.done; part = await reader.read()) {
      bytes += part.value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        return null;
      }
      body += decoder.decode(part.value, { stream: true });
    }
    const parsed = JSON.parse(body + decoder.decode());
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

function string(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalisePhone(value: string) {
  if (value.length > 25 || !/^[+\d().\s-]+$/.test(value)) return null;
  const compact = value.replace(/[().\s-]/g, '');
  const indian = compact.match(/^(?:(?:\+|00)?91|0)?([6-9]\d{9})$/);
  return indian ? `+91${indian[1]}` : null;
}

function clientScope(request: Request, local: boolean) {
  if (local) return 'loopback';
  const header = process.env.CIVIL_TRUSTED_IP_HEADER;
  const ip = header && /^[a-z][a-z0-9-]*$/.test(header) ? request.headers.get(header)?.trim() : undefined;
  return ip && isIP(ip) ? createHash('sha256').update(ip).digest('hex') : 'unknown';
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  // Next can normalise the request URL to localhost. Only accept a raw Host override on loopback.
  const host = request.headers.get('host') ?? '';
  const loopbackHost = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/.test(host);
  const localOrigin = loopbackHost ? webUrl(`${url.protocol}//${host}`)?.origin : undefined;
  const origin = siteUrl ?? localOrigin ?? url.origin;
  if (request.headers.get('sec-fetch-site') === 'cross-site' || (request.headers.has('origin') && request.headers.get('origin') !== origin)) {
    return reply({ message: 'Open the course page and submit the form there.' }, 403);
  }
  if (!/^application\/json\s*(?:;|$)/i.test(request.headers.get('content-type') ?? '')) {
    return reply({ message: 'Use the online enquiry form to send your details.' }, 415);
  }
  const mode = modeFor(origin);
  if (mode === 'disabled' || (mode === 'webhook' && !siteUrl) || (mode === 'sheets' && !siteUrl && !localOrigin)) {
    return reply({ message: 'Enquiries are temporarily unavailable. Please call admissions.' }, 503);
  }
  try {
    if (!acceptAttempt(clientScope(request, mode === 'local'), mode === 'local')) {
      return reply({ message: 'There have been several attempts. Please try again in 10 minutes.' }, 429, { 'Retry-After': '600' });
    }
    const data = await readBody(request);
    if (!data || data.website !== undefined && data.website !== '') return reply({ message: 'We couldn’t accept this request. Please use the enquiry form.' }, 400);

    const name = string(data.name);
    const phone = normalisePhone(string(data.phone));
    const email = string(data.email).toLowerCase();
    const status = string(data.status);
    const city = string(data.city);
    const errors: Record<string, string> = {};
    if (name.length < 2 || name.length > 100 || !/\p{L}/u.test(name) || /[\p{Cc}]/u.test(name)) errors.name = 'Enter your full name.';
    if (!phone) errors.phone = 'Enter a valid Indian mobile number, with or without +91.';
    if (email.length > 254 || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email) || (email.split('@')[0]?.length ?? 0) > 64) errors.email = 'Enter a valid email address.';
    if (!statuses.some(option => option === status)) errors.status = 'Select your professional status.';
    if (city.length < 2 || city.length > 80 || !/\p{L}/u.test(city) || /[\p{Cc}]/u.test(city)) errors.city = 'Enter your city.';
    if (data.consent !== true) errors.consent = 'Please allow VLS Law Academy to contact you about this course.';
    if (!phone || Object.keys(errors).length) return reply({ message: 'Review the highlighted fields and try again.', errors }, 422);

    const lead: Lead = {
      courseId: course.id,
      submittedAt: new Date().toISOString(),
      name, phone, email, status, city, consent: true,
      attribution: sanitizeAttribution(data.attribution, origin),
    };
    const receipt = mode === 'local'
      ? storeLocally(lead)
      : mode === 'sheets'
        ? await deliverToSheet(lead)
        : await deliverToWebhook(lead);
    return reply({ ok: true, ...receipt }, receipt.created ? 201 : 200);
  } catch {
    return reply({ message: 'We couldn’t confirm your enquiry. Please try again or call admissions.' }, 503);
  }
}
