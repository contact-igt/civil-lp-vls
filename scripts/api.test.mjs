import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { setTimeout as delay } from 'node:timers/promises';

async function listenPort() {
  const socket = createServer();
  await new Promise((resolve, reject) => {
    socket.once('error', reject);
    socket.listen(0, '127.0.0.1', resolve);
  });
  const { port } = socket.address();
  await new Promise(resolve => socket.close(resolve));
  return port;
}

async function server(t, env) {
  const port = await listenPort();
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)], {
    env: {
      ...process.env,
      CIVIL_SITE_URL: '',
      CIVIL_LEAD_WEBHOOK_URL: '',
      CIVIL_LEAD_WEBHOOK_TOKEN: '',
      CIVIL_LEAD_SHEET_URL: '',
      CIVIL_LEAD_SHEET_TOKEN: '',
      CIVIL_LEAD_IDEMPOTENCY_SECRET: '',
      ...env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { output += chunk; });
  const exit = new Promise(resolve => child.once('exit', resolve));
  t.after(async () => {
    if (child.exitCode === null) child.kill('SIGTERM');
    await exit;
  });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw Error(output);
    try {
      if ((await fetch(base)).ok) return base;
    } catch {}
    await delay(100);
  }
  throw Error(output || 'Next preview did not start');
}

const lead = {
  name: 'QA Fixture', phone: '0091 (98765) 43210', email: 'QA@example.test',
  status: 'Junior advocate', city: 'சென்னை', consent: true, website: '',
};
function post(base, data, headers = {}, raw = false) {
  return fetch(base + '/api/enquiry', {
    method: 'POST', headers: { 'Content-Type': 'application/json', origin: base, ...headers },
    body: raw ? data : JSON.stringify(data),
  });
}

test('local intake validates, persists and deduplicates concurrent Civil enquiries', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'civil-intake-test-'));
  const file = join(dir, 'test.sqlite');
  const base = await server(t, { LEAD_MODE: 'local', CIVIL_LEAD_DB: file });
  t.after(() => rm(dir, { recursive: true, force: true }));
  assert.equal((await fetch(base + '/api/enquiry')).status, 405);
  assert.equal((await post(base, lead, { origin: 'https://other.example' })).status, 403);
  assert.equal((await post(base, lead, { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await post(base, { ...lead, website: 'trap' })).status, 400);
  assert.equal((await post(base, '{', {}, true)).status, 400);
  assert.equal((await post(base, '{' + ' '.repeat(8200), {}, true)).status, 400);

  const invalid = await post(base, { name: '1', phone: '123', email: 'no', city: '', status: 'wrong', consent: false });
  assert.equal(invalid.status, 422);
  assert.deepEqual(Object.keys((await invalid.json()).errors), ['name', 'phone', 'email', 'status', 'city', 'consent']);

  const attribution = {
    landing: base + '/?utm_source=google&utm_medium=cpc&utm_campaign=civil-intake&utm_content=ad-a&utm_term=procedure&gclid=dummy&fbclid=demo&private=should-drop#enquire',
    referrer: 'https://search.example/results?q=private',
  };
  const results = await Promise.all([post(base, { ...lead, attribution }), post(base, { ...lead, attribution })]);
  assert.deepEqual(results.map(response => response.status).sort(), [200, 201]);
  const receipts = await Promise.all(results.map(response => response.json()));
  assert.equal(receipts[0].id, receipts[1].id);
  assert.equal(receipts.filter(receipt => receipt.created).length, 1);
  assert.ok(receipts.every(receipt => receipt.local));

  const db = new DatabaseSync(file, { readOnly: true });
  try {
    const rows = db.prepare('SELECT payload FROM enquiries').all();
    assert.equal(rows.length, 1);
    const record = JSON.parse(rows[0].payload);
    assert.equal(record.courseId, 'civil-procedure-civil-trial');
    assert.equal(record.phone, '+919876543210');
    assert.equal(record.email, 'qa@example.test');
    assert.equal(record.city, 'சென்னை');
    assert.equal(record.consent, true);
    assert.ok(Math.abs(Date.now() - Date.parse(record.submittedAt)) < 15000);
    assert.deepEqual(record.attribution, {
      utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'civil-intake', utm_content: 'ad-a', utm_term: 'procedure',
      gclid: 'dummy', fbclid: 'demo',
      landingPage: base + '/?utm_source=google&utm_medium=cpc&utm_campaign=civil-intake&utm_content=ad-a&utm_term=procedure&gclid=dummy&fbclid=demo',
      referrer: 'https://search.example',
    });
    assert.doesNotMatch(rows[0].payload, /should-drop/);
  } finally { db.close(); }

  let limited;
  for (let attempt = 0; attempt < 13; attempt++) {
    const response = await post(base, lead);
    if (response.status === 429) { limited = response; break; }
  }
  assert.equal(limited?.status, 429);
  assert.equal(limited?.headers.get('retry-after'), '600');
});

test('storage failure and disabled production return failure without a receipt', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'civil-failure-test-'));
  const fail = await server(t, { LEAD_MODE: 'local', CIVIL_LEAD_DB: dir });
  t.after(() => rm(dir, { recursive: true, force: true }));
  const failure = await post(fail, lead);
  assert.equal(failure.status, 503);
  assert.equal((await failure.json()).ok, undefined);

  const disabled = await server(t, { LEAD_MODE: 'disabled' });
  assert.equal((await post(disabled, lead)).status, 503);
  const missingCredentials = await server(t, { LEAD_MODE: 'webhook', CIVIL_SITE_URL: 'https://civil.example.test' });
  assert.equal((await post(missingCredentials, lead, { origin: 'https://civil.example.test' })).status, 503);
  const missingSheetCredentials = await server(t, { LEAD_MODE: 'sheets' });
  assert.equal((await post(missingSheetCredentials, lead)).status, 503);
});

test('unapproved origins stay non-indexable and serve a real sharing image', async t => {
  const base = await server(t, { LEAD_MODE: 'disabled' });
  const page = await fetch(base);
  const html = await page.text();
  assert.equal(page.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.doesNotMatch(html, /rel="canonical"/);
  assert.match(html, /Civil Procedure &amp; Civil Trial Course \| VLS Law Academy/);
  assert.match(html, /"@type":"Course"/);
  assert.match(html, /"@type":"Organization"/);
  assert.match(html, /property="og:image"/);
  assert.match(await (await fetch(base + '/robots.txt')).text(), /Disallow: \//);
  assert.doesNotMatch(await (await fetch(base + '/sitemap.xml')).text(), /<loc>/);
  assert.match((await fetch(base + '/opengraph-image.jpg')).headers.get('content-type'), /image\/jpeg/);
});

test('webhook adapter requires a durable Civil receipt and an idempotency key', async t => {
  const { deliverToWebhook } = await import('../lib/enquiry-storage.ts');
  const settings = {
    CIVIL_LEAD_WEBHOOK_URL: 'https://civil-intake.example.test/leads',
    CIVIL_LEAD_WEBHOOK_TOKEN: 'synthetic-fixture',
    CIVIL_LEAD_IDEMPOTENCY_SECRET: 'fixture-secret-with-32-plus-characters',
  };
  const old = Object.fromEntries(Object.keys(settings).map(key => [key, process.env[key]]));
  Object.assign(process.env, settings);
  t.after(() => {
    for (const [key, value] of Object.entries(old)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  const payload = {
    courseId: 'civil-procedure-civil-trial', submittedAt: new Date().toISOString(),
    name: lead.name, phone: '+919876543210', email: 'qa@example.test',
    status: lead.status, city: lead.city, consent: true, attribution: { utm_source: 'qa' },
  };
  const approved = { accepted: true, courseId: payload.courseId, id: 'fixture-receipt', created: true };
  const responses = [
    Response.json(approved),
    Response.json({ ...approved, created: false }),
    Response.json({ ...approved, courseId: 'unrelated-course' }),
    Response.json({ ...approved, accepted: false }),
    new Response(null, { status: 503 }),
  ];
  const keys = [];
  t.mock.method(globalThis, 'fetch', async (destination, request) => {
    assert.equal(destination.href, settings.CIVIL_LEAD_WEBHOOK_URL);
    assert.equal(request.headers.Authorization, 'Bearer synthetic-fixture');
    assert.equal(request.redirect, 'error');
    assert.deepEqual(JSON.parse(request.body), payload);
    keys.push(request.headers['Idempotency-Key']);
    return responses.shift();
  });
  assert.deepEqual(await deliverToWebhook(payload), { id: 'fixture-receipt', created: true, local: false });
  assert.deepEqual(await deliverToWebhook(payload), { id: 'fixture-receipt', created: false, local: false });
  await assert.rejects(deliverToWebhook(payload), /receipt invalid/);
  await assert.rejects(deliverToWebhook(payload), /receipt invalid/);
  await assert.rejects(deliverToWebhook(payload), /HTTP error/);
  assert.equal(new Set(keys).size, 1);
  assert.match(keys[0], /^[a-f0-9]{64}$/);
});

test('Google Sheet adapter enforces Apps Script URL, follows redirects and passes token and idempotency key', async t => {
  const { deliverToSheet } = await import('../lib/enquiry-storage.ts');
  const settings = {
    CIVIL_LEAD_SHEET_URL: 'https://script.google.com/macros/s/AKfycb_test_deployment_id/exec',
    CIVIL_LEAD_SHEET_TOKEN: 'sheet-secret-token',
    CIVIL_LEAD_IDEMPOTENCY_SECRET: 'fixture-secret-with-32-plus-characters',
  };
  const old = Object.fromEntries(Object.keys(settings).map(key => [key, process.env[key]]));
  Object.assign(process.env, settings);
  t.after(() => {
    for (const [key, value] of Object.entries(old)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  const payload = {
    courseId: 'civil-procedure-civil-trial', submittedAt: new Date().toISOString(),
    name: lead.name, phone: '+919876543210', email: 'qa@example.test',
    status: lead.status, city: lead.city, consent: true, attribution: { utm_source: 'qa' },
  };
  const approved = { accepted: true, courseId: payload.courseId, id: 'sheet-receipt-1', created: true };
  const responses = [
    Response.json(approved),
    Response.json({ ...approved, created: false }),
    Response.json({ accepted: false, error: 'Unauthorized' }),
    new Response(null, { status: 500 }),
  ];
  const keys = [];
  t.mock.method(globalThis, 'fetch', async (destination, request) => {
    assert.equal(destination.href, settings.CIVIL_LEAD_SHEET_URL);
    assert.equal(request.redirect, 'follow');
    const body = JSON.parse(request.body);
    assert.equal(body.token, settings.CIVIL_LEAD_SHEET_TOKEN);
    assert.equal(body.courseId, payload.courseId);
    assert.equal(body.email, payload.email);
    keys.push(body.idempotencyKey);
    return responses.shift();
  });
  assert.deepEqual(await deliverToSheet(payload), { id: 'sheet-receipt-1', created: true, local: false });
  assert.deepEqual(await deliverToSheet(payload), { id: 'sheet-receipt-1', created: false, local: false });
  await assert.rejects(deliverToSheet(payload), /receipt invalid/);
  await assert.rejects(deliverToSheet(payload), /HTTP error/);
  assert.equal(new Set(keys).size, 1);
  assert.match(keys[0], /^[a-f0-9]{64}$/);

  process.env.CIVIL_LEAD_SHEET_URL = 'https://not-google-apps-script.example.test/exec';
  await assert.rejects(deliverToSheet(payload), /not configured/);
});
