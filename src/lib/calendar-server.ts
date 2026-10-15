import { fetchGoogleCalendarEvents } from './google-calendar';
import { Event, getEvents } from './events';
import { CalendarSettings } from './calendar-settings';

/**
 * Fetch calendar settings from Firestore REST API (Server Component safe)
 */
export async function fetchCalendarSettingsServer(): Promise<CalendarSettings> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    return { upbeatCalendarId: '', lessonsCalendarId: '', orchestrasCalendarId: '' };
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents/settings/calendar`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }, // 5 min cache
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return { upbeatCalendarId: '', lessonsCalendarId: '', orchestrasCalendarId: '' };
    }

    const data = await res.json();
    if (!data.fields) {
      return { upbeatCalendarId: '', lessonsCalendarId: '', orchestrasCalendarId: '' };
    }

    return {
      upbeatCalendarId: data.fields.upbeatCalendarId?.stringValue || '',
      lessonsCalendarId: data.fields.lessonsCalendarId?.stringValue || '',
      orchestrasCalendarId: data.fields.orchestrasCalendarId?.stringValue || '',
    };
  } catch (error) {
    console.error('[CalendarSettingsServer] Error fetching settings:', error);
    return { upbeatCalendarId: '', lessonsCalendarId: '', orchestrasCalendarId: '' };
  }
}

/**
 * Fetch events directly from Firestore REST API (fallback if Google Calendar not used)
 */
export async function fetchEventsFromFirestoreRest(): Promise<Event[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return getEvents();

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents/events`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) return getEvents();

    const data = await res.json();
    if (!data.documents || data.documents.length === 0) return getEvents();

    return data.documents.map((doc: any) => {
      const id = doc.name.split('/').pop() || "";
      const fields = doc.fields || {};
      return {
        id,
        date: fields.date?.stringValue || "",
        name: fields.name?.stringValue || "",
        location: fields.location?.stringValue,
        time: fields.time?.stringValue,
        endTime: fields.endTime?.stringValue,
        notes: fields.notes?.stringValue,
        link: fields.link?.stringValue,
        type: fields.type?.stringValue || "normal",
      } as Event;
    });
  } catch (error) {
    console.error('[EventsServer] Error fetching events from REST:', error);
    return getEvents();
  }
}

/**
 * Comprehensive Server-Side Calendar Events Fetcher
 * Used by Server Components and metadata generators to populate Schema.org JSON-LD and initial client state.
 */
export async function fetchCalendarEventsServer(): Promise<{ events: Event[]; settings: CalendarSettings }> {
  try {
    const settings = await fetchCalendarSettingsServer();

    const hasGoogleCalendars =
      Boolean(settings.upbeatCalendarId?.trim()) ||
      Boolean(settings.lessonsCalendarId?.trim()) ||
      Boolean(settings.orchestrasCalendarId?.trim());

    // 1. Fetch Google Calendar events if configured
    const gcalPromises: Promise<Event[]>[] = [];
    if (settings.upbeatCalendarId?.trim()) {
      gcalPromises.push(fetchGoogleCalendarEvents(settings.upbeatCalendarId.trim(), 'upbeat'));
    }
    if (settings.lessonsCalendarId?.trim()) {
      gcalPromises.push(fetchGoogleCalendarEvents(settings.lessonsCalendarId.trim(), 'lessons'));
    }
    if (settings.orchestrasCalendarId?.trim()) {
      gcalPromises.push(fetchGoogleCalendarEvents(settings.orchestrasCalendarId.trim(), 'orchestras'));
    }

    // 2. Fetch Firestore events (which include Special events and admin-created events)
    const [gcalResults, firestoreEvents] = await Promise.all([
      Promise.all(gcalPromises),
      fetchEventsFromFirestoreRest(),
    ]);

    const gcalEvents = gcalResults.flat();

    // If Google Calendars are active, merge their events with non-empty Firestore events
    // (specifically retaining all 'special' events and any custom events not covered by GCal)
    let eventsData: Event[] = [];
    if (gcalEvents.length > 0) {
      // Include all GCal events
      eventsData = [...gcalEvents];

      // Merge in Firestore events (always include 'special' events and events with types not provided by GCal)
      const gcalTypes = new Set(gcalEvents.map(e => e.type));
      for (const fe of firestoreEvents) {
        if (fe.type === 'special' || !gcalTypes.has(fe.type)) {
          // Avoid duplicate IDs
          if (!eventsData.some(e => e.id === fe.id)) {
            eventsData.push(fe);
          }
        }
      }
    } else {
      eventsData = firestoreEvents;
    }

    // Sort events by date ascending
    eventsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { events: eventsData, settings };
  } catch (error) {
    console.error('[CalendarServer] Error loading events:', error);
    return { events: getEvents(), settings: { upbeatCalendarId: '', lessonsCalendarId: '', orchestrasCalendarId: '' } };
  }
}
