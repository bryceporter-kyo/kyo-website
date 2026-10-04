import React from 'react';
import { Event } from '@/lib/events';

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    '@id': 'https://kyo.ca/#organization',
    name: 'Kawartha Youth Orchestra',
    alternateName: 'KYO',
    url: 'https://kyo.ca',
    logo: 'https://kyo.ca/logo.png',
    description: 'Kawartha Youth Orchestra nurtures the next generation of musicians in the Peterborough and Kawartha region through orchestral training ensembles, the subsidized Upbeat! after-school program, and private music lessons.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Peterborough',
      addressRegion: 'ON',
      addressCountry: 'CA',
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Kawarthas and Peterborough Region, Ontario',
    },
    sameAs: [
      'https://www.facebook.com/KawarthaYouthOrchestra',
      'https://www.instagram.com/kawarthayouthorchestra',
      'https://www.youtube.com/@kawarthayouthorchestra'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'info@kyo.ca',
      availableLanguage: ['English']
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function CalendarEventsJsonLd({ events }: { events: Event[] }) {
  if (!events || events.length === 0) return null;

  // Format events to Schema.org Event structure
  const items = events.map((e) => {
    // Determine start date and time
    let startDate = e.date;
    if (e.time) {
      const parsedTime = parseTimeIntoISO(e.date, e.time);
      if (parsedTime) startDate = parsedTime;
    }

    let endDate: string | undefined;
    if (e.endTime) {
      const parsedEndTime = parseTimeIntoISO(e.date, e.endTime);
      if (parsedEndTime) endDate = parsedEndTime;
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: e.name,
      description: e.notes || `${e.name} with Kawartha Youth Orchestra (${e.type || 'Program Event'})`,
      startDate,
      ...(endDate ? { endDate } : {}),
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: e.location || 'Peterborough, ON',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Peterborough',
          addressRegion: 'ON',
          addressCountry: 'CA',
        },
      },
      organizer: {
        '@type': 'Organization',
        name: 'Kawartha Youth Orchestra',
        url: 'https://kyo.ca',
      },
      performer: {
        '@type': 'MusicGroup',
        name: 'Kawartha Youth Orchestra',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'CAD',
        availability: 'https://schema.org/InStock',
        url: 'https://kyo.ca/programs/calendar',
      },
    };
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(items) }}
    />
  );
}

export function GrantDocumentJsonLd({
  title,
  funderName,
  year,
  summary,
  url,
  datePublished,
}: {
  title: string;
  funderName: string;
  year: string;
  summary?: string;
  url: string;
  datePublished?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline: title,
    description: summary || `Case for Support grant documentation for ${funderName} (${year}) by Kawartha Youth Orchestra.`,
    author: {
      '@type': 'Organization',
      name: 'Kawartha Youth Orchestra',
      url: 'https://kyo.ca',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kawartha Youth Orchestra',
      logo: {
        '@type': 'ImageObject',
        url: 'https://kyo.ca/logo.png',
      },
    },
    datePublished: datePublished || `${year}-01-01`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function parseTimeIntoISO(dateStr: string, timeStr: string): string | null {
  try {
    // Expected format: "6:30 PM" or "10:00 AM" or "14:00"
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const meridiem = match[3]?.toUpperCase();

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    const formattedHours = String(hours).padStart(2, '0');
    // Peterborough is in Eastern Time (America/Toronto, UTC-4 in daylight savings / UTC-5 in winter)
    // We can output full ISO with date
    return `${dateStr}T${formattedHours}:${minutes}:00`;
  } catch {
    return null;
  }
}
