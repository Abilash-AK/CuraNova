// Simple MailChannels test script (Node 18+)
// Usage: node scripts/test-email.js <toEmail> [toName]

const toEmail = process.argv[2];
const toName = process.argv[3] || toEmail;
const fromEmail = process.env.EMAIL_FROM;
const siteUrl = process.env.SITE_URL || 'http://127.0.0.1:8787';

if (!toEmail) {
  console.error('Usage: node scripts/test-email.js <toEmail> [toName]');
  process.exit(1);
}
if (!fromEmail) {
  console.error('EMAIL_FROM is not set in environment');
  process.exit(2);
}

const loginUrl = siteUrl.replace(/\/$/, '') + '/login';
const subject = 'CuraNova test email – record added notification';
const html = `
  <div style="font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111">
    <h2 style="margin:0 0 12px">Hello ${escapeHtml(toName)},</h2>
    <p>This is a test email from CuraNova's MailChannels integration.</p>
    <p>You can log in here: <a href="${loginUrl}">${loginUrl}</a></p>
  </div>
`;
const text = `Hello ${toName},\n\nThis is a test email from CuraNova's MailChannels integration.\nLogin: ${loginUrl}\n`;

(async () => {
  const payload = {
    personalizations: [{ to: [{ email: toEmail, name: toName }] }],
    from: { email: fromEmail, name: 'CuraNova' },
    subject,
    content: [
      { type: 'text/plain', value: text },
      { type: 'text/html', value: html },
    ],
  };

  try {
    const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.text();
    console.log(JSON.stringify({ ok: res.ok, status: res.status, body }, null, 2));
  } catch (err) {
    console.error('Request failed:', err);
    process.exit(3);
  }
})();

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
