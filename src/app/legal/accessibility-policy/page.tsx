
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function AccessibilityPolicyPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-accessibility');

  return (
    <div>
      <PageHeader
        title="Accessibility Policy"
        subtitle="Our commitment to accessibility for all."
        image={headerImage}
      />
      <section className="container mx-auto">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Accessibility Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <p>
              The Kawartha Youth Orchestra (“KYO”) provides its programs, services, facilities, and digital resources (collectively, the “Services”) in compliance with the Accessibility for Ontarians with Disabilities Act, 2005 (“AODA”), the Integrated Accessibility Standards Regulation (“IASR”), the Accessibility Standards for Customer Service, and the Ontario Human Rights Code. By accessing or participating in KYO Services, you agree to the terms and commitments outlined in this Accessibility Policy (the “Policy”).
            </p>
            <p>
              We may update this Policy periodically to reflect changes in legislation, best practices, or KYO operations. Please review it from time to time to remain informed.
            </p>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Description of Policy</h3>
                <p>
                    This Policy sets out how KYO identifies, removes, and prevents barriers to accessibility. It applies to staff, contractors, volunteers, program participants, visitors, donors, and members of the public interacting with KYO. KYO is committed to ensuring that all individuals can access our Services with dignity, independence, integration, and equal opportunity.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Accessible Customer Service</h3>
                <p>
                    KYO will provide accessible customer service in accordance with AODA requirements:
                </p>
                <ul className="list-disc list-outside pl-6 space-y-2">
                    <li>Individuals may use their own assistive devices when accessing Services.</li>
                    <li>Service animals are welcome in all public areas, except where prohibited by law.</li>
                    <li>Support persons may accompany individuals with disabilities; where fees apply, notice of applicable charges will be provided in advance.</li>
                    <li>Staff and volunteers receive training on how to interact respectfully with people with disabilities, including those using assistive devices, service animals, or support persons.</li>
                </ul>
            </div>
            
            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Information and Communications</h3>
                <p>
                    KYO will provide accessible formats and communication supports upon request. Examples include large print, accessible electronic files, captioning, or plain-language summaries. Requests will be addressed in consultation with the individual and provided at no additional cost.
                </p>
                <p>
                    Our website and digital content will conform to the Web Content Accessibility Guidelines (“WCAG”) 2.0 Level AA as required by the IASR. KYO will make best efforts to ensure new content is accessible and to remediate inaccessible content when identified.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Employment and Volunteers</h3>
                <p>
                    KYO is committed to accessible and equitable employment practices:
                </p>
                 <ul className="list-disc list-outside pl-6 space-y-2">
                    <li>Job postings and recruitment processes will inform candidates that accommodations are available upon request.</li>
                    <li>Applicants selected for interviews will be advised that accommodations are available.</li>
                    <li>Individual accommodation plans will be developed as required, including workplace emergency response information.</li>
                    <li>Accessibility will be considered in performance management, career development, and redeployment decisions.</li>
                </ul>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Built Environment and Events</h3>
                <p>
                    When planning concerts, rehearsals, workshops, or other events, KYO will consider accessibility in venue selection, seating, washrooms, signage, and acoustics. Any renovations or new builds under KYO control will comply with applicable accessibility standards under the IASR.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Procurement and Third Parties</h3>
                <p>
                    When procuring goods, services, or facilities, KYO will include accessibility criteria and requirements wherever practicable. Third-party agreements for Services (including digital platforms and venues) must align with KYO’s accessibility commitments.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Training</h3>
                <p>
                    KYO provides training to staff, volunteers, Board members, and contractors on:
                </p>
                 <ul className="list-disc list-outside pl-6 space-y-2">
                    <li>The requirements of the AODA and IASR;</li>
                    <li>The Ontario Human Rights Code as it pertains to persons with disabilities; and</li>
                    <li>KYO’s accessibility policies and practices.</li>
                </ul>
                <p>
                    Training is provided as soon as practicable after engagement, upon policy updates, and on an ongoing basis as needed. Records of training will be maintained.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Feedback and Complaints</h3>
                <p>
                    KYO welcomes feedback on the accessibility of its Services. Feedback, including complaints, may be submitted by email, phone, mail, or in person. KYO will acknowledge receipt within three business days and aim to provide a response or resolution within fifteen business days. Accessible feedback processes are available upon request.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Multi-Year Accessibility Plan</h3>
                <p>
                    KYO will maintain a publicly available Multi-Year Accessibility Plan that:
                </p>
                 <ul className="list-disc list-outside pl-6 space-y-2">
                    <li>Identifies barriers and outlines strategies to remove and prevent them;</li>
                    <li>Describes steps KYO has taken and will take to comply with the IASR; and</li>
                    <li>Is reviewed at least once every three years and updated as required.</li>
                </ul>
                <p>
                    The Plan will be provided in accessible formats upon request.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">General Terms</h3>
                <p><strong>Legal Framework:</strong> This Policy is governed by the Accessibility for Ontarians with Disabilities Act, 2005, the Integrated Accessibility Standards Regulation, and the Ontario Human Rights Code.</p>
                <p><strong>Relationship with the Human Rights Code:</strong> Where a conflict arises between this Policy and the Human Rights Code, the higher standard of accommodation will prevail.</p>
                <p><strong>Complete Agreement:</strong> This Policy represents KYO’s current commitments under the AODA and related legislation. Additional terms may apply to specific Services or programs.</p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Contact Information</h3>
                <p>
                    Questions, requests for accessible formats, or complaints regarding accessibility may be directed to:
                </p>
                <div className="pl-4">
                    <p>Accessibility Contact</p>
                    <p>Kawartha Youth Orchestra</p>
                    <a href="mailto:contactus@thekyo.ca" className="text-primary underline">contactus@thekyo.ca</a>
                    <p>705-410-4025</p>
                </div>
                <p>
                    KYO will provide copies of this Policy, and other relevant documents, in accessible formats upon request.
                </p>
            </div>

          </CardContent>
        </Card>
      </section>
    </div>
  );
}
