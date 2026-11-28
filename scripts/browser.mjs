import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { chromium, webkit, firefox } from 'playwright';

const require = createRequire(import.meta.url);
const base = process.env.CIVIL_QA_URL ?? 'http://127.0.0.1:3102';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'QA submissions require loopback');
const outputs = resolve(process.env.CIVIL_QA_OUTPUT ?? 'docs/screenshots');
await mkdir(outputs, { recursive: true });
await mkdir(resolve(outputs, 'viewports'), { recursive: true });
const measurements = [];
const skipped = [];
const widths = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
const fileNames = { 390: 'mobile', 768: 'tablet', 1440: 'desktop' };
const engines = { chromium, webkit, firefox };
const requested = (process.env.CIVIL_QA_BROWSERS ?? 'chromium,webkit,firefox').split(',');
const nextFrame = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const noAnalyticsPII = data => !/QA Browser|example\.test|987654|QA City/.test(JSON.stringify(data));
const eventList = page => page.evaluate(() => window.dataLayer ?? []);
const pixelScript = 'https://connect.facebook.net/en_US/fbevents.js';

async function checkViewport(browser, engine, width) {
  const page = await browser.newPage({ viewport: { width, height: width <= 430 ? 780 : 900 }, reducedMotion: 'reduce' });
  await page.route(pixelScript, route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') failures.push(message.text());
  });
  page.on('requestfailed', request => failures.push(`${request.url()} ${request.failure()?.errorText}`));
  page.on('response', response => { if (response.status() >= 400) failures.push(String(response.status()) + ' ' + response.url()); });
  try {
    await page.goto(base, { waitUntil: 'networkidle' });
    const heroCta = page.locator('.hero .button-primary');
    await heroCta.waitFor();
    const metrics = await page.evaluate(async () => {
      await document.fonts.ready;
      const image = document.querySelector('.hero-image img');
      const cta = document.querySelector('.hero .button-primary');
      const hero = image.getBoundingClientRect();
      const button = cta.getBoundingClientRect();
      return {
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth, heroWidth: Math.round(hero.width),
        heroHeight: Math.round(hero.height), photo: new URL(image.currentSrc).pathname, naturalWidth: image.naturalWidth,
        ctaBottom: Math.round(button.bottom), ctaHeight: Math.round(button.height),
        color: getComputedStyle(cta).backgroundColor, text: getComputedStyle(cta).color,
      };
    });
    assert.equal(metrics.scrollWidth, width, `${engine} at ${width}px overflows horizontally`);
    assert.ok(metrics.ctaBottom < 680 && metrics.ctaHeight >= 44, JSON.stringify(metrics));
    assert.equal(metrics.color, 'rgb(178, 10, 10)');
    assert.equal(metrics.text, 'rgb(255, 255, 255)');
    assert.ok(metrics.naturalWidth > 0);
    assert.equal(metrics.photo, width < 700 ? '/vls/hero-mobile.webp' : '/vls/hero.webp');
    assert.equal(await page.locator('main > section').count(), 8);
    assert.equal(await page.locator('.header-nav').isVisible(), width >= 700);
    assert.equal(await page.locator('#curriculum details[open]').count(), 0);

    if (engine === 'chromium' && fileNames[width]) {
      for (const img of await page.locator('main img').all()) {
        await img.evaluate(el => { el.loading = 'eager'; });
        await img.evaluate(el => el.decode());
      }
      await page.screenshot({ path: resolve(outputs, fileNames[width] + '.png'), fullPage: true, animations: 'disabled' });
    }
    if (engine === 'chromium') {
      await page.screenshot({ path: resolve(outputs, 'viewports', width + '.png'), animations: 'disabled' });
    }

    await page.locator('.hero .button-outline').click();
    await page.waitForURL(url => url.hash === '#curriculum');
    const unit = page.locator('#curriculum summary').first();
    await unit.focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#curriculum details[open]').count(), 1);
    assert.ok(await page.getByText('Appellate proceedings', { exact: true }).isVisible());
    await page.locator('#curriculum summary').nth(1).click();
    assert.equal(await page.locator('#curriculum details[open]').count(), 1);
    if (width < 700) {
      const sticky = page.locator('.mobile-enquiry');
      await sticky.waitFor({ state: 'visible' });
      await sticky.getByRole('link').click();
      await page.waitForURL(url => url.hash === '#enquire');
      await sticky.waitFor({ state: 'hidden' });
    } else {
      await page.locator('.header-cta').click();
      await page.waitForURL(url => url.hash === '#enquire');
    }
    await page.locator('#faqs summary').last().click();
    assert.ok(await page.getByText('Use the enquiry form or contact', { exact: false }).isVisible());
    await nextFrame(page);
    assert.equal(new Set(failures).size, 0, failures.join('\n'));
    measurements.push({ engine, version: browser.version(), ...metrics, errors: failures });
    console.log(`PASS ${engine} ${width}px`);
  } finally { await page.close(); }
}

async function accessibility(browser) {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    try {
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Skip to main content');
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'content');
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const result = await page.evaluate(() => window.axe.run({
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      }));
      assert.deepEqual(result.violations.map(({ id, nodes }) => ({ id, selectors: nodes.map(node => node.target) })), []);
      console.log(`PASS axe WCAG 2.1 AA ${width}px, ${result.passes.length} automated rules passed`);
    } finally { await page.close(); }
  }
  const page = await browser.newPage({ javaScriptEnabled: false });
  await page.goto(base);
  assert.ok(await page.getByRole('heading', { level: 1 }).isVisible());
  await page.locator('#curriculum summary').first().click();
  assert.ok(await page.getByText('Appellate proceedings', { exact: true }).isVisible());
  const fallback = page.locator('form noscript a');
  assert.ok(await fallback.isVisible());
  assert.equal(await fallback.getAttribute('href'), 'tel:+919500207811');
  await page.close();
  console.log('PASS curriculum and contact fallback with JavaScript disabled');
}

async function enquiry(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await page.route(pixelScript, route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  const external = [];
  page.on('request', request => { if (request.url() !== pixelScript && !request.url().startsWith(base + '/')) external.push(request.url()); });
  try {
    await page.goto(base + '/?utm_source=qa&utm_medium=cpc&utm_campaign=civil-browser&gclid=qa-fixture&private=example.test', { waitUntil: 'networkidle' });
    await page.locator('.hero .button-outline').click();
    await page.waitForURL(url => url.hash === '#curriculum');
    await page.locator('.mobile-enquiry a').click();
    await page.waitForURL(url => url.hash === '#enquire');
    const form = page.locator('form');
    const submit = form.getByRole('button', { name: 'Get Course Details' });
    const alert = form.getByRole('alert');
    await submit.click();
    await alert.waitFor();
    await page.waitForFunction(() => document.activeElement.id === 'name');
    assert.equal(await form.locator('[aria-invalid=true]').count(), 6);
    const suffix = String(Date.now()).slice(-6);
    async function fill() {
      await form.getByLabel('Full name').fill('QA Browser');
      await form.getByLabel('Mobile number').fill('9876' + suffix);
      await form.getByLabel('Email address').fill(`civil-qa-${suffix}@example.test`);
      await form.getByLabel('Professional status').selectOption('Law student');
      await form.getByLabel('City').fill('QA City');
      await form.getByRole('checkbox').check();
    }
    await fill();
    await page.route('**/api/enquiry', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"Temporarily unavailable. Please try again."}' });
    });
    await submit.click();
    const pending = form.getByRole('button', { name: 'Sending enquiry…' });
    await pending.waitFor();
    assert.ok(await pending.isDisabled());
    await alert.waitFor();
    assert.match(await alert.textContent(), /Temporarily unavailable/);
    assert.equal(await form.getByLabel('City').inputValue(), 'QA City');
    assert.equal((await eventList(page)).filter(e => e.event === 'form_submit_success').length, 0);
    await page.unroute('**/api/enquiry');
    await page.evaluate(() => document.addEventListener('click', event => {
      if (event.target.closest('a[href^="tel:"], a[href^="https://wa.me/"]')) event.preventDefault();
    }));
    const phone = page.getByRole('link', { name: 'Call admissions' });
    const whatsApp = page.getByRole('link', { name: 'WhatsApp admissions' });
    assert.equal(await phone.getAttribute('href'), 'tel:+919500207811');
    assert.equal(await whatsApp.getAttribute('href'), 'https://wa.me/919500025216');
    await phone.click();
    await whatsApp.click();

    const response = page.waitForResponse('**/api/enquiry');
    await submit.click();
    const accepted = await response;
    assert.equal(accepted.status(), 201);
    assert.match(accepted.request().postDataJSON().attribution.landing, /utm_campaign=civil-browser/);
    assert.doesNotMatch(accepted.request().postDataJSON().attribution.landing, /private=|#enquire/);
    await page.waitForURL(url => url.pathname === '/thank-you');
    await page.getByRole('heading', { name: 'Enquiry received.' }).waitFor();
    assert.ok(await page.getByText('Your test enquiry is saved in this local preview.').isVisible());

    const data = await eventList(page);
    for (const name of ['course_page_view', 'curriculum_view', 'enquire_click', 'form_start', 'form_submit_success', 'phone_click', 'whatsapp_click']) {
      assert.equal(data.filter(e => e.event === name).length, 1, JSON.stringify(data));
    }
    assert.deepEqual(data.filter(e => e.event === 'form_submit_error').map(e => e.reason), ['validation', 'delivery']);
    assert.ok(noAnalyticsPII(data));
    assert.deepEqual(external, []);

    await page.goto(base, { waitUntil: 'networkidle' });
    await fill();
    const repeat = page.waitForResponse('**/api/enquiry');
    await submit.click();
    assert.equal((await repeat).status(), 200);
    await page.waitForURL(url => url.pathname === '/thank-you');
    await page.getByRole('heading', { name: 'Enquiry already received.' }).waitFor();
    assert.equal((await eventList(page)).filter(e => e.event === 'form_submit_success').length, 0);
    console.log('PASS confirmed form, duplicate, invalid fields, pending/failure, contact and privacy-safe analytics');
  } finally { await page.close(); }
}

for (const engine of requested) {
  const executablePath = engine === 'chromium' ? process.env.CIVIL_CHROMIUM_EXECUTABLE : undefined;
  let browser;
  try {
    browser = await engines[engine].launch({ ...(executablePath ? { executablePath } : {}) });
  } catch (error) {
    skipped.push({ engine, reason: error.message.split('\n').slice(0, 2).join(' ') });
    continue;
  }
  try {
    for (const width of widths) await checkViewport(browser, engine, width);
    if (engine === 'chromium') {
      await accessibility(browser);
      await enquiry(browser);
    }
  } finally { await browser.close(); }
}
await writeFile(resolve(outputs, '..', 'browser-results.json'), JSON.stringify({ measurements, skipped }, null, 2) + '\n');
for (const entry of skipped) console.log('SKIP', entry.engine, entry.reason);
assert.ok(measurements.length > 0, 'No browser ran');
assert.ok(!requested.includes('chromium') || measurements.some(entry => entry.engine === 'chromium'), 'Chromium is required for interaction and accessibility checks');
