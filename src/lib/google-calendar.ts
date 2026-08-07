import { Event } from './events';

/**
 * Parses time string from ICS format (e.g. 20260802T193000)
 */
function parseIcalTime(timePart: string): { time?: string; endTime?: string } {
  if (!timePart || timePart.length < 4) return {};
  
  const parseSingleTime = (t: string) => {
    const hours = parseInt(t.slice(0, 2));
    const minutes = t.slice(2, 4);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes} ${suffix}`;
  };

  return {
    time: parseSingleTime(timePart.slice(0, 4))
  };
}

/**
 * Parses raw iCalendar (ICS) string into Event models.
 */
export function parseICS(icsData: string, type: 'upbeat' | 'lessons' | 'orchestras' | string): Event[] {
  const events: Event[] = [];
  
  // Normalize line endings and handle folded lines (ICS lines wrap after 75 octets with a space or tab)
  const normalizedData = icsData.replace(/\r?\n[ \t]/g, '');
  const lines = normalizedData.split(/\r?\n/);
  
  let currentEvent: Partial<Event> = {};
  let inEvent = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = { type };
      inEvent = true;
      continue;
    }

    if (line.startsWith('END:VEVENT')) {
      if (inEvent && currentEvent.date && currentEvent.name) {
        // Ensure ID is defined
        if (!currentEvent.id) {
          currentEvent.id = `gcal-${Math.random().toString(36).substr(2, 9)}`;
        }
        events.push(currentEvent as Event);
      }
      currentEvent = {};
      inEvent = false;
      continue;
    }

    if (inEvent) {
      // Find key and value separated by colon
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
      const mainKey = keyPart.split(';')[0];

      switch (mainKey) {
        case 'UID':
          currentEvent.id = cleanValue;
          break;
        case 'SUMMARY':
          currentEvent.name = cleanValue;
          break;
        case 'LOCATION':
          currentEvent.location = cleanValue;
          break;
        case 'DESCRIPTION':
          currentEvent.notes = cleanValue;
          break;
        case 'DTSTART': {
          const datePart = cleanValue.split('T')[0];
          if (datePart && datePart.length === 8) {
            currentEvent.date = `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}`;
          }
          if (cleanValue.includes('T')) {
            const timePart = cleanValue.split('T')[1];
            const parsed = parseIcalTime(timePart);
            if (parsed.time) currentEvent.time = parsed.time;
          }
          break;
        }
        case 'DTEND': {
          if (cleanValue.includes('T')) {
            const timePart = cleanValue.split('T')[1];
            const parsed = parseIcalTime(timePart);
            if (parsed.time) currentEvent.endTime = parsed.time;
          }
          break;
        }
      }
    }
  }

  return events;
}

/**
 * Fetch calendar events from a public Google Calendar ID.
 */
export async function fetchGoogleCalendarEvents(calendarId: string, type: string): Promise<Event[]> {
  if (!calendarId) return [];
  
  try {
    const encodedId = encodeURIComponent(calendarId);
    const url = `https://calendar.google.com/calendar/ical/${encodedId}/public/basic.ics`;
    
    const response = await fetch(url, {
      next: { revalidate: 300 } // Cache feed for 5 minutes
    });

    if (!response.ok) {
      console.error(`[Google Calendar] Failed to fetch feed for ${type}: ${response.statusText}`);
      return [];
    }

    const icsText = await response.text();
    return parseICS(icsText, type);
  } catch (error) {
    console.error(`[Google Calendar] Fetch error for ${type}:`, error);
    return [];
  }
}
