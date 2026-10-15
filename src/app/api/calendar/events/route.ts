import { NextResponse } from 'next/server';
import { fetchCalendarSettings } from '@/lib/calendar-settings';
import { fetchGoogleCalendarEvents } from '@/lib/google-calendar';
import { fetchEventsFromFirebase, Event } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await fetchCalendarSettings();

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
      fetchEventsFromFirebase(),
    ]);

    const gcalEvents = gcalResults.flat();

    // Merge events
    let eventsData: Event[] = [];
    if (gcalEvents.length > 0) {
      eventsData = [...gcalEvents];
      const gcalTypes = new Set(gcalEvents.map(e => e.type));
      for (const fe of firestoreEvents) {
        if (fe.type === 'special' || !gcalTypes.has(fe.type)) {
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

    return NextResponse.json({ events: eventsData, settings });
  } catch (error) {
    console.error('[Calendar Events API] Error:', error);
    return NextResponse.json({ error: 'Failed to load events' }, { status: 500 });
  }
}
