import nodemailer from 'nodemailer';
import { getTaxReceiptSettings, logTaxReceiptAudit } from './taxReceipts';

export interface DedicationNotificationOptions {
  honoureeName: string;
  honoureeEmail: string;
  donorName: string;
  dedicationType?: 'honour' | 'memory' | 'celebrate' | 'general';
  dedicationMessage?: string;
  giftName: string;
}

export async function sendDedicationNotificationEmail(opts: DedicationNotificationOptions) {
  const { honoureeName, honoureeEmail, donorName, dedicationType, dedicationMessage, giftName } = opts;

  if (!honoureeEmail || !honoureeEmail.includes('@')) {
    console.warn('[Dedication Email] No valid recipient email provided:', honoureeEmail);
    return false;
  }

  const settings = await getTaxReceiptSettings();
  const user = settings.googleAccountUser || settings.senderEmail || process.env.SMTP_USER;
  const pass = settings.gmailAppPassword || process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('[Dedication Email] Google account or app password not configured in Tax Receipt settings.');
    await logTaxReceiptAudit({
      eventType: 'webhook_received',
      title: 'Dedication Email Skipped',
      description: `Could not send dedication notification to ${honoureeEmail}: Google account user or App Password not configured in Admin Settings.`,
      metadata: { honoureeEmail, honoureeName, donorName },
      status: 'warning'
    });
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass.replace(/\s+/g, ''), // Strip any spaces from the 16-char app password
    },
  });

  const fromAddress = settings.senderEmail || user;
  const fromName = settings.senderName || 'Kawartha Youth Orchestra';
  const replyTo = settings.replyToEmail || fromAddress;

  const typeLabelMap: Record<string, string> = {
    honour: 'in honour of',
    memory: 'in memory of',
    celebrate: 'in celebration of',
    general: 'dedicated to',
  };
  const typePhrase = typeLabelMap[dedicationType || 'honour'] || 'in honour of';

  const subject = `A special musical gift has been dedicated ${typePhrase} ${honoureeName}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
        .header { background: #134e4a; color: #ffffff; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0 0 8px 0; font-size: 24px; font-weight: 700; }
        .header p { margin: 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
        .message-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin: 24px 0; }
        .quote { font-style: italic; color: #166534; font-size: 15px; line-height: 1.6; }
        .plaque-box { background: #fefce8; border: 1px solid #fef08a; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center; }
        .plaque-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #854d0e; font-weight: 700; margin-bottom: 6px; }
        .plaque-text { font-size: 16px; font-weight: 700; color: #713f12; }
        .footer { padding: 20px 28px 32px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Kawartha Youth Orchestra</h1>
          <p>Upbeat! Strings Program</p>
        </div>
        <div class="content">
          <div class="greeting">Dear ${honoureeName},</div>
          <p style="line-height: 1.6; font-size: 15px;">
            We are delighted to share that <strong>${donorName}</strong> has made a generous gift to the Kawartha Youth Orchestra's Upbeat! Program ${typePhrase} you:
          </p>

          <div class="plaque-box">
            <div class="plaque-title">✨ Inscribed Instrument Plaque</div>
            <div class="plaque-text">${giftName}</div>
            <div style="font-size: 13px; color: #854d0e; margin-top: 6px;">
              A physical brass dedication plaque inscribed for <strong>&quot;${honoureeName}&quot;</strong> will be permanently affixed to this instrument.
            </div>
          </div>

          ${dedicationMessage ? `
            <div class="message-box">
              <div style="font-size: 12px; font-weight: 700; color: #15803d; text-transform: uppercase; margin-bottom: 6px;">Personal Note from ${donorName}:</div>
              <div class="quote">&ldquo;${dedicationMessage}&rdquo;</div>
            </div>
          ` : ''}

          <p style="line-height: 1.6; font-size: 14px; color: #475569;">
            Because of this wonderful dedication, a young musician in Peterborough will have access to an instrument, ensemble instruction, and wholesome nutrition this year.
          </p>
          <p style="line-height: 1.6; font-size: 14px; color: #475569; margin-top: 20px;">
            With heartfelt appreciation,<br>
            <strong>The Kawartha Youth Orchestra Team</strong><br>
            <a href="https://thekyo.ca" style="color: #0f766e; text-decoration: none;">thekyo.ca</a>
          </p>
        </div>
        <div class="footer">
          Kawartha Youth Orchestra is a registered Canadian charity (#860528189RR0001).
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: honoureeEmail,
      replyTo: replyTo,
      subject: subject,
      html: htmlContent,
      text: `Dear ${honoureeName},\n\nWe are pleased to let you know that ${donorName} has dedicated a gift (${giftName}) through the Kawartha Youth Orchestra's Upbeat! program ${typePhrase} you.\n\n${dedicationMessage ? `Message from ${donorName}:\n"${dedicationMessage}"\n\n` : ''}Thank you,\nKawartha Youth Orchestra\nhttps://thekyo.ca`
    });

    console.log('[Dedication Email] Sent successfully messageId:', info.messageId);
    await logTaxReceiptAudit({
      eventType: 'webhook_received',
      title: 'Dedication Email Card Sent',
      description: `Sent dedication email notification to ${honoureeEmail} for honouree ${honoureeName} (dedicated by ${donorName}).`,
      metadata: { honoureeEmail, honoureeName, donorName, giftName, messageId: info.messageId },
      status: 'success'
    });
    return true;
  } catch (err: any) {
    console.error('[Dedication Email] Failed to send email:', err);
    await logTaxReceiptAudit({
      eventType: 'webhook_received',
      title: 'Dedication Email Delivery Failed',
      description: `Failed to deliver dedication notification to ${honoureeEmail}: ${err.message}`,
      metadata: { honoureeEmail, honoureeName, donorName, error: err.message },
      status: 'error'
    });
    return false;
  }
}

