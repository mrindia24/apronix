# Handover summary — Apronix Tech website

**Status:** complete and running. Production build passes, unit tests pass, E2E
suite passes, axe reports zero WCAG 2.1 AA violations on every public page.

---

## 1. What was built

### Public website (13 routes + 404)
| Route | Notes |
| --- | --- |
| `/` | Hero (code-drawn device mockups, no stock photos), capability strip, 3 service cards, why-Apronix grid, featured projects (from DB), 6-step process, testimonials (only if approved), FAQ accordion, latest articles, final CTA |
| `/about` | Positioning, principles, capabilities, process, CTA |
| `/services` | Comparison of the three services with deliverables and "what this solves" |
| `/services/social-media-management` | Individually written page: problems, deliverables, benefits, use cases, workflow, projects, FAQs, enquiry form, related services |
| `/services/shopify-development` | Same structure, service-specific content |
| `/services/wordpress-development` | Same structure, service-specific content |
| `/work` | Client-side filtering (All / Shopify / WordPress / Social), sample-content notice |
| `/work/[slug]` | Overview, brief, challenges, strategy, solution, technologies, deliverables, gallery, related projects, CTA |
| `/blog` | Featured article, search, category filter, pagination, empty state |
| `/blog/[slug]` | Markdown article, table of contents, share buttons, tags, related reading, Article schema |
| `/contact` | Enquiry form, contact details, "what happens next", FAQs |
| `/privacy-policy`, `/terms-and-conditions` | Full, specific policies (cookies, retention, rights, no-results-guarantee clause) |
| 404 / error | Branded, with useful navigation |

### Admin dashboard (`/admin`)
Overview stats, **Leads** (search, filter by status/service/date, detail view, internal
notes, status pipeline, retry failed notification, CSV export), **Portfolio**
(create/edit/delete, feature toggle, media picker, SEO, slug-change redirects),
**Blog** (markdown editor with live preview, categories, tags, scheduling, publishing),
**Services** (editable hero copy + structured sections), **Testimonials** (approval
gate), **FAQs** (scoped to home or a service), **Media library** (upload,
auto-WebP + resize, copy URL, delete), **Settings** (contact details, agency facts,
socials, integration status, redirects, password change).

### Platform
PostgreSQL + Prisma (17 models, indexed, cascading), Zod validation shared by client
and server, bcrypt passwords, DB-backed sessions, role-based access control
(`EDITOR`/`ADMIN`/`SUPER_ADMIN`), rate limiting, honeypot + timing + link heuristics,
optional Turnstile, local-or-S3 media storage, consent-gated analytics, sitemap,
robots, JSON-LD, security headers, redirect-on-slug-change, sample-content labelling.

---

## 2. What was tested (actually run)

```
npm run build      → ✓ compiled, 24 routes prerendered
npm run typecheck  → ✓ no errors
npm run lint       → ✓ no warnings or errors
npm test           → ✓ 46 tests / 7 files
npm run test:e2e   → ✓ 13 assertions (see below)
axe-core           → ✓ 0 violations, WCAG 2.1 AA + best practice, 10 pages
```

E2E coverage: contact form submission (201 + reference + DB record), required-field
validation, `/admin` → `/admin/login` redirect, wrong password rejected, correct
login, lead visible in dashboard, internal note saved, status updated, article
published and publicly reachable, unauthenticated CSV export returns 401,
unauthenticated media upload returns 401, settings saved, logout → 307 on `/admin`.

Keyboard/manual: skip link is the first tab stop; services dropdown opens on Enter and
closes on Escape; FAQ accordions are real `<button aria-expanded>`; reduced-motion mode
renders all content (0 hidden reveal elements).

---

## 3. Credentials / services still to configure

| What | Where | Needed for |
| --- | --- | --- |
| `DATABASE_URL` | env | Everything — use your own PostgreSQL in production |
| `AUTH_SECRET` | env | Sessions (`openssl rand -base64 48`) |
| `NEXT_PUBLIC_SITE_URL` | env | Canonicals, sitemap, OG tags — set to the live HTTPS domain |
| Admin account | `npm run admin:create` | Production sign-in (the seeded dev account is `admin@apronixtech.com` with the password in `.env`) |
| SMTP (`SMTP_*`, `MAIL_FROM`) | env | Enquiry notification + acknowledgement emails |
| `ENQUIRY_INBOX_EMAIL` | env | Where notifications are delivered |
| `SUPPORT_EMAIL`, WhatsApp number | env or Admin → Settings | Footer, contact page, WhatsApp buttons |
| `S3_*` | env | Media uploads on serverless hosts (local disk works on a VPS) |
| `NEXT_PUBLIC_ANALYTICS_ID` / `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | env | Consent-gated analytics |
| `TURNSTILE_SECRET_KEY` | env | Extra spam protection (optional) |
| Business address / service area | Admin → Settings | Currently blank — nothing is shown on the site until you confirm it |
| Photography | `public/media/` + `CREDITS.md` | All stock is free for commercial use; replace with your own team/workspace photos for the best result |

Replace or delete the three sample projects and three sample articles before launch —
they are flagged `isSampleContent` and display a "Sample" badge.

---

## 4. Local run in this workspace

The sandbox has no system PostgreSQL, so a userland PostgreSQL 17 instance was
started for testing:

```bash
# start the dev database (already running in this session)
/home/user/tools/node_modules/@embedded-postgres/linux-x64/native/bin/pg_ctl \
  -D /home/user/tools/pgdata -l /home/user/tools/pg.log \
  -o "-p 55432 -k /tmp" start

# the app (http://localhost:3000)
cd /home/user/apronix-tech && npm start      # or: npm run dev
```

`.env` in the repo points at `postgresql://apronix:apronix@127.0.0.1:55432/apronix`.
On your own machine, replace `DATABASE_URL` with your PostgreSQL instance and run
`npx prisma migrate deploy` (or `migrate dev`), then `npm run db:seed`.
