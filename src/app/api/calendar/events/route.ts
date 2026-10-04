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

    let eventsData: Event[] = [];

    if (hasGoogleCalendars) {
      const promises: Promise<Event[]>[] = [];
      if (settings.upbeatCalendarId?.trim()) {
        promises.push(fetchGoogleCalendarEvents(settings.upbeatCalendarId.trim(), 'upbeat'));
      }
      if (settings.lessonsCalendarId?.trim()) {
        promises.push(fetchGoogleCalendarEvents(settings.lessonsCalendarId.trim(), 'lessons'));
      }
      if (settings.orchestrasCalendarId?.trim()) {
        promises.push(fetchGoogleCalendarEvents(settings.orchestrasCalendarId.trim(), 'orchestras'));
      }
      const results = await Promise.all(promises);
      eventsData = results.flat();
    } else {
      eventsData = await fetchEventsFromFirebase();
    }

    // Sort events by date ascending
    eventsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ events: eventsData, settings });
  } catch (error) {
    console.error('[Calendar Events API] Error:', error);
    return NextResponse.json({ error: 'Failed to load events' }, { status: 500 });
  }
}
