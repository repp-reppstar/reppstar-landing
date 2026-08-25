import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Update this once you've verified a sending domain in Resend.
// Until then, Resend's shared "onboarding@resend.dev" address can only
// deliver to the email you signed up to Resend with — see README.md.
const FROM_ADDRESS = process.env.RESEND_FROM || 'Reppstar Technologies <onboarding@resend.dev>';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "You're on the list — Reppstar Technologies",
      html: confirmationHtml(email),
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ error: 'Could not send confirmation email. Please try again shortly.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Unexpected error sending confirmation:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

function confirmationHtml(email) {
  return `
  <div style="background:#05080a;padding:40px 24px;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#0a0f0c;border:1px solid rgba(51,255,119,0.25);border-radius:16px;padding:36px 32px;">
      <p style="margin:0 0 24px;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#33ff77;font-weight:600;">
        Reppstar Technologies
      </p>
      <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#e9f3ee;">
        You're on the list.
      </h1>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#8ba397;">
        Thanks for signing up with <span style="color:#e9f3ee;">${escapeHtml(email)}</span>.
        We'll email you the moment Reppstar Technologies opens the doors.
      </p>
      <p style="margin:28px 0 0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#4d6157;">
        R&amp;D Status: Awaiting Deployment
      </p>
    </div>
  </div>`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
