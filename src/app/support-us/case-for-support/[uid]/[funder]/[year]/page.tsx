import { notFound } from 'next/navigation';
import { fetchGrantByTruncatedUidServer } from '@/lib/case-for-support-server';
import { GrantDocumentJsonLd } from '@/components/shared/JsonLd';
import GrantDetailClient from './_components/GrantDetailClient';

interface Props {
  params: Promise<{
    uid: string;
    funder: string;
    year: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function DynamicCaseForSupportPage(props: Props) {
  const { uid, funder, year } = await props.params;
  const grant = await fetchGrantByTruncatedUidServer(uid);

  if (!grant) {
    notFound();
  }

  const canonicalUrl = `https://kyo.ca/support-us/case-for-support/${uid}/${funder}/${year}`;

  return (
    <>
      {/* Schema.org Article Structured Data */}
      <GrantDocumentJsonLd
        title={`Case for Support: ${grant.funderName} (${grant.grantCycleYear})`}
        funderName={grant.funderName}
        year={grant.grantCycleYear}
        summary={`Funding proposal by Kawartha Youth Orchestra requesting support for ${grant.programOfSupport || 'youth music education'}.`}
        url={canonicalUrl}
        datePublished={grant.submissionDate}
      />

      {/* Crawlable Semantic Content for Search Engines & AI Crawlers */}
      <section className="sr-only" aria-label="Grant Case for Support Proposal Document">
        <h1>Kawartha Youth Orchestra Case for Support — {grant.funderName}</h1>
        <p><strong>Funder:</strong> {grant.funderName}</p>
        <p><strong>Grant Cycle:</strong> {grant.grantCycleYear}</p>
        <p><strong>Program Area:</strong> {grant.primaryProgram} ({grant.programOfSupport})</p>
        <p><strong>Amount Requested:</strong> ${grant.amountRequested.toLocaleString('en-CA')}</p>
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
        {grant.grantQA && grant.grantQA.length > 0 && (
          <div>
            <h2>Grant Questions & Answers</h2>
            {grant.grantQA.map((qa, i) => (
              <div key={i}>
                <h3>{qa.question}</h3>
                <p>{qa.answer}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Interactive Animated Client Island */}
      <GrantDetailClient grant={grant} />
    </>
  );
}
