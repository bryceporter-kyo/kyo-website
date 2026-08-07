import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown } from 'lucide-react';
import type {
  BudgetLineItem,
  FundingType,
  GrantQAPair,
  PastSupportRecord,
  PrimaryProgram,
  TimelineMilestone,
} from '@/lib/case-for-support';

const PROGRAM_LABELS: Record<PrimaryProgram, string> = {
  general: 'General Operating Support',
  orchestras: 'The Orchestras Program',
  upbeat: 'UpBeat!',
  lessons: 'The Lessons Program',
};

const FUNDING_TYPE_LABELS: Record<FundingType, string> = {
  'one-time': 'One time grant',
  'multi-year': 'Multi year commitment',
  matching: 'Matching grant',
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-slate-900 font-medium mt-0.5">{value}</div>
    </div>
  );
}

/** Quick-reference card summarizing the grant ask. Renders unconditionally
 * since the core fields (funder, grant, amount, cycle) are required. */
export function GrantDetailsCard({
  funderName,
  grantName,
  grantCycleYear,
  amountRequested,
  primaryProgram,
  fundingType,
  numberOfYears,
  matchRequired,
  matchAmount,
  submissionDate,
  applicationDeadline,
}: {
  funderName: string;
  grantName?: string | null;
  grantCycleYear: string;
  amountRequested: string;
  primaryProgram: PrimaryProgram;
  fundingType?: FundingType | null;
  numberOfYears?: number | null;
  matchRequired?: boolean | null;
  matchAmount?: string | null;
  submissionDate?: string | null;
  applicationDeadline?: string | null;
}) {
  return (
    <div className="rounded-[2rem] bg-slate-50/60 border border-slate-100 p-8 grid grid-cols-2 md:grid-cols-3 gap-6">
      {grantName && <DetailRow label="Grant" value={grantName} />}
      <DetailRow label="Cycle" value={grantCycleYear} />
      <DetailRow label="Amount Requested" value={amountRequested} />
      <DetailRow label="Program" value={PROGRAM_LABELS[primaryProgram]} />
      {fundingType && (
        <DetailRow
          label="Funding Type"
          value={
            fundingType === 'multi-year' && numberOfYears
              ? `${FUNDING_TYPE_LABELS[fundingType]}, ${numberOfYears} years`
              : FUNDING_TYPE_LABELS[fundingType]
          }
        />
      )}
      {matchRequired && matchAmount && (
        <DetailRow label="Matching Requirement" value={matchAmount} />
      )}
      {submissionDate && <DetailRow label="Submitted" value={submissionDate} />}
      {applicationDeadline && (
        <DetailRow label="Deadline" value={applicationDeadline} />
      )}
    </div>
  );
}

/** Narrative section explaining fit with the funder's mission. Admin authored. */
export function ValuesAlignment({
  funderName,
  text,
}: {
  funderName: string;
  text?: string | null;
}) {
  if (!text) return null;
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-3xl space-y-4">
        <h3 className="text-2xl font-headline font-bold text-slate-900 text-center">
          Why KYO Aligns With {funderName}
        </h3>
        <div className="rounded-[2rem] bg-white border border-primary/10 shadow-sm p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary/40" />
          <div className="prose prose-slate prose-p:leading-relaxed prose-a:text-primary max-w-none text-slate-600">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Prior funding history with this specific funder, for renewal applications. */
export function PastSupportSection({
  funderName,
  records,
}: {
  funderName: string;
  records?: PastSupportRecord[] | null;
}) {
  if (!records || records.length === 0) return null;
  return (
    <section className="py-16 px-4 bg-slate-50/40">
      <div className="container mx-auto max-w-3xl space-y-6">
        <h3 className="text-2xl font-headline font-bold text-slate-900 text-center">
          Our History With {funderName}
        </h3>
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.year}
              className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-6 py-4"
            >
              <div>
                <div className="font-medium text-slate-900">{record.year}</div>
                {record.note && (
                  <div className="text-sm text-slate-500 mt-1">{record.note}</div>
                )}
              </div>
              <div className="font-headline font-semibold text-slate-900 whitespace-nowrap">
                {record.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Inline rendering of the grant application Q&A, mirroring the generated PDF. */
export function GrantQASection({ pairs }: { pairs?: GrantQAPair[] | null }) {
  if (!pairs || pairs.length === 0) return null;
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-5xl space-y-12">
        <h3 className="text-2xl font-headline font-bold text-slate-900 text-center">
          Grant Application Responses
        </h3>
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          {pairs.map((pair, index) => (
            <div key={index} className={`grid grid-cols-1 md:grid-cols-3 p-6 md:p-8 ${index !== pairs.length - 1 ? 'border-b border-slate-200' : ''}`}>
              <div className="font-bold text-slate-900 mb-2 md:mb-0 md:col-span-1 pr-6">{pair.question}</div>
              <div className="prose prose-slate prose-p:leading-relaxed prose-a:text-primary max-w-none text-slate-600 whitespace-pre-wrap md:col-span-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{pair.answer}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function parseAmountToNumber(amount: string): number | null {
  const cleaned = amount.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const value = parseFloat(cleaned);
  return Number.isNaN(value) ? null : value;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Complete budget breakdown table, optional */
export function BudgetBreakdownSection({
  items,
  amountRequested,
}: {
  items?: BudgetLineItem[] | null;
  amountRequested?: number | null;
}) {
  if (!items || items.length === 0) return null;

  // Attempt to parse all amounts to numbers to calculate totals
  const parseAmountToNumber = (val: string) => {
    if (!val) return null;
    const cleaned = val.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  };

  const parsedAmounts = items.map((i) => parseAmountToNumber(i.amount));
  const allParsed = parsedAmounts.every((a) => a !== null);
  
  const grandTotalNumeric = parsedAmounts.reduce<number>((sum, value) => sum + (value || 0), 0);
  const grandTotal = allParsed
    ? formatCurrency(grandTotalNumeric)
    : null;

  // Group items by category -> subcategory
  type SubcategoryGroup = {
    name: string;
    subtotal: number;
    allParsed: boolean;
    items: (BudgetLineItem & { parsedAmount: number | null })[];
  };

  type CategoryGroup = {
    name: string;
    subtotal: number;
    allParsed: boolean;
    subcategories: Record<string, SubcategoryGroup>;
  };
  
  const grouped: Record<string, CategoryGroup> = {};
  
  items.forEach((item, index) => {
    const catName = item.category || 'Uncategorized';
    const subcatName = item.subcategory || 'General';

    if (!grouped[catName]) {
      grouped[catName] = { name: catName, subtotal: 0, allParsed: true, subcategories: {} };
    }
    
    if (!grouped[catName].subcategories[subcatName]) {
      grouped[catName].subcategories[subcatName] = { name: subcatName, subtotal: 0, allParsed: true, items: [] };
    }

    const amount = parsedAmounts[index];
    grouped[catName].subcategories[subcatName].items.push({ ...item, parsedAmount: amount });
    
    if (amount === null) {
      grouped[catName].allParsed = false;
      grouped[catName].subcategories[subcatName].allParsed = false;
    } else {
      grouped[catName].subtotal += amount;
      grouped[catName].subcategories[subcatName].subtotal += amount;
    }
  });

  const categories = Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));

  const totalAmountForPercentage = allParsed && grandTotalNumeric > 0 ? grandTotalNumeric : null;

  return (
    <section className="py-16 px-4 bg-slate-50/40">
      <div className="container mx-auto max-w-3xl space-y-6">
        <h3 className="text-2xl font-headline font-bold text-slate-900 text-center">
          Budget &amp; Use of Funds
        </h3>
        <div className="rounded-[2rem] border border-slate-100 bg-white overflow-hidden shadow-sm">
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_80px_70px] md:grid-cols-[1fr_120px_100px] gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 items-center">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Category / Item</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Amount</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">% of Total</div>
          </div>

          {categories.map((cat, i) => {
            const percentage = cat.allParsed && totalAmountForPercentage 
              ? Math.round((cat.subtotal / totalAmountForPercentage) * 100) 
              : null;

            return (
              <details key={cat.name} className="group border-b border-slate-100 last:border-0" open={false}>
                <summary className="grid grid-cols-[1fr_80px_70px] md:grid-cols-[1fr_120px_100px] gap-4 items-center px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors list-none [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform shrink-0" />
                    <span className="font-headline font-semibold text-slate-900 truncate">{cat.name}</span>
                  </div>
                  <div className="text-center">
                    {cat.allParsed && (
                      <span className="font-semibold text-slate-900 text-sm md:text-base">{formatCurrency(cat.subtotal)}</span>
                    )}
                  </div>
                  <div className="text-center">
                    {percentage !== null && (
                      <span className="text-xs md:text-sm font-medium text-primary/80 bg-primary/10 px-2 py-0.5 rounded-md">
                        {percentage}%
                      </span>
                    )}
                  </div>
                </summary>
                
                <div className="px-6 pb-4 pt-0 space-y-2">
                  {Object.values(cat.subcategories).sort((a, b) => a.name.localeCompare(b.name)).map((subcat, j) => {
                    const subPercentage = subcat.allParsed && totalAmountForPercentage 
                      ? Math.round((subcat.subtotal / totalAmountForPercentage) * 100) 
                      : null;
                    return (
                      <div key={j} className="pl-6 pt-2 border-l-2 border-slate-100 ml-2">
                        <div className="grid grid-cols-[1fr_80px_70px] md:grid-cols-[1fr_120px_100px] gap-4 items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">{subcat.name}</span>
                          <div className="text-center">
                            {subcat.allParsed && (
                              <span className="text-xs font-semibold text-slate-600">{formatCurrency(subcat.subtotal)}</span>
                            )}
                          </div>
                          <div className="text-center">
                            {subPercentage !== null && (
                              <span className="text-xs font-medium text-slate-400">{subPercentage}%</span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {subcat.items.map((item, k) => (
                            <div key={k} className="grid grid-cols-[1fr_80px_70px] md:grid-cols-[1fr_120px_100px] gap-4 items-center py-2 px-3 bg-slate-50/50 rounded-lg">
                              <span className="text-slate-700 text-sm leading-tight pr-4 break-words">{item.item}</span>
                              <div className="text-center font-medium text-slate-900 text-xs md:text-sm whitespace-nowrap">
                                {item.parsedAmount !== null ? formatCurrency(item.parsedAmount) : item.amount}
                              </div>
                              <div></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
          {grandTotal && (
            <div className="grid grid-cols-[1fr_80px_70px] md:grid-cols-[1fr_120px_100px] gap-4 items-center px-6 py-5 bg-slate-900 font-headline text-white rounded-b-[2rem]">
              <span className="font-medium text-right text-sm md:text-base">Grand Total</span>
              <div className="text-center font-bold text-base md:text-lg">{grandTotal}</div>
              <div className="text-center text-white/70 text-sm font-medium"></div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Project timeline / milestones, if the admin has entered any. */
export function TimelineSection({
  milestones,
}: {
  milestones?: TimelineMilestone[] | null;
}) {
  if (!milestones || milestones.length === 0) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return new Intl.DateTimeFormat('en-CA', { month: 'long', year: 'numeric' }).format(d);
    }
    return dateStr;
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-3xl space-y-6">
        <h3 className="text-2xl font-headline font-bold text-slate-900 text-center">
          Project Timeline
        </h3>
        <div className="relative border-l border-primary/20 pl-8 ml-4 md:ml-32 space-y-10 py-4">
          {milestones.map((step, index) => (
            <div key={index} className="relative group">
              {/* Node */}
              <div className="absolute -left-[41px] top-4 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-125 transition-transform">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              
              <div className="flex flex-col md:flex-row md:gap-8 items-start">
                {/* Date (Left side on desktop, top on mobile) */}
                <div className="text-xs font-bold tracking-widest uppercase text-primary/80 mb-2 md:mb-0 md:absolute md:-left-[160px] md:top-4 md:text-right md:w-24">
                  {formatDate(step.date)}
                </div>
                {/* Card */}
                <div className="flex-1 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                  <div className="font-headline font-bold text-lg text-slate-900">
                    {step.milestone}
                  </div>
                  {step.description && (
                    <div className="text-sm text-slate-600 leading-relaxed mt-2">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Freeform narrative describing how KYO will report back to the funder. */
export function ReportingPlanSection({ text }: { text?: string | null }) {
  if (!text) return null;
  return (
    <section className="py-16 px-4 bg-slate-50/40">
      <div className="container mx-auto max-w-3xl space-y-4">
        <h3 className="text-2xl font-headline font-bold text-slate-900 text-center">
          Reporting &amp; Accountability
        </h3>
        <div className="rounded-[2rem] bg-white border border-primary/10 shadow-sm p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary/40" />
          <div className="prose prose-slate prose-p:leading-relaxed prose-a:text-primary max-w-none text-slate-600">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Freeform narrative describing how the funder will be acknowledged. */
export function RecognitionPlanSection({ text }: { text?: string | null }) {
  if (!text) return null;
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-3xl space-y-4">
        <h3 className="text-2xl font-headline font-bold text-slate-900 text-center">
          Recognition &amp; Acknowledgment
        </h3>
        <div className="rounded-[2rem] bg-white border border-primary/10 shadow-sm p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary/40" />
          <div className="prose prose-slate prose-p:leading-relaxed prose-a:text-primary max-w-none text-slate-600">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  );
}
