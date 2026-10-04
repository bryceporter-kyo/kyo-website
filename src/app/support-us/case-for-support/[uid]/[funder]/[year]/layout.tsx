import { Metadata } from 'next';
import { fetchGrantByTruncatedUidServer } from '@/lib/case-for-support-server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uid: string; funder: string; year: string }>;
}): Promise<Metadata> {
  let noIndex = true;
  let noFollow = false;
  let title = "Case for Support | Kawartha Youth Orchestra";
  let description = "Confidential funding proposal and case for support for Kawartha Youth Orchestra.";
  
  try {
    const resolvedParams = await params;
    const grant = await fetchGrantByTruncatedUidServer(resolvedParams.uid);
    if (grant) {
      if (grant.published) {
        noIndex = false;
      }
      if (grant.noIndex !== undefined && grant.noIndex !== null) {
        noIndex = grant.noIndex;
      }
      if (grant.noFollow !== undefined && grant.noFollow !== null) {
        noFollow = grant.noFollow;
      }

      title = `${grant.funderName} (${grant.grantCycleYear}) — Case for Support | KYO`;
      description = `Case for Support proposal for ${grant.funderName} requesting support for KYO's ${grant.programOfSupport || 'music education'} programs.`;
    }
  } catch (error) {
    console.error("Error fetching grant for metadata:", error);
  }

  const { uid, funder, year } = await params;

  return {
    title,
    description,
    robots: {
      index: !noIndex,
      follow: !noFollow,
    },
    openGraph: {
      title,
      description,
      url: `https://kyo.ca/support-us/case-for-support/${uid}/${funder}/${year}`,
      siteName: 'Kawartha Youth Orchestra',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://kyo.ca/support-us/case-for-support/${uid}/${funder}/${year}`,
    },
  };
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
