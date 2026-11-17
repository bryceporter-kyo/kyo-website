/**
 * Client-safe email template utilities and defaults.
 * This file has NO Node.js / nodemailer imports so it can be safely imported
 * in client components (e.g. Next.js "use client" admin pages).
 */

export function renderEmailTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    const regex = new RegExp(`\\{${key}\\}`, 'gi');
    result = result.replace(regex, val || '');
  }
  return result;
}

export function getFirstName(fullName: string): string {
  const clean = (fullName || '').trim();
  if (!clean) return '';
  return clean.split(/\s+/)[0] || clean;
}

export const DEFAULT_DEDICATION_SUBJECT = 'A special musical gift has been dedicated {dedication_type_phrase} {honouree_name}';

export const DEFAULT_DEDICATION_MESSAGE = `Dear {honouree_name},

We are delighted to share that {donor_name} has made a generous gift to the Kawartha Youth Orchestra's Upbeat! Program {dedication_type_phrase} you:

✨ Inscribed Instrument: {gift_name}
A permanent brass dedication plaque inscribed for "{honouree_name}" will be affixed to this instrument.

{message_section}

Because of this wonderful gift, an eager young musician in Peterborough will receive a quality instrument, professional orchestral instruction, and wholesome rehearsal meals.

With warmest regards,
The Kawartha Youth Orchestra Team
https://thekyo.ca`;

export const DEFAULT_THANK_YOU_SUBJECT = 'Thank You for Your Generous Donation to Kawartha Youth Orchestra!';

export const DEFAULT_THANK_YOU_MESSAGE = `Dear {donor_first_name},

Thank you so much for your generous donation of ${'{amount}'} CAD to the Kawartha Youth Orchestra on {date}.

Your support directly empowers young musicians in our community to access high-quality music instruction, durable instruments, and life-changing ensemble experiences.

Contribution Details:
• Project: {project_name}
• Amount: ${'{amount}'} CAD
• Date: {date}
• Frequency: {frequency}

Every dollar helps bring the transformative power of orchestral music to youth throughout Peterborough and the Kawarthas.

With heartfelt gratitude,
The Kawartha Youth Orchestra
https://thekyo.ca`;
