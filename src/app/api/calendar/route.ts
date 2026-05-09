import { NextResponse } from 'next/server';
import { fetchEventsFromFirebase } from '@/lib/events';
import { generateICS } from '@/lib/calendar-export';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch all events from Firebase
    const events = await fetchEventsFromFirebase();
    
    // Generate the universal ICS content
    const icsContent = generateICS(events);
    
    // Return the ICS file with the correct headers for calendar subscriptions
    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="kyo_events.ics"',
        // Ensure calendar clients don't cache the feed too aggressively
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
