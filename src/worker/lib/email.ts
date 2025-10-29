// Lightweight MailChannels email sender for Cloudflare Workers
// No API key required; use a verified sender on your domain

export interface SendEmailOptions {
  toEmail: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
}

// Best-effort send via MailChannels; return boolean for success
import type { Env } from "../../../worker-configuration";

export interface SendEmailResult {
  ok: boolean;
  status?: number;
  body?: string;
  provider: 'mailchannels';
  reason?: string;
}

export async function sendEmailViaMailChannels(env: Env, opts: SendEmailOptions): Promise<SendEmailResult> {
  const fromEmail = env.EMAIL_FROM;
  if (!fromEmail) {
    console.warn("EMAIL_FROM is not set. Skipping email send.");
    return { ok: false, provider: 'mailchannels', reason: 'missing_from' };
  }

  const payload = {
    personalizations: [
      {
        to: [
          {
            email: opts.toEmail,
            name: opts.toName || opts.toEmail,
          },
        ],
      },
    ],
    from: {
      email: fromEmail,
      name: "CuraNova",
    },
    subject: opts.subject,
    content: [
      { type: "text/plain", value: opts.text || stripHtml(opts.html) },
      { type: "text/html", value: opts.html },
    ],
  } as const;

  const res = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("MailChannels send failed", { status: res.status, body });
    return { ok: false, status: res.status, body, provider: 'mailchannels' };
  }
  return { ok: true, status: res.status, provider: 'mailchannels' };
}

function stripHtml(html: string): string {
  // Very small, naive HTML stripper for fallback text content
  return html.replace(/<\/(?:p|div)>/gi, "\n").replace(/<br\s*\/>/gi, "\n").replace(/<[^>]+>/g, "").trim();
}

export function buildRecordAddedEmail(siteUrl: string, patientName: string, mrn: string, visitDateIso: string, doctorName?: string) {
  const loginUrl = `${siteUrl.replace(/\/$/, "")}/login`;
  const visitDate = new Date(visitDateIso).toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit" });

  const subject = `New medical record added to your CuraNova profile`;
  const html = `
    <div style="font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111">
      <h2 style="margin:0 0 12px">Hello ${escapeHtml(patientName)},</h2>
      <p style="margin:0 0 8px">A new medical record has been added to your CuraNova profile.</p>
      <ul style="margin:12px 0 16px;padding-left:20px">
        <li><strong>MRN:</strong> ${escapeHtml(mrn)}</li>
        <li><strong>Visit date:</strong> ${escapeHtml(visitDate)}</li>
        ${doctorName ? `<li><strong>Doctor:</strong> ${escapeHtml(doctorName)}</li>` : ""}
      </ul>
      <p style="margin:0 0 16px">You can log in to view the details using your MRN and date of birth:</p>
      <p style="margin:0 0 20px">
        <a href="${loginUrl}" style="background:#0ea5e9;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;display:inline-block">Go to CuraNova</a>
      </p>
      <p style="margin:16px 0 0;font-size:13px;color:#555">If you didn’t expect this email, you can ignore it.</p>
    </div>
  `;
  const text = `Hello ${patientName},\n\nA new medical record has been added to your CuraNova profile.\n\nMRN: ${mrn}\nVisit date: ${visitDate}${doctorName ? `\nDoctor: ${doctorName}` : ""}\n\nLog in to view details: ${loginUrl}\n\nIf you didn’t expect this email, you can ignore it.`;

  return { subject, html, text };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
