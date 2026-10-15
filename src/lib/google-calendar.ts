import { Event } from './events';
import { rrulestr } from 'rrule';

/**
 * Formats a Date object in America/Toronto timezone into "h:mm A" time string
 */
function formatTorontoTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Toronto',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Formats a Date object in America/Toronto timezone into "YYYY-MM-DD" date string
 */
function formatTorontoDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Parses time string from ICS format (e.g. 20260802T193000 or 193000)
 */
function parseIcalTime(timePart: string): { time?: string } {
  if (!timePart || timePart.length < 4) return {};
  
  const hours = parseInt(timePart.slice(0, 2), 10);
  const minutes = timePart.slice(2, 4);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return {
    time: `${displayHour}:${minutes} ${suffix}`
  };
}

/**
 * Extracts date (YYYY-MM-DD), time (h:mm A), and endTime (h:mm A) from DTSTART / DTEND strings.
 * Accurately converts UTC timestamps (ending in 'Z') to 'America/Toronto' local time.
 */
function parseDateAndTimes(dtstart?: string, dtend?: string): { date: string; time?: string; endTime?: string } {
  let date = '';
  let time: string | undefined = undefined;
  let endTime: string | undefined = undefined;

  if (dtstart) {
    if (dtstart.endsWith('Z') && dtstart.includes('T')) {
      const dPart = dtstart.split('T')[0];
      const tPart = dtstart.split('T')[1].replace('Z', '');
      if (dPart.length === 8 && tPart.length >= 4) {
        const y = parseInt(dPart.slice(0, 4), 10);
        const m = parseInt(dPart.slice(4, 6), 10) - 1;
        const d = parseInt(dPart.slice(6, 8), 10);
        const h = parseInt(tPart.slice(0, 2), 10);
        const min = parseInt(tPart.slice(2, 4), 10);
        const sec = tPart.length >= 6 ? parseInt(tPart.slice(4, 6), 10) : 0;
        const utcDate = new Date(Date.UTC(y, m, d, h, min, sec));

        date = formatTorontoDate(utcDate);
        time = formatTorontoTime(utcDate);
      }
    } else {
      const dPart = dtstart.split('T')[0];
      if (dPart.length === 8) {
        date = `${dPart.slice(0, 4)}-${dPart.slice(4, 6)}-${dPart.slice(6, 8)}`;
      }
      if (dtstart.includes('T')) {
        const parsed = parseIcalTime(dtstart.split('T')[1]);
        if (parsed.time) time = parsed.time;
      }
    }
  }

  if (dtend) {
    if (dtend.endsWith('Z') && dtend.includes('T')) {
      const dPart = dtend.split('T')[0];
      const tPart = dtend.split('T')[1].replace('Z', '');
      if (dPart.length === 8 && tPart.length >= 4) {
        const y = parseInt(dPart.slice(0, 4), 10);
        const m = parseInt(dPart.slice(4, 6), 10) - 1;
        const d = parseInt(dPart.slice(6, 8), 10);
        const h = parseInt(tPart.slice(0, 2), 10);
        const min = parseInt(tPart.slice(2, 4), 10);
        const sec = tPart.length >= 6 ? parseInt(tPart.slice(4, 6), 10) : 0;
        const utcDate = new Date(Date.UTC(y, m, d, h, min, sec));

        endTime = formatTorontoTime(utcDate);
      }
    } else if (dtend.includes('T')) {
      const parsed = parseIcalTime(dtend.split('T')[1]);
      if (parsed.time) endTime = parsed.time;
    }
  }

  return { date, time, endTime };
}

/**
 * Returns a friendly, informative fallback name when Google Calendar permissions
 * are set to 'free/busy' (summary is 'Busy' or empty).
 */
function getEventDisplayName(rawSummary?: string, type?: string): string {
  const clean = (rawSummary || '').trim();
  if (clean && clean.toLowerCase() !== 'busy') {
    return clean;
  }

  switch (type) {
    case 'upbeat':
      return 'Upbeat! Program Session';
    case 'lessons':
      return 'Lessons & Small Ensembles';
    case 'orchestras':
      return 'Orchestra Rehearsal';
    case 'special':
      return 'Special Event';
    default:
      return 'Scheduled Program Event';
  }
}

interface RawIcsEvent {
  uid?: string;
  summary?: string;
  location?: string;
  description?: string;
  dtstart?: string;
  dtend?: string;
  rrule?: string;
  recurrenceId?: string;
  exdates: string[];
}

/**
 * Parses raw iCalendar (ICS) string and expands recurring events (RRULE).
 */
export function parseICS(icsData: string, type: 'upbeat' | 'lessons' | 'orchestras' | string): Event[] {
  // Normalize line endings and handle folded lines (ICS lines wrap with a space or tab)
  const normalizedData = icsData.replace(/\r?\n[ \t]/g, '');
  const lines = normalizedData.split(/\r?\n/);
  
  const rawEvents: RawIcsEvent[] = [];
  let currentRaw: RawIcsEvent | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('BEGIN:VEVENT')) {
      currentRaw = { exdates: [] };
      continue;
    }

    if (line.startsWith('END:VEVENT')) {
      if (currentRaw) {
        rawEvents.push(currentRaw);
      }
      currentRaw = null;
      continue;
    }

    if (currentRaw) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const keyPart = line.substring(0, colonIndex);
      const value = line.substring(colonIndex + 1);

      // Clean up text escapes
      const cleanValue = value
        .replace(/\\,/g, ',')
        .replace(/\\;/g, ';')
        .replace(/\\n/g, '\n')
        .replace(/\\/g, '');

      // Check key (ignoring parameters like ;TZID=...)
      const mainKey = keyPart.split(';')[0].toUpperCase();

      switch (mainKey) {
        case 'UID':
          currentRaw.uid = cleanValue;
          break;
        case 'SUMMARY':
          currentRaw.summary = cleanValue;
          break;
        case 'LOCATION':
          currentRaw.location = cleanValue;
          break;
        case 'DESCRIPTION':
          currentRaw.description = cleanValue;
          break;
        case 'DTSTART':
          currentRaw.dtstart = cleanValue;
          break;
        case 'DTEND':
          currentRaw.dtend = cleanValue;
          break;
        case 'RRULE':
          currentRaw.rrule = cleanValue;
          break;
        case 'RECURRENCE-ID':
          currentRaw.recurrenceId = cleanValue;
          break;
        case 'EXDATE': {
          // EXDATE may contain multiple comma-separated dates
          const parts = cleanValue.split(',');
          for (const part of parts) {
            const datePart = part.trim().split('T')[0];
            if (datePart.length === 8) {
              currentRaw.exdates.push(`${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}`);
            }
          }
          break;
        }
      }
    }
  }

  const events: Event[] = [];
  const modifiedInstances = new Map<string, RawIcsEvent>(); // key: `${uid}_${date}`

  // Pass 1: Index modified single instances (overrides of recurring occurrences)
  for (const raw of rawEvents) {
    if (raw.recurrenceId && raw.uid) {
      const recDatePart = raw.recurrenceId.split('T')[0];
      if (recDatePart.length === 8) {
        const recDateStr = `${recDatePart.slice(0, 4)}-${recDatePart.slice(4, 6)}-${recDatePart.slice(6, 8)}`;
        modifiedInstances.set(`${raw.uid}_${recDateStr}`, raw);
      }
    }
  }

  // Pass 2: Process regular, recurring, and modified events
  for (const raw of rawEvents) {
    const displayName = getEventDisplayName(raw.summary, type);

    // 1. Modified recurring instance
    if (raw.recurrenceId) {
      const { date, time, endTime } = parseDateAndTimes(raw.dtstart, raw.dtend);
      if (date) {
        events.push({
          id: `${raw.uid || 'gcal'}-${date}`,
          date,
          name: displayName,
          location: raw.location,
          time,
          endTime,
          notes: raw.description,
          type,
        });
      }
      continue;
    }

    // 2. Recurring series (RRULE)
    if (raw.rrule && raw.dtstart) {
      const dPart = raw.dtstart.split('T')[0];
      if (dPart.length !== 8) continue;

      const year = parseInt(dPart.slice(0, 4), 10);
      const month = parseInt(dPart.slice(4, 6), 10) - 1;
      const day = parseInt(dPart.slice(6, 8), 10);

      let hours = 0;
      let minutes = 0;
      if (raw.dtstart.includes('T')) {
        const tPart = raw.dtstart.split('T')[1].replace('Z', '');
        if (tPart.length >= 4) {
          hours = parseInt(tPart.slice(0, 2), 10);
          minutes = parseInt(tPart.slice(2, 4), 10);
        }
      }

      const dtstartDate = new Date(Date.UTC(year, month, day, hours, minutes));
      const { time, endTime } = parseDateAndTimes(raw.dtstart, raw.dtend);
      const exdateSet = new Set(raw.exdates || []);

      try {
        let rruleText = raw.rrule;
        if (!rruleText.toUpperCase().startsWith('RRULE:')) {
          rruleText = 'RRULE:' + rruleText;
        }

        const rule = rrulestr(rruleText, { dtstart: dtstartDate });

        // Window: past 1 year to future 2 years
        const now = new Date();
        const windowStart = new Date(Date.UTC(now.getFullYear() - 1, 0, 1));
        const windowEnd = new Date(Date.UTC(now.getFullYear() + 2, 11, 31));

        const occurrences = rule.between(windowStart, windowEnd, true);

        for (const occ of occurrences) {
          // If raw.dtstart was UTC (ending with Z), convert the occurrence through America/Toronto
          let occDateStr = '';
          if (raw.dtstart.endsWith('Z')) {
            occDateStr = formatTorontoDate(occ);
          } else {
            const occYear = occ.getUTCFullYear();
            const occMonth = String(occ.getUTCMonth() + 1).padStart(2, '0');
            const occDay = String(occ.getUTCDate()).padStart(2, '0');
            occDateStr = `${occYear}-${occMonth}-${occDay}`;
          }

          // Skip excluded dates
          if (exdateSet.has(occDateStr)) continue;

          // Skip if overridden by a modified instance
          if (raw.uid && modifiedInstances.has(`${raw.uid}_${occDateStr}`)) continue;

          events.push({
            id: `${raw.uid || 'gcal'}-${occDateStr}`,
            date: occDateStr,
            name: displayName,
            location: raw.location,
            time,
            endTime,
            notes: raw.description,
            type,
          });
        }
      } catch (err) {
        console.error(`[Google Calendar] Error expanding RRULE for "${raw.summary}":`, err);
        // Fallback: emit the initial occurrence
        const { date } = parseDateAndTimes(raw.dtstart, raw.dtend);
        if (date) {
          events.push({
            id: raw.uid || `gcal-${date}`,
            date,
            name: displayName,
            location: raw.location,
            time,
            endTime,
            notes: raw.description,
            type,
          });
        }
      }
    } else {
      // 3. Single non-recurring event
      const { date, time, endTime } = parseDateAndTimes(raw.dtstart, raw.dtend);
      if (date) {
        events.push({
          id: raw.uid || `gcal-${date}`,
          date,
          name: displayName,
          location: raw.location,
          time,
          endTime,
          notes: raw.description,
          type,
        });
      }
    }
  }

  return events;
}

/**
 * Fetch calendar events from a public Google Calendar ID or ICS URL.
 */
export async function fetchGoogleCalendarEvents(calendarId: string, type: string): Promise<Event[]> {
  if (!calendarId || !calendarId.trim()) return [];
  
  try {
    const trimmed = calendarId.trim();
    let url: string;
    
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      url = trimmed;
    } else {
      // Decode in case it's already encoded, then cleanly encode
      const cleanId = decodeURIComponent(trimmed);
      url = `https://calendar.google.com/calendar/ical/${encodeURIComponent(cleanId)}/public/basic.ics`;
    }
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache feed for 5 minutes
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; KYO-Calendar-Sync/1.0)'
      }
    });

    if (!response.ok) {
      console.error(`[Google Calendar] Failed to fetch feed for ${type} (${response.status}): ${response.statusText}`);
      return [];
    }

    const icsText = await response.text();
    return parseICS(icsText, type);
  } catch (error) {
    console.error(`[Google Calendar] Fetch error for ${type}:`, error);
    return [];
  }
}
