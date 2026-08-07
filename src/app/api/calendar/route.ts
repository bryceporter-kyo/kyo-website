import { NextRequest, NextResponse } from 'next/server';
import { fetchEventsFromFirebase, Event } from '@/lib/events';
import { generateICS } from '@/lib/calendar-export';
import { fetchCalendarSettings } from '@/lib/calendar-settings';
import { fetchGoogleCalendarEvents } from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const feed = searchParams.get('feed') || 'all';

    // Load calendar configurations from settings
    const settings = await fetchCalendarSettings();
    
    let events: Event[] = [];

    // Check if any Google Calendars are configured
    const hasGoogleCalendars = 
      !!settings.upbeatCalendarId || 
      !!settings.lessonsCalendarId || 
      !!settings.orchestrasCalendarId;

    if (hasGoogleCalendars) {
      const promises: Promise<Event[]>[] = [];

      if (feed === 'all' || feed === 'upbeat') {
        if (settings.upbeatCalendarId) {
          promises.push(fetchGoogleCalendarEvents(settings.upbeatCalendarId, 'upbeat'));
        }
      }
      if (feed === 'all' || feed === 'lessons') {
        if (settings.lessonsCalendarId) {
          promises.push(fetchGoogleCalendarEvents(settings.lessonsCalendarId, 'lessons'));
        }
      }
      if (feed === 'all' || feed === 'orchestras') {
        if (settings.orchestrasCalendarId) {
          promises.push(fetchGoogleCalendarEvents(settings.orchestrasCalendarId, 'orchestras'));
        }
      }

      const results = await Promise.all(promises);
      events = results.flat();
    } else {
      // Fallback to standard Firebase database events
      events = await fetchEventsFromFirebase();
      if (feed !== 'all') {
        events = events.filter(e => e.type === feed);
      }
    }

    // Sort events by date ascending
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Generate the universal ICS content
    const icsContent = generateICS(events);
    
    // Return the ICS file with the correct headers for calendar subscriptions
    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="kyo_${feed}_events.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('[Calendar API] Error generating feed:', error);
    return new NextResponse('Error generating calendar feed', { status: 500 });
  }
}
