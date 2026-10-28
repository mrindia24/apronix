/**
 * Centralised, validated environment configuration.
 *
 * Nothing in here is ever imported into client components — secrets stay on the
 * server. Optional integrations degrade gracefully and are surfaced as
 * "not configured" instead of throwing at runtime.
 */

const isServer = typeof window === 'undefined';

function readString(key: string, fallback = ''): string {
  const value = process.env[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function readBool(key: string, fallback = false): boolean {
  const raw = readString(key);
  if (!raw) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(raw.toLowerCase());
}

/** Public values that are safe to ship to the browser. */
export const publicEnv = {
  siteUrl: readString('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000').replace(/\/$/, ''),
  siteName: readString('NEXT_PUBLIC_SITE_NAME', 'Apronix Tech'),
  whatsappNumber: readString('NEXT_PUBLIC_WHATSAPP_NUMBER'), // digits with country code, no +
  analyticsId: readString('NEXT_PUBLIC_ANALYTICS_ID'), // GA4 measurement id (consent gated)
  plausibleDomain: readString('NEXT_PUBLIC_PLAUSIBLE_DOMAIN'),
};

export const serverEnv = {
  databaseUrl: readString('DATABASE_URL'),
  authSecret: readString('AUTH_SECRET'),
  adminEmail: readString('ADMIN_EMAIL'),
  adminPassword: readString('ADMIN_PASSWORD'),
  adminName: readString('ADMIN_NAME', 'Apronix Admin'),

  // Email delivery (optional — leads are always persisted)
  smtpHost: readString('SMTP_HOST'),
  smtpPort: Number(readString('SMTP_PORT', '587')),
  smtpSecure: readBool('SMTP_SECURE', false),
  smtpUser: readString('SMTP_USER'),
  smtpPassword: readString('SMTP_PASSWORD'),
  mailFrom: readString('MAIL_FROM', 'Apronix Tech <no-reply@apronixtech.com>'),
  enquiryInbox: readString('ENQUIRY_INBOX_EMAIL'),

  // Object storage (optional — local disk is the dev fallback)
  s3Bucket: readString('S3_BUCKET'),
  s3Region: readString('S3_REGION', 'auto'),
  s3Endpoint: readString('S3_ENDPOINT'),
  s3AccessKeyId: readString('S3_ACCESS_KEY_ID'),
  s3SecretAccessKey: readString('S3_SECRET_ACCESS_KEY'),
  s3PublicBaseUrl: readString('S3_PUBLIC_BASE_URL'),

  // Agency contact details
  supportEmail: readString('SUPPORT_EMAIL', 'hello@apronixtech.com'),
  whatsappNumber: readString('WHATSAPP_NUMBER'),

  // Anti-spam
  turnstileSecret: readString('TURNSTILE_SECRET_KEY'),
  rateLimitPerHour: Number(readString('LEAD_RATE_LIMIT_PER_HOUR', '5')),

  nodeEnv: readString('NODE_ENV', 'development'),
};

export const isProd = serverEnv.nodeEnv === 'production';

/** Feature flags describing which optional integrations are ready to use. */
export const features = {
  email: Boolean(serverEnv.smtpHost && serverEnv.smtpUser && serverEnv.smtpPassword),
  objectStorage: Boolean(
    serverEnv.s3Bucket && serverEnv.s3AccessKeyId && serverEnv.s3SecretAccessKey,
  ),
  analytics: Boolean(publicEnv.analyticsId || publicEnv.plausibleDomain),
  whatsapp: Boolean(publicEnv.whatsappNumber || serverEnv.whatsappNumber),
  turnstile: Boolean(serverEnv.turnstileSecret),
};

/** Fail fast in production when a critical secret is missing. */
export function assertProductionConfig() {
  if (!isServer || !isProd) return;
  const missing: string[] = [];
  if (!serverEnv.databaseUrl) missing.push('DATABASE_URL');
  if (!serverEnv.authSecret || serverEnv.authSecret.length < 32) missing.push('AUTH_SECRET (32+ chars)');
  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
}

export function whatsappLink(message?: string): string | null {
  const raw = publicEnv.whatsappNumber || serverEnv.whatsappNumber;
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, '');
  if (digits.length < 8) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${text}`;
}
