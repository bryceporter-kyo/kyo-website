import nodemailer from 'nodemailer';
import { getTaxReceiptSettings, logTaxReceiptAudit } from './taxReceipts';
import {
  renderEmailTemplate,
  getFirstName,
  DEFAULT_DEDICATION_SUBJECT,
  DEFAULT_DEDICATION_MESSAGE,
  DEFAULT_THANK_YOU_SUBJECT,
  DEFAULT_THANK_YOU_MESSAGE,
} from './emailTemplates';

export {
  renderEmailTemplate,
  getFirstName,
  DEFAULT_DEDICATION_SUBJECT,
  DEFAULT_DEDICATION_MESSAGE,
  DEFAULT_THANK_YOU_SUBJECT,
  DEFAULT_THANK_YOU_MESSAGE,
};

export interface DedicationNotificationOptions {
  honoureeName: string;
  honoureeEmail: string;
  donorName: string;
  donorEmail?: string;
  amount?: number | string;
  date?: string;
  dedicationType?: 'honour' | 'memory' | 'celebrate' | 'general';
  dedicationMessage?: string;
  giftName: string;
}

export interface DonationThankYouOptions {
  donorName: string;
  donorEmail: string;
  amount: number | string;
  date?: string;
  projectName?: string;
  frequency?: string;
  hasTaxReceipt?: boolean;
}

export async function sendDedicationNotificationEmail(opts: DedicationNotificationOptions) {
  const { 
    honoureeName, honoureeEmail, donorName, donorEmail, amount, 
    date, dedicationType, dedicationMessage, giftName 
  } = opts;

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
      pass: pass.replace(/\s+/g, ''),
    },
  });

  const fromAddress = settings.dedicationSenderEmail || settings.senderEmail || user;
  const fromName = settings.dedicationSenderName || settings.senderName || 'Kawartha Youth Orchestra';
  const replyTo = settings.dedicationReplyToEmail || settings.replyToEmail || fromAddress;

  const typeLabelMap: Record<string, string> = {
    honour: 'in honour of',
    memory: 'in memory of',
    celebrate: 'in celebration of',
    general: 'dedicated to',
  };
  const typePhrase = typeLabelMap[dedicationType || 'honour'] || 'in honour of';

  const formattedDate = date || new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedAmount = amount ? (typeof amount === 'number' ? amount.toFixed(2) : amount) : '';

  const templateVars: Record<string, string> = {
    first_name: getFirstName(honoureeName),
    honouree_name: honoureeName,
    honouree_first_name: getFirstName(honoureeName),
    donor_name: donorName,
    donor_first_name: getFirstName(donorName),
    donor_email: donorEmail || '',
    amount: formattedAmount,
    date: formattedDate,
    gift_name: giftName,
    dedication_type: dedicationType || 'honour',
    dedication_type_phrase: typePhrase,
    message: dedicationMessage || '',
    message_section: dedicationMessage ? `Personal Message from ${donorName}:\n"${dedicationMessage}"` : '',
  };

  const subjectTemplate = settings.dedicationSubjectTemplate?.trim() || DEFAULT_DEDICATION_SUBJECT;
  const subject = renderEmailTemplate(subjectTemplate, templateVars);

  const bodyTemplate = settings.dedicationMessageTemplate?.trim() || DEFAULT_DEDICATION_MESSAGE;
  const plainTextBody = renderEmailTemplate(bodyTemplate, templateVars);

  // Styled HTML email card
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
        .custom-body { font-size: 15px; line-height: 1.7; color: #334155; white-space: pre-line; }
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
          <div class="plaque-box">
            <div class="plaque-title">✨ Inscribed Instrument Plaque</div>
            <div class="plaque-text">${giftName}</div>
            <div style="font-size: 13px; color: #854d0e; margin-top: 6px;">
              A physical brass dedication plaque inscribed for <strong>&quot;${honoureeName}&quot;</strong> will be permanently affixed to this instrument.
            </div>
          </div>

          <div class="custom-body">
            ${plainTextBody.replace(/\n/g, '<br>')}
          </div>
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
      text: plainTextBody,
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

/**
 * Send donation thank you email to the donor
 */
export async function sendDonationThankYouEmail(opts: DonationThankYouOptions) {
  const { donorName, donorEmail, amount, date, projectName, frequency, hasTaxReceipt } = opts;

  if (!donorEmail || !donorEmail.includes('@')) {
    return false;
  }

  const settings = await getTaxReceiptSettings();
  
  // If donor thank-you is explicitly disabled, skip
  if (settings.sendThankYouEmail === false) {
    return false;
  }

  const user = settings.googleAccountUser || settings.senderEmail || process.env.SMTP_USER;
  const pass = settings.gmailAppPassword || process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('[Thank You Email] Google account or app password not configured.');
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass.replace(/\s+/g, ''),
    },
  });

  const fromAddress = settings.thankYouSenderEmail || settings.senderEmail || user;
  const fromName = settings.thankYouSenderName || settings.senderName || 'Kawartha Youth Orchestra';
  const replyTo = settings.thankYouReplyToEmail || settings.replyToEmail || fromAddress;

  const formattedDate = date || new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedAmount = typeof amount === 'number' ? amount.toFixed(2) : amount;

  const templateVars: Record<string, string> = {
    first_name: getFirstName(donorName),
    donor_name: donorName,
    donor_first_name: getFirstName(donorName),
    donor_email: donorEmail,
    amount: formattedAmount,
    date: formattedDate,
    project_name: projectName || 'Kawartha Youth Orchestra Support',
    frequency: frequency || 'One-time',
  };

  const subjectTemplate = settings.thankYouSubjectTemplate?.trim() || DEFAULT_THANK_YOU_SUBJECT;
  const subject = renderEmailTemplate(subjectTemplate, templateVars);

  const bodyTemplate = settings.thankYouMessageTemplate?.trim() || DEFAULT_THANK_YOU_MESSAGE;
  const plainTextBody = renderEmailTemplate(bodyTemplate, templateVars);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
        .header { background: #065f46; color: #ffffff; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0 0 8px 0; font-size: 24px; font-weight: 700; }
        .header p { margin: 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 32px 28px; }
        .details-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 18px; margin: 20px 0; }
        .custom-body { font-size: 15px; line-height: 1.7; color: #334155; white-space: pre-line; }
        .footer { padding: 20px 28px 32px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Kawartha Youth Orchestra</h1>
          <p>Thank You For Your Generosity</p>
        </div>
        <div class="content">
          <div class="details-box">
            <div style="font-size: 12px; font-weight: 700; color: #047857; text-transform: uppercase; margin-bottom: 8px;">Donation Summary</div>
            <div style="font-size: 20px; font-weight: 800; color: #065f46;">$${formattedAmount} CAD</div>
            <div style="font-size: 13px; color: #065f46; margin-top: 4px;">${projectName || 'Kawartha Youth Orchestra Support'} • ${formattedDate}</div>
            ${hasTaxReceipt ? '<div style="margin-top: 8px; font-size: 12px; color: #047857;">📄 Official CRA Tax Receipt requested & logged</div>' : ''}
          </div>

          <div class="custom-body">
            ${plainTextBody.replace(/\n/g, '<br>')}
          </div>
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
      to: donorEmail,
      replyTo: replyTo,
      subject: subject,
      html: htmlContent,
      text: plainTextBody,
    });

    console.log('[Thank You Email] Sent successfully messageId:', info.messageId);
    await logTaxReceiptAudit({
      eventType: 'webhook_received',
      title: 'Donor Thank You Email Sent',
      description: `Sent thank you email to ${donorEmail} for donation of $${formattedAmount}.`,
      metadata: { donorEmail, donorName, amount: formattedAmount, messageId: info.messageId },
      status: 'success'
    });
    return true;
  } catch (err: any) {
    console.error('[Thank You Email] Failed to send email:', err);
    await logTaxReceiptAudit({
      eventType: 'webhook_received',
      title: 'Donor Thank You Email Failed',
      description: `Failed to deliver thank you email to ${donorEmail}: ${err.message}`,
      metadata: { donorEmail, donorName, error: err.message },
      status: 'error'
    });
    return false;
  }
}
