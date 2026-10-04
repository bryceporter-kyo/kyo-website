import { Metadata } from 'next';
import { fetchGrantByTruncatedUid } from '@/lib/case-for-support';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uid: string; funder: string; year: string }>;
}): Promise<Metadata> {
  let noIndex = true; // default true as requested
  let noFollow = false; // default false as requested
  
  try {
    const resolvedParams = await params;
    const grant = await fetchGrantByTruncatedUid(resolvedParams.uid);
    if (grant) {
      // If the database has a specific override, use it. Otherwise rely on the defaults.
      if (grant.noIndex !== undefined && grant.noIndex !== null) {
        noIndex = grant.noIndex;
      }
      if (grant.noFollow !== undefined && grant.noFollow !== null) {
        noFollow = grant.noFollow;
      }
    }
  } catch (error) {
    console.error("Error fetching grant for metadata:", error);
  }

  return {
    robots: {
      index: !noIndex,
      follow: !noFollow,
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
