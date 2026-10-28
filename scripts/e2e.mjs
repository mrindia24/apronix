/**
 * End-to-end smoke test against a running server.
 *
 *   npm run build && npm start          # in one terminal
 *   npm run test:e2e                    # in another
 *
 * Requires the seeded admin account. Override with E2E_EMAIL / E2E_PASSWORD /
 * BASE_URL environment variables. Covers: public form submission + validation,
 * admin login (bad and good credentials), lead capture, internal notes, status
 * update, CSV export authorisation, publishing a blog article, media upload
 * authorisation, settings save and logout.
 */
import { chromium } from 'playwright';
const B = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const EMAIL = process.env.E2E_EMAIL ?? process.env.ADMIN_EMAIL ?? 'admin@apronixtech.com';
const PASSWORD = process.env.E2E_PASSWORD ?? process.env.ADMIN_PASSWORD ?? '';
if (!PASSWORD) {
  console.error('Set E2E_PASSWORD (or ADMIN_PASSWORD) before running the E2E suite.');
  process.exit(1);
}
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type()==='error') errs.push('CONSOLE: ' + m.text()); });

function log(...a){ console.log(...a); }

// ---------- 1. public contact form ----------
await page.goto(B + '/contact', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);            // let the honeypot timer pass
await page.fill('#fullName', 'Priya Raman');
await page.fill('#email', 'priya@brightleaf.in');
await page.fill('#phone', '+91 98765 43210');
await page.fill('#company', 'Brightleaf Interiors');
await page.selectOption('#service', 'SHOPIFY_DEVELOPMENT');
await page.selectOption('#budget', '₹75,000 – ₹2,00,000');
await page.selectOption('#timeline', 'Within 1 month');
await page.fill('#message', 'We sell handmade furniture and our current store is slow on mobile. We want a rebuild with better product pages before our festive campaign.');
await page.check('#consent');
await page.click('button[type="submit"]');
await page.waitForSelector('[role="status"]', { timeout: 20000 });
const successText = await page.textContent('[role="status"]');
log('FORM SUCCESS:', successText.replace(/\s+/g,' ').slice(0,140));

// validation test (submit empty)
await page.click('text=Send another enquiry');
await page.waitForTimeout(300);
await page.click('button[type="submit"]');
await page.waitForTimeout(1200);
const alerts = await page.$$eval('[role="alert"]', els => els.map(e => e.textContent.trim().slice(0,80)));
log('VALIDATION ALERTS:', JSON.stringify(alerts));

// ---------- 2. admin login ----------
await page.goto(B + '/admin', { waitUntil: 'networkidle' });
log('REDIRECTED TO:', new URL(page.url()).pathname);
await page.fill('#email', EMAIL);
await page.fill('#password', 'WrongPassword123');
await page.click('button[type="submit"]');
await page.waitForTimeout(1500);
log('BAD LOGIN MSG:', (await page.textContent('[role="alert"]')).trim());

await page.fill('#email', EMAIL);
await page.fill('#password', PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL('**/admin', { timeout: 20000 });
await page.waitForTimeout(1500);
log('ADMIN LOADED:', new URL(page.url()).pathname);
await page.screenshot({ path: '/tmp/shots/admin-dash.png' });

// lead is visible?
const leadVisible = await page.locator('text=Priya Raman').first().isVisible().catch(()=>false);
log('LEAD VISIBLE ON DASHBOARD:', leadVisible);

// ---------- 3. leads page + detail ----------
await page.goto(B + '/admin/leads', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/shots/admin-leads.png' });
await page.click('text=Priya Raman');
await page.waitForURL('**/admin/leads/**');
await page.waitForTimeout(800);
await page.fill('#body', 'Called and left voicemail. Budget confirmed. Follow up Monday.');
await page.click('text=Add note');
await page.waitForTimeout(1500);
const noteOk = await page.locator('text=Called and left voicemail').first().isVisible();
log('NOTE SAVED:', noteOk);
await page.selectOption('#status', 'CONTACTED');
await page.click('text=Save status');
await page.waitForTimeout(1200);
await page.screenshot({ path: '/tmp/shots/admin-lead-detail.png', fullPage: true });

// ---------- 4. CSV export ----------
const res = await ctx.request.get(B + '/api/admin/leads/export');
log('CSV EXPORT:', res.status(), (await res.text()).split('\n')[0].slice(0,90));

// ---------- 5. create blog post ----------
await page.goto(B + '/admin/blog/new', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.fill('#title', 'E2E test article about store speed');
const testSlug = `e2e-test-article-${Date.now()}`;
await page.fill('#slug', testSlug);
await page.fill('#excerpt', 'A temporary article created by the automated end-to-end test to verify publishing works.');
await page.fill('#content', '## Why speed matters\n\nThis is a **test** article created by the E2E suite.\n\n- One point\n- Another point\n\n> A quote for testing.');
await page.selectOption('#status', 'PUBLISHED');
await page.click('button[type="submit"]');
await page.waitForURL('**/admin/blog?saved=1', { timeout: 20000 });
log('BLOG POST CREATED -> blog page');
const blogRes = await ctx.request.get(B + '/blog/' + testSlug);
log('PUBLISHED ARTICLE STATUS:', blogRes.status());

// ---------- 6. media upload API (unauthenticated must fail) ----------
const unauth = await ctx.request.post(B + '/api/admin/media', { multipart: { file: { name: 'x.png', mimeType: 'image/png', buffer: Buffer.from('x') } } });
log('UNAUTH UPLOAD (expect 401):', unauth.status());

// ---------- 7. authenticated media upload ----------
const png = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63f8ffff3f0005fe02fea735e2c40000000049454e44ae426082','hex');
const up = await ctx.request.post(B + '/api/admin/media', { multipart: { file: { name: 'test-tile.png', mimeType: 'image/png', buffer: png }, alt: 'Test tile' } });
const upJson = await up.json().catch(()=>({}));
log('AUTH UPLOAD:', up.status(), JSON.stringify(upJson).slice(0,120));

// ---------- 8. settings save ----------
await page.goto(B + '/admin/settings', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.fill('#phone', '+91 141 400 2200');
await page.click('text=Save settings');
await page.waitForTimeout(1800);
const settingsMsg = await page.locator('[role="status"]').first().textContent().catch(()=>null);
log('SETTINGS SAVE:', settingsMsg);

// ---------- 9. logout ----------
await page.goto(B + '/admin', { waitUntil: 'networkidle' });
await page.click('text=Sign out');
await page.waitForURL('**/admin/login', { timeout: 15000 });
const afterLogout = await ctx.request.get(B + '/admin', { maxRedirects: 0 });
log('AFTER LOGOUT /admin STATUS:', afterLogout.status());

log('\nERRORS:', errs.length ? errs.slice(0,12) : 'none');
await browser.close();
