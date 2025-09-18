
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";

export default function ProtectionPolicyPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-protection');

  return (
    <div>
      <PageHeader
        title="Protection of Children and Vulnerable Persons Policy"
        subtitle="Our commitment to a safe and supportive environment."
        image={headerImage}
      />
      <section className="container mx-auto">
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">1. Introduction</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        The Kawartha Youth Orchestra (KYO), including the UpBeat! program, is committed to providing safe, supportive, and respectful environments for children and vulnerable persons. This policy outlines KYO’s duty of care, standards of conduct, and mandatory reporting responsibilities to ensure that all participants are protected from harm. By implementing this policy, KYO affirms its commitment to safeguarding every child and vulnerable person entrusted to its care.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">2. Scope and Definitions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <h4 className="font-bold text-lg font-headline text-foreground">2.1 Scope</h4>
                    <p>
                        This policy applies to all KYO staff, contractors, and volunteers, including individuals engaged in the delivery of KYO programs, activities, and events both in person and online.
                    </p>
                    <h4 className="font-bold text-lg font-headline text-foreground pt-2">2.2 Definitions</h4>
                    <ul className="list-disc list-outside pl-6 space-y-2">
                        <li><strong>Child:</strong> An individual under 16 years of age, or a person aged 16–17 who is under the care of a child protection authority.</li>
                        <li><strong>Vulnerable Person:</strong> A youth aged 16–17, or any person aged 18+ who may be unable to protect themselves from abuse or neglect due to age, disability, illness, or other circumstances.</li>
                        <li><strong>Abuse:</strong> Any action or inaction causing, or placing someone at risk of, harm. Abuse may be physical, sexual, emotional, neglectful, or financial in nature, and may occur once or repeatedly.</li>
                        <li><strong>Physical Abuse:</strong> Inflicting injury, inadequate supervision, or patterns of neglect.</li>
                        <li><strong>Sexual Abuse:</strong> Exploitation, molestation, or failure to protect from sexual harm.</li>
                        <li><strong>Emotional Abuse:</strong> Actions that damage dignity, self-worth, or mental health.</li>
                        <li><strong>Neglect:</strong> Failure to provide adequate care, supervision, or basic needs.</li>
                        <li><strong>Financial Abuse:</strong> Exploitation or misuse of funds or assets belonging to a vulnerable person.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">3. Duty of Care</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        The Kawartha Youth Orchestra acknowledges its legal and ethical duty to take all reasonable measures to protect participants from harm. Staff and volunteers are expected to act in the best interests of children and vulnerable persons at all times.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">4. Screening and Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <h4 className="font-bold text-lg font-headline text-foreground">4.1 Police Vulnerable Sector Screening Check</h4>
                    <p>
                        All staff and volunteers are required to provide proof of a current Police Vulnerable Sector Screening Check prior to participating in KYO programs. Screening documentation must be reviewed, approved, and recorded by the Chair of the Board of Directors, the Director of Business & Finance, and/or the Director of Human Resources.
                    </p>
                    <h4 className="font-bold text-lg font-headline text-foreground pt-2">4.2 Ongoing Compliance</h4>
                    <p>
                        Staff and volunteers must maintain valid and up-to-date clearance, and KYO reserves the right to request updated checks at regular intervals or when circumstances require.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">5. Standards of Conduct</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <h4 className="font-bold text-lg font-headline text-foreground">5.1 Good Practices</h4>
                    <p>All staff and volunteers are required to:</p>
                    <ul className="list-disc list-outside pl-6 space-y-2">
                        <li>Treat every individual with respect, dignity, and fairness.</li>
                        <li>Communicate clearly at a level appropriate to the participant’s age and understanding.</li>
                        <li>Respect privacy and encourage independence wherever possible.</li>
                        <li>Provide positive reinforcement and encouragement.</li>
                        <li>Ensure appropriate supervision ratios for safe program delivery.</li>
                        <li>Ensure children under the age of 10 are not left unsupervised.</li>
                        <li>Contact parents or guardians if a child under 10 is present without adult supervision.</li>
                    </ul>
                    <h4 className="font-bold text-lg font-headline text-foreground pt-2">5.2 Prohibited Practices</h4>
                    <p>The following practices are strictly prohibited:</p>
                    <ul className="list-disc list-outside pl-6 space-y-2">
                        <li>Corporal punishment or physical discipline.</li>
                        <li>Denial of basic needs such as food, shelter, clothing, or program participation.</li>
                        <li>Leaving children unsupervised.</li>
                        <li>Harsh, degrading, or humiliating treatment.</li>
                        <li>Confinement of children by locking exits or restricting movement.</li>
                        <li>Any form of abuse—physical, sexual, emotional, neglect, or financial.</li>
                        <li>Developing unsanctioned personal relationships with participants outside of KYO programming.</li>
                    </ul>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">6. Mandatory Reporting of Abuse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <h4 className="font-bold text-lg font-headline text-foreground">6.1 Legal Obligation</h4>
                    <p>
                        Under Section 72(1) of Ontario’s Child, Youth and Family Services Act, any person who has reasonable grounds to suspect a child may be in need of protection must immediately report this suspicion to a Children’s Aid Society (CAS). This duty applies to everyone and carries special responsibilities for professionals working with children.
                    </p>
                    <h4 className="font-bold text-lg font-headline text-foreground pt-2">6.2 Reporting Procedure</h4>
                    <p>If abuse is suspected or disclosed:</p>
                    <ul className="list-decimal list-outside pl-6 space-y-2">
                        <li>Call CAS immediately. Proof is not required; reasonable grounds are sufficient.</li>
                        <li>Inform your supervisor of your intention to call CAS. You may identify the child but must not disclose details of the suspicion.</li>
                        <li>After calling CAS, notify your supervisor, who will then inform the the Chair of the Board of Directors.</li>
                        <li>Seek medical attention if needed. If abuse is suspected, do not notify parents or guardians until advised by CAS.</li>
                        <li>If the child is in immediate danger, contact the police first, followed by CAS.</li>
                        <li>Avoid discussing the situation with parents, guardians, or colleagues not directly involved.</li>
                        <li>Document the incident and actions taken, in accordance with KYO procedures.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">7. Code of Conduct</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        All staff and volunteers must adhere to KYO’s Code of Conduct, which establishes expected standards of behavior, outlines best practices, and prohibits harmful practices. Breaches of this Code of Conduct will result in disciplinary action, up to and including termination of employment or volunteer engagement, and may also result in legal action.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">8. Oversight and Accountability</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        The Human Resources Committee is responsible for monitoring compliance with this policy. The policy will be reviewed by the KYO Board of Directors at least every two years, or sooner if required by changes in law or circumstance.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">9. Commitment Statement</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        The Kawartha Youth Orchestra is committed to maintaining safe, respectful, and caring environments where children and vulnerable persons are protected and supported. By upholding this policy, KYO ensures that all participants have the opportunity to grow, develop, and thrive in safety and dignity.
                    </p>
                </CardContent>
            </Card>
        </div>
      </section>
    </div>
  );
}
