import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import { features, serverEnv, publicEnv } from '@/src/lib/env';

/**
 * Email delivery. Every send is best-effort: the enquiry is already persisted in
 * the database before we try to email, and failures are recorded on the lead so
 * an admin can retry from the dashboard. Nothing here ever throws to the caller.
 */

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!features.email) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: serverEnv.smtpHost,
    port: serverEnv.smtpPort,
    secure: serverEnv.smtpSecure,
    auth: { user: serverEnv.smtpUser, pass: serverEnv.smtpPassword },
    requireTLS: !serverEnv.smtpSecure && serverEnv.smtpPort === 587,
  });
  return transporter;
}

export type SendResult = { ok: true; skipped?: boolean } | { ok: false; error: string };

export async function sendMail(message: MailMessage): Promise<SendResult> {
  const tx = getTransporter();
  if (!tx) {
    // Graceful development fallback: log the message instead of throwing.
    if (process.env.NODE_ENV !== 'production') {
      console.info('[email:disabled] would have sent:', message.subject, '→', message.to);
    }
    return { ok: true, skipped: true };
  }
  try {
    await tx.sendMail({ from: serverEnv.mailFrom, ...message });
    return { ok: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown email error';
    console.error('[email:failed]', msg);
    return { ok: false, error: msg };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f5f7;font-family:Manrope,Segoe UI,Arial,sans-serif;color:#101317">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6e8ec">
        <tr><td style="padding:22px 28px;background:#08090B;color:#ffffff">
          <span style="font-weight:800;letter-spacing:.14em;font-size:13px;color:#FF3038">APRONIX</span>
          <span style="font-weight:700;letter-spacing:.14em;font-size:13px;color:#ffffff">TECH</span>
          <div style="margin-top:6px;font-size:12px;color:#9aa1ad">Digital Experiences. Measurable Growth.</div>
        </td></tr>
        <tr><td style="padding:28px">
          <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3">${escapeHtml(title)}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:18px 28px;background:#f7f8fa;color:#6b7280;font-size:12px">
          Sent by the ${escapeHtml(publicEnv.siteName)} website${serverEnv.supportEmail ? ` · ${escapeHtml(serverEnv.supportEmail)}` : ''}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export type LeadEmailPayload = {
  reference: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string | null;
  service: string;
  budget?: string | null;
  timeline?: string | null;
  message: string;
  source: string;
  landingPage?: string | null;
};

function row(label: string, value: string) {
  return `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:150px;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 0;font-size:14px;color:#101317">${escapeHtml(value)}</td></tr>`;
}

/** Internal notification to the agency inbox. */
export async function sendEnquiryNotification(lead: LeadEmailPayload): Promise<SendResult> {
  if (!serverEnv.enquiryInbox) return { ok: true, skipped: true };

  const rows = [
    row('Reference', lead.reference),
    row('Name', lead.fullName),
    row('Email', lead.email),
    row('Phone', lead.phone),
    row('Company', lead.company || '—'),
    row('Service', lead.service),
    row('Budget', lead.budget || '—'),
    row('Timeline', lead.timeline || '—'),
    row('Source', lead.source),
    row('Landing page', lead.landingPage || '—'),
  ].join('');

  return sendMail({
    to: serverEnv.enquiryInbox,
    replyTo: lead.email,
    subject: `New enquiry ${lead.reference} — ${lead.service}`,
    text: [
      `New enquiry ${lead.reference}`,
      '',
      `Name: ${lead.fullName}`,
      `Email: ${lead.email}`,
      `Phone: ${lead.phone}`,
      `Company: ${lead.company || '—'}`,
      `Service: ${lead.service}`,
      `Budget: ${lead.budget || '—'}`,
      `Timeline: ${lead.timeline || '—'}`,
      '',
      'Message:',
      lead.message,
      '',
      `Source: ${lead.source} (${lead.landingPage || 'n/a'})`,
    ].join('\n'),
    html: shell(
      'New website enquiry',
      `<table role="presentation" width="100%">${rows}</table>
       <div style="margin-top:18px;padding:14px 16px;background:#f7f8fa;border-radius:10px;white-space:pre-wrap;font-size:14px;line-height:1.6">${escapeHtml(lead.message)}</div>
       <p style="margin-top:20px;font-size:13px"><a href="${escapeHtml(serverEnv.enquiryInbox ? `${publicEnv.siteUrl}/admin/leads` : '/admin/leads')}" style="color:#D51F27">Open the admin dashboard</a> to update the lead status.</p>`,
    ),
  });
}

/** Acknowledgement to the enquirer (only when email is configured). */
export async function sendEnquiryAcknowledgement(lead: LeadEmailPayload): Promise<SendResult> {
  return sendMail({
    to: lead.email,
    replyTo: serverEnv.supportEmail || undefined,
    subject: `We received your enquiry — ${publicEnv.siteName}`,
    text: `Hi ${lead.fullName},\n\nThanks for getting in touch with ${publicEnv.siteName}. We've received your enquiry about ${lead.service} and your reference is ${lead.reference}.\n\nA member of our team will review your details and reply within one business day. If anything changes in the meantime, just reply to this email.\n\n— The ${publicEnv.siteName} team\n${serverEnv.supportEmail}`,
    html: shell(
      `Thanks, ${lead.fullName} — we've got your message`,
      `<p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#374151">Thanks for getting in touch with ${escapeHtml(publicEnv.siteName)}. We've received your enquiry about <strong>${escapeHtml(lead.service)}</strong>.</p>
       <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#374151">Your reference is <strong>${escapeHtml(lead.reference)}</strong>. A member of our team will review the details and reply within one business day.</p>
       <p style="margin:0;font-size:14px;line-height:1.7;color:#374151">Need to add something? Simply reply to this email.</p>`,
    ),
  });
}

export async function sendTestEmail(to: string): Promise<SendResult> {
  return sendMail({
    to,
    subject: 'Apronix Tech — SMTP test',
    text: 'This is a test message confirming that email delivery is configured correctly.',
    html: shell('SMTP is working', '<p style="font-size:14px">This is a test message confirming that email delivery is configured correctly.</p>'),
  });
}
