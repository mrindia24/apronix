# Apronix Tech — website & CMS

A production-ready marketing site and content platform for **Apronix Tech**
(_Digital Experiences. Measurable Growth._), a digital agency offering social
media management, Shopify development and WordPress development.

Built with Next.js (App Router) · React · TypeScript · Tailwind CSS ·
PostgreSQL · Prisma · Zod.

---

## What's in the box

| Area | What it does |
| --- | --- |
| **Public site** | Home, About, Services index, 3 service detail pages, Portfolio + project pages, Blog + article pages, Contact, Privacy, Terms, custom 404 |
| **Content management** | Database-backed services, portfolio projects, blog articles, categories/tags, FAQs, testimonials, site settings, media library |
| **Lead management** | Validated enquiry form → database → email notification → admin pipeline (New → Contacted → Qualified → Won/Lost), internal notes, CSV export |
| **Auth & roles** | Email + password admin sign-in, bcrypt hashes, DB-backed sessions (8 h), roles `EDITOR` / `ADMIN` / `SUPER_ADMIN` |
| **SEO** | Per-page metadata, canonicals, Open Graph, JSON-LD (Organisation, WebSite, Breadcrumb, Article, Service, FAQ), `sitemap.xml`, `robots.txt`, automatic redirects on slug changes |
| **Accessibility** | WCAG 2.1 AA verified with axe (0 violations across all public pages and the login screen), keyboard operable, reduced-motion aware, skip link |
| **Testing** | 46 unit tests (Vitest) + a Playwright end-to-end smoke suite covering the form, auth, CMS and export |

---

## Quick start (local)

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
#    → set DATABASE_URL, AUTH_SECRET (openssl rand -base64 48),
#      NEXT_PUBLIC_SITE_URL, ADMIN_EMAIL, ADMIN_PASSWORD

# 3. Create the schema + seed launch content
npx prisma migrate dev      # applies prisma/migrations
npm run db:seed             # services, FAQs, sample projects/articles, first admin

# 4. Run
npm run dev                 # http://localhost:3000
```

Sign in at **/admin/login** with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

### Useful scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (runs `prisma generate`) |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Next core-web-vitals + typescript) |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright smoke test against a running server |
| `npm run db:migrate` | Create/apply migrations in development |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Seed launch content (idempotent) |
| `npm run db:studio` | Prisma Studio |
| `npm run admin:create` | Create or reset an administrator (see below) |

---

## Administrator accounts

There is **no public registration page** — deliberately. Create administrators
from the server:

```bash
# Create a super admin; a strong password is generated and printed once
npm run admin:create -- --email owner@apronixtech.com --name "Owner" --role SUPER_ADMIN

# Or supply the password explicitly (12+ characters)
npm run admin:create -- --email editor@apronixtech.com --password 'LongUniquePassw0rd!' --role EDITOR
```

Running it for an existing email **resets** that account's password and
invalidates all of its sessions.

| Role | Can do |
| --- | --- |
| `EDITOR` | Create/edit portfolio, blog, FAQs, testimonials; manage leads |
| `ADMIN` | Everything an editor can, plus services content, site settings, media uploads, deleting projects/articles, retrying lead emails, CSV export |
| `SUPER_ADMIN` | Everything, plus deleting leads and other administrators |

Passwords are hashed with bcrypt (12 rounds). Sessions are stored in the database
as SHA-256 token hashes in an `HttpOnly`, `SameSite=Lax`, `Secure`-in-production
cookie. Signing out (or changing your password) deletes sessions server-side.

---

## Project structure

```
apronix-tech/
├─ app/
│  ├─ (site)/                 # Public marketing routes (header + footer shell)
│  │  ├─ page.tsx             # Home
│  │  ├─ about/  services/  work/  blog/  contact/
│  │  ├─ privacy-policy/  terms-and-conditions/
│  │  └─ layout.tsx           # Public chrome
│  ├─ (admin-auth)/admin/login/   # Sign-in (no marketing chrome)
│  ├─ (admin)/admin/          # Protected dashboard
│  │  ├─ page.tsx             # Overview
│  │  ├─ leads/  portfolio/  blog/  services/
│  │  ├─ testimonials/  faqs/  media/  settings/
│  │  └─ layout.tsx           # Session gate + admin shell
│  ├─ api/
│  │  ├─ enquiries/           # Public enquiry endpoint
│  │  └─ admin/               # auth, media, leads export
│  ├─ sitemap.ts  robots.ts  manifest.ts  not-found.tsx  error.tsx
│  └─ layout.tsx  globals.css
├─ src/
│  ├─ components/{site,admin,ui}/   # UI building blocks
│  ├─ content/services.ts           # Service content model + launch copy
│  └─ lib/                          # auth, actions, prisma, seo, email, storage…
├─ prisma/
│  ├─ schema.prisma                 # Data model
│  ├─ migrations/                   # Versioned SQL migrations
│  └─ seed.ts                       # Launch content + sample data
├─ public/media/                    # Photography + device mockups (see CREDITS.md)
├─ CREDITS.md                       # Image licensing and what each mockup shows
├─ tests/                           # Vitest unit tests
├─ scripts/                         # create-admin.ts, e2e.mjs, fetch-fonts.mjs
├─ middleware.ts                    # Edge gate for /admin (+ noindex header)
└─ public/                          # Brand assets, fonts, sample media, uploads
```

---

## Data model (Prisma)

`AdminUser`, `AdminSession`, `Service`, `PortfolioProject`, `ProjectImage`,
`BlogPost`, `BlogCategory`, `BlogTag`, `BlogPostTag`, `Testimonial`, `FAQ`,
`Lead`, `LeadNote`, `MediaAsset`, `SiteSetting`, `Redirect`, `PageView`.

Notes:

- Slugs are unique; publishing status is an enum (`DRAFT` / `PUBLISHED` / `ARCHIVED`).
- Every table has `createdAt`; mutable tables have `updatedAt`.
- `isSampleContent` marks seeded demo projects/articles so they label themselves
  in the UI and cannot be mistaken for real client work.
- Renaming a published slug automatically writes a `Redirect` row.
- Leads store a **salted SHA-256 hash** of the IP address (for rate limiting),
  never the raw address.

Migrations: `npx prisma migrate dev` locally, `npx prisma migrate deploy` in
production. Always take a database backup before deploying migrations.

---

## The enquiry pipeline

1. Client-side validation gives immediate feedback; the server is authoritative.
2. Server checks: Zod schema → honeypot → minimum fill time → optional Turnstile
   → link-spam heuristics → hourly rate limit per IP hash.
3. The lead is **committed to PostgreSQL first**.
4. Notification email to `ENQUIRY_INBOX_EMAIL` and an acknowledgement to the
   enquirer are sent. Delivery failures never lose the lead: the failure is
   recorded (`emailState = FAILED`) and an admin can retry from the lead page.
5. The API only returns `{ ok: true, reference }` after step 3 succeeds — the
   form never reports success speculatively.

Without SMTP configured, leads are still captured and the dashboard shows a clear
banner that email is disabled.

Attribution captured when available: source, landing page, referrer, UTM
source/medium/campaign, consent flag, timestamp.

---

## Deployment

Any Node.js host with PostgreSQL works. Vercel + Neon/Supabase is the simplest
path; Railway, Render, Fly.io and a VPS all work too.

### 1. Database

Provision PostgreSQL 14+. Copy the connection string into `DATABASE_URL`
(include `?sslmode=require` for managed providers).

```bash
npx prisma migrate deploy     # apply migrations
npm run db:seed               # optional: launch content
npm run admin:create -- --email you@domain.com --role SUPER_ADMIN
```

### 2. Environment

Set every variable from `.env.example` in the host's environment settings.
Minimum for production: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`.
Strongly recommended: SMTP settings, `ENQUIRY_INBOX_EMAIL`, `SUPPORT_EMAIL`.

### 3. Build & run

```bash
npm ci
npm run build
npm start                     # serves on $PORT (default 3000)
```

Platform presets:

- **Vercel**: import the repo; add env vars; framework auto-detected. Media
  uploads must use S3/R2 (the filesystem is ephemeral).
- **Netlify**: use the Next.js runtime, same env vars.
- **Railway / Render / Fly.io**: add a Postgres add-on, set the build command to
  `npm run build` and the start command to `npm start`.
- **VPS (Ubuntu)**: Node 20+, `pm2 start npm -- start` or a systemd unit, with
  nginx as a reverse proxy.

### 4. Domain, DNS and HTTPS

1. Add the domain at your host and copy the DNS records it gives you.
2. At your registrar: `A` record → the host's IP (apex) and `CNAME` → host
   hostname (`www`).
3. Wait for propagation, then enable the host's automatic TLS (Let's Encrypt).
   On a VPS use `certbot --nginx` for a free certificate and auto-renewal.
4. Verify HTTPS redirects are on, then set `NEXT_PUBLIC_SITE_URL` to the final
   `https://` origin **with no trailing slash**, and redeploy so canonicals,
   sitemap and structured data match.

### 5. Media

- Default: uploads are written to `public/uploads` on the server's disk. Fine on
  a VPS with persistent storage.
- Serverless (Vercel/Netlify): configure S3-compatible storage. The upload API
  switches to S3 automatically when `S3_*` variables are present.
- Raster images are converted to WebP and capped at 2000 px wide on upload.
  SVG is stored as-is and served with a restrictive CSP, but never optimised.

### 6. Email

Configure SMTP with any transactional provider (Resend, Postmark, SES, Mailgun,
Zoho, Google Workspace). Verify the sending domain (SPF + DKIM, and DMARC
recommended) so notifications reach inboxes. Test by submitting the contact form
and checking both the inbox copy and the enquirer acknowledgement.

### 7. Backups

- Managed Postgres: enable automated daily backups with 7–30 day retention.
- Manual: `pg_dump "$DATABASE_URL" -Fc -f apronix-$(date +%F).dump`
  and restore with `pg_restore -d "$DATABASE_URL" --clean apronix-….dump`.
- Back up the media directory (or enable bucket versioning) alongside the database.
- Store backups off the application server and test a restore before you need it.

### 8. Post-launch checklist

- [ ] `NEXT_PUBLIC_SITE_URL` matches the live HTTPS origin
- [ ] `/sitemap.xml` and `/robots.txt` resolve and reference the production domain
- [ ] `/admin` redirects to `/admin/login` when signed out; `X-Robots-Tag: noindex` present
- [ ] Real admin account created; seed password changed or seed env vars removed
- [ ] Sample content deleted or replaced (portfolio + blog entries labelled "Sample")
- [ ] Testimonials only added with written client permission
- [ ] Contact form tested end to end (DB record **and** both emails)
- [ ] WhatsApp number set (if used)
- [ ] Analytics configured and consent banner behaviour checked
- [ ] `npm test` and `npm run test:e2e` pass
- [ ] Search Console / Bing verification submitted with the sitemap
- [ ] Uptime monitoring and error alerting enabled

---

## Photography and mockups

The hero, the three service images and their matching project covers are **real
device photographs** with a screenshot of this site perspective-mapped onto the
physical screen, then graded to the dark brand palette. Screens were captured
from the running build at 1440×900 and 390×844 and mapped with a homography, so
the interface follows the photographed device exactly.

All photography is free for commercial use (Pexels licence, no attribution
required). Sources, licence and what each image depicts are listed in
`CREDITS.md`. Nothing in the imagery depicts a third-party client's work, an
invented dashboard or a fabricated result.

To swap in your own photography, replace the files in `public/media/` keeping the
same names and aspect ratios (16:10 for project covers, 16:9 for articles and
editorial bands) and record the new source in `CREDITS.md`.

## Content and honesty rules baked into the build

- No fabricated statistics, client logos, testimonials or awards anywhere in the
  seed data or templates. Testimonials only render when an admin marks a record
  **approved**, and the section is hidden entirely when none exist.
- Sample projects and articles carry a visible "Sample" badge and
  `isSampleContent = true`. The homepage and portfolio index explain this.
- The site makes no ranking, traffic or revenue guarantees.
- Structured data contains no review ratings or aggregate ratings (we have no
  verified store of them).

---

## Known limitations & optional integrations

| Item | Status | Notes |
| --- | --- | --- |
| SMTP email | Optional | Leads are always stored; email needs provider credentials |
| Object storage | Optional | Falls back to local disk (`public/uploads`) |
| Cloudflare Turnstile | Optional | Honeypot + timing + rate limiting work without it |
| Analytics | Optional | Loads only after consent; no provider configured by default |
| WhatsApp button | Optional | Set `NEXT_PUBLIC_WHATSAPP_NUMBER` (digits only) |
| Business address | Unset by default | Add it in Admin → Settings once confirmed; nothing is shown until then |
| Gallery uploads | Manual | Project gallery images are added via the `ProjectImage` model (cover image + alt text are in the UI) |
| Rate limiting | Per-instance memory + DB | For multi-region deployments add a shared store (Redis/Upstash) |
| `PageView` model | Present, unused | Reserved for first-party analytics; enable with a privacy notice first |
| E2E suite | Requires a running server | Not wired into CI by default |

---

## Verified in this build

- `npm run build` completes; all routes compile and prerender
- `npm run typecheck` — no errors
- `npm test` — 46 tests passing (markdown sanitising, validation, anti-spam,
  CSV escaping, role hierarchy, SEO metadata, slug/format helpers)
- `npm run test:e2e` — form submission + validation, admin login (bad and good
  credentials), lead visibility, internal notes, status change, CSV authorisation,
  article publishing, media upload authorisation, settings save, logout
- axe-core (WCAG 2.1 AA + best practice) — 0 violations on Home, Services,
  Service detail, Work, Blog, Article, Contact, About, Privacy and admin login
- Keyboard: skip link is the first tab stop; the services dropdown opens with
  Enter and closes with Escape; accordions expose `aria-expanded`
- `prefers-reduced-motion` disables all reveal animations (nothing stays hidden)
- Sitemap, robots, canonicals, 404 status codes and `noindex` headers on `/admin`

## License

Proprietary — © Apronix Tech. All rights reserved.
