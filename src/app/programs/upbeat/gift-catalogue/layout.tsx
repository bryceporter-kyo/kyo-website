import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upbeat! Holiday Gift Catalogue | Kawartha Youth Orchestra',
  description:
    'Give the gift of music this holiday season. Support barrier-free music education for Peterborough youth through instruments, student bows, repairs, lessons, and snacks.',
  alternates: {
    canonical: 'https://kyo.ca/programs/upbeat/gift-catalogue',
  },
  openGraph: {
    title: 'Upbeat! Holiday Gift Catalogue | Kawartha Youth Orchestra',
    description:
      'Give the gift of music this holiday season. Support barrier-free music education for Peterborough youth through instruments, student bows, repairs, lessons, and snacks.',
    url: 'https://kyo.ca/programs/upbeat/gift-catalogue',
    siteName: 'Kawartha Youth Orchestra',
    locale: 'en_CA',
    type: 'website',
  },
};

export default function GiftCatalogueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
