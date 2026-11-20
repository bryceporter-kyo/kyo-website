import { Metadata } from 'next';
import { fetchGrantByTruncatedUidServer } from '@/lib/case-for-support-server';
import { getGrantPublicUrl } from '@/lib/grants/constants';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uid: string; slug: string[] }>;
}): Promise<Metadata> {
  let noIndex = true;
  let noFollow = false;
  let title = "Case for Support | Kawartha Youth Orchestra";
  let description = "Confidential funding proposal and case for support for Kawartha Youth Orchestra.";
  let canonical = "https://kyo.ca/support-us/case-for-support";
  
  try {
    const { uid } = await params;
    const grant = await fetchGrantByTruncatedUidServer(uid);
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

      const year = grant.grantCycleYear || new Date(grant.startedAt || grant.createdAt || Date.now()).getFullYear().toString();
      title = `${grant.funderName} (${year}) — Case for Support | KYO`;
      description = `Case for Support proposal for ${grant.funderName} requesting support for KYO's ${grant.programName || 'music education'} programs.`;
      canonical = `https://kyo.ca${getGrantPublicUrl(grant)}`;
    }
  } catch (error) {
    console.error("Error fetching grant for metadata:", error);
  }

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
      url: canonical,
      siteName: 'Kawartha Youth Orchestra',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical,
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
