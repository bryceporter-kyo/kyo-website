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

/**
 * Converts standard Markdown formatting to clean, email-safe HTML styling.
 * Handles:
 * - Headers (# H1, ## H2, ### H3)
 * - Bold (**text** or __text__)
 * - Italic (*text* or _text_)
 * - Strikethrough (~~text~~)
 * - Links ([text](url))
 * - Unordered lists (- or *)
 * - Ordered lists (1. 2.)
 * - Blockquotes (> quote)
 * - Inline code (`code`)
 * - Horizontal rules (--- or ***)
 * - Paragraph breaks
 */
export function markdownToEmailHtml(markdown: string): string {
  if (!markdown) return '';

  // Normalize line endings
  let text = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Escape raw HTML characters to prevent breaking layout
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Re-enable blockquotes after escaping
  const lines = text.split('\n');
  const processedLines: string[] = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Horizontal Rule
    if (/^\s*(&gt;\s*){0}([-*_]){3,}\s*$/.test(line)) {
      if (inUl) { processedLines.push('</ul>'); inUl = false; }
      if (inOl) { processedLines.push('</ol>'); inOl = false; }
      processedLines.push('<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">');
      continue;
    }

    // Headers
    if (/^### (.*$)/.test(line)) {
      if (inUl) { processedLines.push('</ul>'); inUl = false; }
      if (inOl) { processedLines.push('</ol>'); inOl = false; }
      const content = line.replace(/^### /, '');
      processedLines.push(`<h3 style="font-size:16px;font-weight:700;margin:18px 0 8px 0;color:#0f172a;">${content}</h3>`);
      continue;
    }
    if (/^## (.*$)/.test(line)) {
      if (inUl) { processedLines.push('</ul>'); inUl = false; }
      if (inOl) { processedLines.push('</ol>'); inOl = false; }
      const content = line.replace(/^## /, '');
      processedLines.push(`<h2 style="font-size:18px;font-weight:700;margin:20px 0 10px 0;color:#0f172a;">${content}</h2>`);
      continue;
    }
    if (/^# (.*$)/.test(line)) {
      if (inUl) { processedLines.push('</ul>'); inUl = false; }
      if (inOl) { processedLines.push('</ol>'); inOl = false; }
      const content = line.replace(/^# /, '');
      processedLines.push(`<h1 style="font-size:22px;font-weight:700;margin:24px 0 12px 0;color:#0f172a;">${content}</h1>`);
      continue;
    }

    // Blockquotes (starts with &gt;)
    if (/^&gt;\s*(.*$)/.test(line)) {
      if (inUl) { processedLines.push('</ul>'); inUl = false; }
      if (inOl) { processedLines.push('</ol>'); inOl = false; }
      const content = line.replace(/^&gt;\s*/, '');
      processedLines.push(`<blockquote style="border-left:4px solid #10b981;padding:8px 14px;margin:12px 0;background:#f0fdf4;color:#166534;font-style:italic;">${content}</blockquote>`);
      continue;
    }

    // Unordered List Items
    const ulMatch = line.match(/^\s*[-*•]\s+(.*)$/);
    if (ulMatch) {
      if (inOl) { processedLines.push('</ol>'); inOl = false; }
      if (!inUl) { processedLines.push('<ul style="margin:8px 0 12px 20px;padding:0;">'); inUl = true; }
      processedLines.push(`<li style="margin:4px 0;line-height:1.6;">${ulMatch[1]}</li>`);
      continue;
    }

    // Ordered List Items
    const olMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (inUl) { processedLines.push('</ul>'); inUl = false; }
      if (!inOl) { processedLines.push('<ol style="margin:8px 0 12px 20px;padding:0;">'); inOl = true; }
      processedLines.push(`<li style="margin:4px 0;line-height:1.6;">${olMatch[2]}</li>`);
      continue;
    }

    // Close open lists if regular line
    if (inUl) { processedLines.push('</ul>'); inUl = false; }
    if (inOl) { processedLines.push('</ol>'); inOl = false; }

    // Empty lines represent paragraph breaks
    if (line.trim() === '') {
      processedLines.push('<div style="height:12px;"></div>');
    } else {
      processedLines.push(`<p style="margin:6px 0;line-height:1.7;">${line}</p>`);
    }
  }

  if (inUl) processedLines.push('</ul>');
  if (inOl) processedLines.push('</ol>');

  let html = processedLines.join('\n');

  // Inline formats:
  // Bold: **text** or __text__
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:700;color:#0f172a;">$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong style="font-weight:700;color:#0f172a;">$1</strong>');

  // Italic: *text* or _text_
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Strikethrough: ~~text~~
  html = html.replace(/~~(.*?)~~/g, '<del style="color:#94a3b8;">$1</del>');

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:13px;font-family:monospace;color:#0f172a;">$1</code>');

  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#047857;text-decoration:underline;font-weight:500;">$1</a>');

  return html;
}

export const DEFAULT_DEDICATION_SUBJECT = 'A special musical gift has been dedicated {dedication_type_phrase} {honouree_name}';

export const DEFAULT_DEDICATION_MESSAGE = `Dear {honouree_name},

We are delighted to share that {donor_name} has made a generous gift to the Kawartha Youth Orchestra's Upbeat! Program {dedication_type_phrase} you:

✨ **Inscribed Instrument:** {gift_name}
A permanent brass dedication plaque inscribed for "**{honouree_name}**" will be affixed to this instrument.

{message_section}

Because of this wonderful gift, an eager young musician in Peterborough will receive a quality instrument, professional orchestral instruction, and wholesome rehearsal meals.

With warmest regards,  
**The Kawartha Youth Orchestra Team**  
[https://thekyo.ca](https://thekyo.ca)`;

export const DEFAULT_THANK_YOU_SUBJECT = 'Thank You for Your Generous Donation to Kawartha Youth Orchestra!';

export const DEFAULT_THANK_YOU_MESSAGE = `Dear {donor_first_name},

Thank you so much for your generous donation of **\${amount} CAD** to the Kawartha Youth Orchestra on {date}.

Your support directly empowers young musicians in our community to access high-quality music instruction, durable instruments, and life-changing ensemble experiences.

### Contribution Details:
- **Project:** {project_name}
- **Amount:** \${amount} CAD
- **Date:** {date}
- **Frequency:** {frequency}

Every dollar helps bring the transformative power of orchestral music to youth throughout Peterborough and the Kawarthas.

With heartfelt gratitude,  
**The Kawartha Youth Orchestra**  
[https://thekyo.ca](https://thekyo.ca)`;
