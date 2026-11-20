import { notFound, redirect } from 'next/navigation';
import { 
  fetchGrantByTruncatedUidServer, 
  fetchBoardMembersServer,
  fetchGovernanceDocumentsServer 
} from '@/lib/case-for-support-server';
import { getGrantPublicUrl } from '@/lib/grants/constants';
import { GrantDocumentJsonLd } from '@/components/shared/JsonLd';
import GrantDetailClient from './_components/GrantDetailClient';

interface Props {
  params: Promise<{
    uid: string;
    slug: string[];
  }>;
}

// Revalidate daily as a fallback; updated instantly on demand via /api/revalidate
export const revalidate = 86400;
export const dynamicParams = true;

export default async function DynamicCaseForSupportPage(props: Props) {
  const { uid, slug = [] } = await props.params;

  const [grant, board, documents] = await Promise.all([
    fetchGrantByTruncatedUidServer(uid),
    fetchBoardMembersServer(),
    fetchGovernanceDocumentsServer(),
  ]);

  if (!grant || !grant.published) {
    notFound();
  }

  // Canonical URL calculation
  const canonicalPath = getGrantPublicUrl(grant);
  const currentPath = `/support-us/case-for-support/${uid}/${slug.join('/')}`;

  // If the human-readable slug/year in URL does not match canonical (e.g. funder renamed or year changed),
  // redirect permanently/canonically to prevent link rot
  if (currentPath !== canonicalPath) {
    redirect(canonicalPath);
  }

  const canonicalUrl = `https://kyo.ca${canonicalPath}`;
  const year = grant.grantCycleYear || new Date(grant.startedAt || grant.createdAt || Date.now()).getFullYear().toString();
  const visibleQuestions = (grant.questions || []).filter(q => q.publicVisible !== false);

  return (
    <>
      {/* Schema.org DigitalDocument Structured Data */}
      <GrantDocumentJsonLd
        title={`Case for Support: ${grant.funderName} (${year})`}
        funderName={grant.funderName}
        year={year}
        summary={`Funding proposal by Kawartha Youth Orchestra requesting support for ${grant.programName || 'youth music education'}.`}
        url={canonicalUrl}
        datePublished={grant.submittedOn || grant.createdAt || new Date().toISOString()}
        amountRequested={grant.amountRequested || 0}
        programArea={grant.programName || 'Youth Music Education'}
      />

      {/* Crawlable Semantic Content for Search Engines & AI Crawlers */}
      <section className="sr-only" aria-label="Grant Case for Support Proposal Document">
        <h1>Kawartha Youth Orchestra Case for Support — {grant.funderName}</h1>
        <p><strong>Funder:</strong> {grant.funderName}</p>
        <p><strong>Grant Cycle:</strong> {year}</p>
        <p><strong>Program Area:</strong> {grant.programName}</p>
        {grant.amountRequested ? (
          <p><strong>Amount Requested:</strong> ${(grant.amountRequested).toLocaleString('en-CA')}</p>
        ) : null}
        {grant.valuesAlignment && (
          <div>
            <h2>Alignment with {grant.funderName}</h2>
            <p>{grant.valuesAlignment}</p>
          </div>
        )}
        {grant.customLetterBody && (
          <div>
            <h2>Letter from Board Chair</h2>
            {grant.customLetterBody.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
        {visibleQuestions.length > 0 && (
          <div>
            <h2>Grant Questions &amp; Answers</h2>
            {visibleQuestions.map((qa, i) => (
              <div key={qa.id || i}>
                <h3>{qa.question}</h3>
                <p>{qa.answerHtml || (qa as any).answer || ''}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Interactive Animated Client Island */}
      <GrantDetailClient grant={grant} board={board} documents={documents} />
    </>
  );
}
