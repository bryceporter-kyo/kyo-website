import { fetchPageMetadataServer } from '@/lib/metadata-server';
import { 
  fetchPublishedGrantsServer,
  fetchBoardMembersServer,
  fetchGovernanceDocumentsServer 
} from '@/lib/case-for-support-server';
import { getGrantPublicUrl } from '@/lib/grants/constants';
import { CaseForSupportIndexJsonLd } from '@/components/shared/JsonLd';
import CaseForSupportIndexClient from './_components/CaseForSupportIndexClient';
import Link from 'next/link';

// Revalidate daily as a fallback; updated instantly on demand via /api/revalidate
export const revalidate = 86400;

export default async function CaseForSupportPage() {
  const [metadata, publishedGrants, board, documents] = await Promise.all([
    fetchPageMetadataServer('/support-us/case-for-support'),
    fetchPublishedGrantsServer(),
    fetchBoardMembersServer(),
    fetchGovernanceDocumentsServer(),
  ]);

  const grantParts = publishedGrants.map((g) => {
    const uid = g.id ? g.id.substring(0, 6) : 'grant';
    const funder = (g.slug || g.funderName || 'funder')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const year = g.grantCycleYear || new Date(g.startedAt || g.createdAt || Date.now()).getFullYear().toString();
    return {
      uid,
      funder,
      year,
      name: `${g.funderName} (${year}) — ${g.programName || 'Case for Support'}`,
    };
  });

  return (
    <>
      {/* Schema.org CollectionPage Structured Data */}
      <CaseForSupportIndexJsonLd grants={grantParts} />

      {/* Crawlable Semantic Content for Search Engines & AI Crawlers */}
      <section className="sr-only" aria-label="Kawartha Youth Orchestra Case for Support Overview">
        <h1>Kawartha Youth Orchestra — Institutional Case for Support</h1>
        <p>
          The Kawartha Youth Orchestra (KYO) is a non-profit music education organization dedicated to providing accessible, high-quality music education and orchestral performance training to children and youth across Peterborough and the Kawarthas.
        </p>
        {metadata?.aiSummary && <p>{metadata.aiSummary}</p>}
        <div>
          <h2>Core Programs</h2>
          <article>
            <h3>The Orchestras Program</h3>
            <p>A progressive suite of ensembles serving over 120 students annually with an average 70% tuition fee reduction.</p>
          </article>
          <article>
            <h3>UpBeat! Social Development Program</h3>
            <p>A fully subsidized El Sistema-inspired after-school music program providing free instruments, tuition, nutrition, and transport.</p>
          </article>
          <article>
            <h3>The Instrumental Lessons Program</h3>
            <p>Weekly private and small-group lessons with conservatory-trained instructors across all orchestral disciplines.</p>
          </article>
        </div>

        {publishedGrants.length > 0 && (
          <div>
            <h2>Published Grant Cases</h2>
            <ul>
              {publishedGrants.map((grant) => {
                const year = grant.grantCycleYear || new Date(grant.startedAt || grant.createdAt || Date.now()).getFullYear().toString();
                return (
                  <li key={grant.id}>
                    <Link href={getGrantPublicUrl(grant)}>
                      {grant.funderName} ({year}) — {grant.programName || 'General Fund'} Case for Support
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {/* Interactive UI Island */}
      <CaseForSupportIndexClient board={board} documents={documents} />
    </>
  );
}
