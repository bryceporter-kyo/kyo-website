import React from 'react';
import { Event } from '@/lib/events';

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['EducationalOrganization', 'MusicGroup', 'NGO'],
    '@id': 'https://kyo.ca/#organization',
    name: 'Kawartha Youth Orchestra',
    legalName: 'Kawartha Youth Orchestra Inc.',
    alternateName: 'KYO',
    url: 'https://kyo.ca',
    logo: {
      '@type': 'ImageObject',
      url: 'https://kyo.ca/logo.png',
      width: 512,
      height: 512,
    },
    image: 'https://kyo.ca/og-default.jpg',
    description: 'Kawartha Youth Orchestra nurtures the next generation of musicians in Peterborough and the Kawarthas through orchestral training ensembles, the subsidized Upbeat! after-school program, and conservatory-level private music lessons.',
    foundingDate: '2002-09-02',
    nonprofitStatus: 'https://schema.org/Nonprofit501c3', // Standard Schema representation for registered non-profit / charitable entity
    taxID: '861783844RR0001',
    knowsAbout: [
      'Orchestral Music Education',
      'Youth Ensemble Training',
      'El Sistema Music Instruction',
      'Classical Violin, Cello, and Winds Training',
      'Community Music Bursaries'
    ],
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
      'https://www.youtube.com/@kawarthayouthorchestra',
      'https://apps.cra-arc.gc.ca/ebci/hacc/srch/pub/dsplyBscSrch?request_locale=en'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Executive Office & Inquiries',
      email: 'contactus@thekyo.ca',
      telephone: '+1-705-410-4025',
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

export function EducationalProgramJsonLd({
  name,
  description,
  url,
  programType,
}: {
  name: string;
  description: string;
  url: string;
  programType?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name,
    description,
    url,
    programType: programType || 'Youth Music Education',
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Kawartha Youth Orchestra',
      url: 'https://kyo.ca',
    },
    educationalCredentialAwarded: 'Orchestral Musicianship & Performance Certificate',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CAD',
      category: 'Tuition Subsidized or Free',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function CaseForSupportIndexJsonLd({
  grants,
}: {
  grants?: { uid: string; funder: string; year: string; name: string }[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Kawartha Youth Orchestra — Case for Support & Institutional Giving',
    description: 'Institutional case for support, governance, and transparent funding proposals for grantmakers and community partners.',
    url: 'https://kyo.ca/support-us/case-for-support',
    about: {
      '@type': 'EducationalOrganization',
      name: 'Kawartha Youth Orchestra',
      url: 'https://kyo.ca',
    },
    hasPart: grants?.map((g) => ({
      '@type': 'DigitalDocument',
      name: g.name,
      url: `https://kyo.ca/support-us/case-for-support/${g.uid}/${g.funder}/${g.year}`,
    })) || [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
  amountRequested,
  programArea,
}: {
  title: string;
  funderName: string;
  year: string;
  summary?: string;
  url: string;
  datePublished?: string;
  amountRequested?: number | string;
  programArea?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'DigitalDocument',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline: title,
    name: title,
    description: summary || `Case for Support grant documentation for ${funderName} (${year}) by Kawartha Youth Orchestra.`,
    author: {
      '@type': ['EducationalOrganization', 'NGO'],
      name: 'Kawartha Youth Orchestra',
      legalName: 'Kawartha Youth Orchestra Inc.',
      url: 'https://kyo.ca',
    },
    publisher: {
      '@type': 'EducationalOrganization',
      name: 'Kawartha Youth Orchestra',
      logo: {
        '@type': 'ImageObject',
        url: 'https://kyo.ca/logo.png',
      },
    },
    about: {
      '@type': 'Thing',
      name: programArea || 'Youth Music Education & Accessibility',
    },
    sponsor: {
      '@type': 'Organization',
      name: funderName,
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

export function CalendarEventsJsonLd({ events }: { events: Event[] }) {
  if (!events || events.length === 0) return null;

  const items = events.map((e) => {
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
      performer: { '@type': 'MusicGroup', name: 'Kawartha Youth Orchestra' },
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

function parseTimeIntoISO(dateStr: string, timeStr: string): string | null {
  try {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    const formattedHours = String(hours).padStart(2, '0');
    return `${dateStr}T${formattedHours}:${minutes}:00`;
  } catch {
    return null;
  }
}
