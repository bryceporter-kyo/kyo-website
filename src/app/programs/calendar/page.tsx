import { fetchCalendarEventsServer } from "@/lib/calendar-server";
import { fetchPageMetadataServer } from "@/lib/metadata-server";
import { CalendarEventsJsonLd } from "@/components/shared/JsonLd";
import CalendarClient from "./_components/CalendarClient";

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const [{ events, settings }, metadata] = await Promise.all([
    fetchCalendarEventsServer(),
    fetchPageMetadataServer('/programs/calendar'),
  ]);

  return (
    <>
      {/* Schema.org JSON-LD structured data for Google Rich Events Search */}
      <CalendarEventsJsonLd events={events} />

      {/* Crawlable Semantic Content for Search Engines & AI Crawlers */}
      <section className="sr-only" aria-label="Upcoming Kawartha Youth Orchestra Events & Concert Schedule">
        <h2>Kawartha Youth Orchestra Performance & Rehearsal Schedule</h2>
        {metadata?.aiSummary && <p>{metadata.aiSummary}</p>}
        <div>
          {events.map((event) => (
            <article key={event.id} itemScope itemType="https://schema.org/Event">
              <h3 itemProp="name">{event.name}</h3>
              <time itemProp="startDate" dateTime={`${event.date}${event.time ? `T${event.time}` : ''}`}>
                {event.date} {event.time ? `at ${event.time}` : ''} {event.endTime ? `until ${event.endTime}` : ''}
              </time>
              {event.location && (
                <div itemProp="location" itemScope itemType="https://schema.org/Place">
                  <span itemProp="name">{event.location}</span>
                </div>
              )}
              {event.notes && <p itemProp="description">{event.notes}</p>}
              <span itemProp="eventAttendanceMode" content="https://schema.org/OfflineEventAttendanceMode" />
              <span itemProp="eventStatus" content="https://schema.org/EventScheduled" />
            </article>
          ))}
        </div>
      </section>

      {/* Interactive UI Client Island */}
      <CalendarClient initialEvents={events} initialSettings={settings} />
    </>
  );
}
