import { Event } from './events';

/**
 * Formats a date for ICS (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Parses time string like "7:30 PM" to "HHMMSS"
 */
function parseTime(timeStr?: string): string {
  if (!timeStr) return "000000";
  
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return "000000";
  
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const ampm = match[3].toUpperCase();
  
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  
  return hours.toString().padStart(2, '0') + minutes.padStart(2, '0') + "00";
}

/**
 * Generates an iCalendar (.ics) string from an array of events
 */
export function generateICS(events: Event[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kawartha Youth Orchestra//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Kawartha Youth Orchestra Events',
    'X-WR-TIMEZONE:America/Toronto',
  ];

  events.forEach((event) => {
    const dateStr = event.date.replace(/-/g, '');
    const startTime = parseTime(event.time);
    const endTime = parseTime(event.endTime) || (event.time ? (parseInt(startTime.slice(0, 2)) + 1).toString().padStart(2, '0') + startTime.slice(2) : "235959");

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@kawarthayouthorchestra.org`);
    lines.push(`DTSTAMP:${formatICSDate(new Date())}`);
    lines.push(`DTSTART:${dateStr}T${startTime}`);
    lines.push(`DTEND:${dateStr}T${endTime}`);
    lines.push(`SUMMARY:${event.name}`);
    if (event.location) lines.push(`LOCATION:${event.location.replace(/,/g, '\\,')}`);
    if (event.notes) lines.push(`DESCRIPTION:${event.notes.replace(/\n/g, '\\n')}`);
    if (event.link) lines.push(`URL:https://kawarthayouthorchestra.org${event.link}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Triggers a download of the .ics file
 */
export function downloadCalendar(events: Event[]) {
  const icsContent = generateICS(events);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'kyo_events.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
