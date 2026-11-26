import { createHash, createHmac, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { course } from './course.ts';
import { webUrl } from './attribution.ts';

export type Lead = {
  courseId: string;
  submittedAt: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  city: string;
  consent: boolean;
  attribution: Record<string, string | null>;
};

type Receipt = { id: string; created: boolean; local: boolean };
const day = 24 * 60 * 60 * 1000;
const rateWindow = 10 * 60 * 1000;
const rateLimit = 12;
let database: DatabaseSync | undefined;

function localDatabase() {
  if (database) return database;
  const file = resolve(process.env.CIVIL_LEAD_DB ?? '.data/civil-enquiries.sqlite');
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(file, { timeout: 3000 });
  db.exec(`
    PRAGMA synchronous = FULL;
    CREATE TABLE IF NOT EXISTS enquiries (
      id TEXT PRIMARY KEY, contact_key TEXT NOT NULL, time INTEGER NOT NULL, payload TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS enquiries_contact ON enquiries(contact_key, time);
    CREATE TABLE IF NOT EXISTS local_rate (
      scope TEXT NOT NULL, time INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS local_rate_time ON local_rate(time);
  `);
  database = db;
  return db;
}

export function modeFor(origin: string) {
  const mode = process.env.LEAD_MODE ?? (process.env.NODE_ENV === 'development' ? 'local' : 'disabled');
  if (mode === 'local' && ['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname)) return 'local';
  if (mode === 'webhook') return 'webhook';
  if (mode === 'sheets') return 'sheets';
  return 'disabled';
}

export function storeLocally(lead: Lead): Receipt {
  const db = localDatabase();
  const time = Date.parse(lead.submittedAt);
  const key = createHash('sha256').update(`${lead.courseId}\0${lead.phone}\0${lead.email}`).digest('hex');
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('DELETE FROM enquiries WHERE time < ?').run(time - 7 * day);
    const existing = db.prepare('SELECT id FROM enquiries WHERE contact_key = ? AND time >= ? ORDER BY time DESC LIMIT 1').get(key, time - day);
    if (existing) {
      db.exec('COMMIT');
      return { id: String(existing.id), created: false, local: true };
    }
    const id = randomUUID();
    db.prepare('INSERT INTO enquiries (id, contact_key, time, payload) VALUES (?, ?, ?, ?)').run(id, key, time, JSON.stringify(lead));
    db.exec('COMMIT');
    return { id, created: true, local: true };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

const productionRate = new Map<string, { count: number; until: number }>();
export function acceptAttempt(scope: string, local: boolean, time = Date.now()) {
  if (local) {
    const db = localDatabase();
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare('DELETE FROM local_rate WHERE time < ?').run(time - rateWindow);
      const row = db.prepare('SELECT COUNT(*) AS count FROM local_rate WHERE scope = ?').get(scope);
      const allowed = Number(row?.count) < rateLimit;
      if (allowed) db.prepare('INSERT INTO local_rate (scope, time) VALUES (?, ?)').run(scope, time);
      db.exec('COMMIT');
      return allowed;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
  const current = productionRate.get(scope);
  if (current && current.until > time) return ++current.count <= rateLimit;
  if (productionRate.size >= 10_000) {
    for (const [key, entry] of productionRate) if (entry.until <= time) productionRate.delete(key);
    if (productionRate.size >= 10_000) return false;
  }
  productionRate.set(scope, { count: 1, until: time + rateWindow });
  return true;
}

function leadIdempotencyKey(lead: Lead, secret: string) {
  return createHmac('sha256', secret).update(`${lead.courseId}\0${lead.phone}\0${lead.email}`).digest('hex');
}

async function parseReceipt(response: Response, courseId: string, label: string): Promise<Receipt> {
  if (!response.ok) throw Error(`${label} HTTP error`);
  const result = await response.json();
  if (!result || result.accepted !== true || result.courseId !== courseId ||
      typeof result.created !== 'boolean' || typeof result.id !== 'string' || !/^[\w-]{1,120}$/.test(result.id)) {
    throw Error(`${label} receipt invalid`);
  }
  return { id: result.id, created: result.created, local: false };
}

export async function deliverToWebhook(lead: Lead): Promise<Receipt> {
  const endpoint = webUrl(process.env[course.submission.productionDestinationEnv]);
  const token = process.env.CIVIL_LEAD_WEBHOOK_TOKEN;
  const secret = process.env.CIVIL_LEAD_IDEMPOTENCY_SECRET;
  if (endpoint?.protocol !== 'https:' || !token || !secret || secret.length < 32) throw Error('Civil intake is not configured');

  const idempotencyKey = leadIdempotencyKey(lead, secret);
  const response = await fetch(endpoint, {
    method: 'POST',
    redirect: 'error',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(lead),
    signal: AbortSignal.timeout(7000),
  });
  return parseReceipt(response, lead.courseId, 'Civil intake');
}

export async function deliverToSheet(lead: Lead): Promise<Receipt> {
  const endpoint = webUrl(process.env.CIVIL_LEAD_SHEET_URL);
  const token = process.env.CIVIL_LEAD_SHEET_TOKEN;
  const secret = process.env.CIVIL_LEAD_IDEMPOTENCY_SECRET;
  const isAppsScript =
    endpoint?.protocol === 'https:' &&
    endpoint.hostname === 'script.google.com' &&
    /^\/macros\/s\/[\w-]+\/exec$/.test(endpoint.pathname);
  if (!isAppsScript || !token || !secret || secret.length < 32) {
    throw Error('Civil Google Sheet intake is not configured');
  }

  const idempotencyKey = leadIdempotencyKey(lead, secret);
  const response = await fetch(endpoint, {
    method: 'POST',
    // Google Apps Script web apps return a 302 redirect to script.googleusercontent.com for the response body.
    redirect: 'follow',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...lead, token, idempotencyKey }),
    signal: AbortSignal.timeout(10000),
  });
  return parseReceipt(response, lead.courseId, 'Civil Google Sheet');
}
