
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLinkById } from "@/lib/links";
import { getImageById } from "@/lib/image-service-server";
import Link from "next/link";

export default async function HiringPolicyPage() {
  const headerImage = await getImageById('page-header-hiring');
  const hrCommitteeLink = getLinkById('contact-hiring-policy');

  return (
    <div>
      <PageHeader
        title="Hiring & EEO Policy"
        subtitle="Committed to a fair and inclusive workplace."
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
                        The Kawartha Youth Orchestra is committed to recruiting and selecting candidates who best meet the requirements of available positions and contribute to the success of our organization. This policy outlines the KYO’s approach to fair and transparent hiring practices in accordance with industry standards and legal requirements. This hiring policy serves as a guide to promote transparency, fairness, and equal opportunity in all aspects of the KYO’s recruitment and selection practices.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">2. Equal Employment Opportunity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                        The Kawartha Youth Orchestra is committed to providing equal employment opportunities to all employees and applicants for employment. Employment decisions at the KYO are based on merit, qualifications, and abilities. The KYO does not discriminate in employment opportunities or practices on the basis of race, colour, religion, creed, sex, gender identity or expression, sexual orientation, national origin, ancestry, age, disability, marital status, veteran status, genetic information, or any other characteristic protected by law.
                    </p>
                    <p>
                        The KYO’s commitment to equal opportunity applies to all aspects of employment, including recruitment, hiring, training, promotion, transfer, compensation, benefits, social and recreational programs, and termination. The KYO strives to create a work environment that is inclusive and respectful of all individuals.
                    </p>
                    <p>
                        The KYO prohibits discrimination and harassment of any kind against employees, applicants, or any other individuals associated with KYO. This includes harassment based on race, colour, religion, sex, gender identity or expression, sexual orientation, national origin, ancestry, age, disability, marital status, veteran status, genetic information, or any other protected characteristic.
                    </p>
                    <p>
                        Employees and applicants for employment are encouraged to bring any concerns or complaints regarding discrimination or harassment to the attention of their supervisor, manager, or Human Resources. KYO will promptly and thoroughly investigate all complaints and take appropriate action based on the findings of the investigation. KYO prohibits retaliation against any individual who files a complaint or participates in an investigation regarding discrimination or harassment.
                    </p>
                    <p>
                        The KYO is committed to complying with all applicable laws and regulations concerning equal employment opportunities. This policy applies to all employees, including management, supervisors, and employees at all levels of the organization.
                    </p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">3. Recruitment Process</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground">
                    <div className="space-y-2">
                        <h4 className="font-bold text-lg font-headline text-foreground">3.1 Job Posting and Advertisement</h4>
                        <p>
                            The Kawartha Youth Orchestra places significant emphasis on clearly defining the specific job requirements, qualifications, and responsibilities associated with each position within the organization. This ensures that candidates understand the expectations and essential skills needed to succeed in the role. Job postings are disseminated through various channels, including internally and on external job boards. These include external recruitment agencies, reputable job boards, social media platforms, and professional networks. By utilizing a diverse array of recruitment avenues, the KYO aims to attract a broad and inclusive pool of qualified candidates who bring diverse perspectives and experiences to our team. This approach not only enhances our ability to identify top talent but also underscores our commitment to fostering an inclusive workplace environment where every individual can thrive and contribute effectively to our organizational goals.
                        </p>
                        <p>
                            The KYO reserves the discretion to not publicly post all job roles and is not obligated to maintain a job posting for positions where an existing candidate is known to the KYO and approved by the board or directors or the KYO’s HR Committee. This approach allows the KYO to swiftly and efficiently fill positions with candidates who have been identified internally and are deemed to meet the organization’s specific needs and strategic objectives. By leveraging internal knowledge and expertise, the KYO ensures that qualified individuals within the organization are considered for opportunities that align closely with their skills and career goals, promoting a culture of internal growth and development. This practice also supports the KYO’s commitment to agile and responsive talent management, enabling us to maintain operational efficiency while fostering a dynamic and supportive work environment.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-bold text-lg font-headline text-foreground">3.2 Application and Screening</h4>
                        <p>
                            Every application undergoes a thorough review process centred on specific criteria aligned with the qualifications and requirements of the position. Our screening and assessment procedures are meticulously designed to evaluate each candidate against these predefined standards, ensuring a fair and objective evaluation process. We believe in transparency and respect for candidates’ time, which is why the KYO is committed to promptly notifying applicants of their application status following each stage of the evaluation process. This approach not only maintains the integrity of our hiring process but also fosters positive candidate experiences by keeping them informed at every step of their application journey.
                        </p>
                        <p>
                            Hiring committees are entrusted with the final authority to make hiring decisions. These decisions are based solely on merit, qualifications, and alignment with the KYO’s values and business needs. The KYO upholds a policy that prohibits any form of external or internal pressure, unsolicited input, financial incentives, or other extraneous factors from influencing hiring decisions.
                        </p>

                        <h5 className="font-bold pt-2">Key Principles:</h5>
                        <ul className="list-disc list-outside pl-6 space-y-1">
                            <li><strong>Merit-Based Decisions:</strong> Hiring decisions at the KYO are grounded in the qualifications, experience, skills, and potential contributions of candidates to the organization.</li>
                            <li><strong>Transparency and Fairness:</strong> The KYO ensures that all candidates are evaluated objectively and fairly, without bias or undue influence.</li>
                            <li><strong>Compliance with Policy:</strong> The KYO’s hiring managers are expected to adhere strictly to this policy, ensuring that decisions are made in accordance with established procedures and without external interference.</li>
                            <li><strong>Ethical Standards:</strong> The KYO maintains high ethical standards in its hiring practices, fostering an environment where integrity and professionalism guide every decision-making process.</li>
                        </ul>

                        <h5 className="font-bold pt-2">Prohibited Influences:</h5>
                        <ul className="list-disc list-outside pl-6 space-y-1">
                            <li><strong>External Pressure:</strong> The KYO Board of Directors prohibits any external influence from individuals, organizations, or entities that seek to sway hiring decisions for reasons unrelated to the candidate’s qualifications and suitability for the role.</li>
                            <li><strong>Internal Unsolicited Input:</strong> Internal stakeholders, not directly involved in the hiring process, are prohibited from exerting unsolicited influence or pressure on hiring managers.</li>
                            <li><strong>Financial Incentives:</strong> KYO strictly prohibits the offer or acceptance of financial incentives, rewards, or benefits that could compromise the integrity of the hiring process.</li>
                            <li><strong>Other Factors:</strong> Any other factors not directly related to the candidate’s qualifications or the legitimate needs of KYO are not allowed to influence hiring decisions.</li>
                        </ul>

                        <h5 className="font-bold pt-2">Accountability and Oversight:</h5>
                        <ul className="list-disc list-outside pl-6 space-y-1">
                            <li>The KYO’s Human Resources Committee oversees the implementation of this policy and ensures that all hiring managers are trained and informed about their responsibilities under this framework.</li>
                            <li>Compliance with the policy is regularly monitored and reviewed to uphold the highest standards of fairness and professionalism in the KYO’s hiring practices.</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-bold text-lg font-headline text-foreground">3.3 Interview and Selection</h4>
                        <p>
                            Candidates who successfully meet the initial screening criteria will be invited to engage in a comprehensive interview process designed to assess their suitability for available positions. Our interview approach may encompass multiple rounds, allowing candidates to interact with various stakeholders and participate in panel interviews involving representatives from relevant departments. Throughout these interactions, the Hiring Committee focuses on evaluating candidates based on their demonstrated skills, relevant experience, alignment with our organizational culture, and potential to contribute effectively to our team and objectives. Importantly, all selection decisions are made with a commitment to objectivity and fairness, ensuring that bias does not influence the outcome. This structured approach aims to identify the most qualified individuals who can thrive within the KYO’s dynamic environment and contribute to our ongoing success.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-bold text-lg font-headline text-foreground">3.4 Preemployment Work, Tests, or Assignments</h4>
                        <p>
                            The Kawartha Youth Orchestra values and respects the time of our candidates throughout the hiring process. As part of our commitment to transparency and fairness, the KYO prohibits any unpaid work, tests, or assignments that exceed a total estimated completion time of two hours across the entire hiring process.
                        </p>
                        <p>
                            This policy ensures that candidates are not unduly burdened with excessive time commitments or tasks that do not align with reasonable expectations for evaluating their qualifications. The KYO understands the importance of providing a streamlined and respectful hiring experience, where candidates can confidently engage without concerns about uncompensated or excessive demands on their time.
                        </p>
                        <p>
                            For any inquiries regarding our hiring processes or to report potential violations of this policy, candidates are encouraged to contact us at {hrCommitteeLink ? <Link href={hrCommitteeLink.url} className="text-primary underline">{hrCommitteeLink.url.replace('mailto:', '')}</Link> : 'hr-committee@thekyo.ca'}. We are dedicated to upholding these standards and ensuring that all candidates are treated equitably throughout their interactions with the KYO.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">4. Offer and Onboarding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground">
                    <div className="space-y-2">
                        <h4 className="font-bold text-lg font-headline text-foreground">4.1 Offer of Employment</h4>
                        <p>
                            The KYO values a transparent and equitable approach to extending offers of employment to selected candidates. Upon successful completion of our thorough interview process, which may include multiple rounds of assessments and interviews, KYO will extend formal offers of employment. These offers will detail comprehensive information regarding compensation, benefits, including health insurance, retirement plans, and other relevant terms of employment such as work hours, probationary periods, and expectations of performance. In some instances, candidates may be required to undergo background checks or provide additional documentation, such as proof of eligibility to work or professional certifications, as conditions precedent to finalizing their employment with KYO. These steps are essential to ensuring that the KYO continues to uphold high standards of professionalism, integrity, and compliance with applicable laws and industry best practices throughout our hiring processes.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-bold text-lg font-headline text-foreground">4.2 Onboarding</h4>
                        <p>
                            Upon joining the KYO, newly hired employees will embark on a thorough onboarding journey designed to immerse them in our organizational ethos, policies, and operational procedures. This comprehensive process ensures that each individual gains a clear understanding of the KYO’s mission, values, and workplace expectations. Throughout this onboarding experience, employees will receive essential training and ongoing support tailored to their roles, aiming to facilitate a seamless transition and enhance their effectiveness within the organization.
                        </p>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">5. Compliance and Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground">
                    <div className="space-y-2">
                        <h4 className="font-bold text-lg font-headline text-foreground">5.1 Compliance</h4>
                        <p>
                            The KYO is committed to upholding the highest standards of compliance with all relevant laws, regulations, and industry norms that govern employment practices and hiring procedures. This commitment ensures that our recruitment processes are fair, transparent, and conducted in accordance with legal mandates. We maintain meticulous records of all recruitment and hiring activities to ensure accountability and transparency. These records are managed and stored securely, adhering to legal requirements for confidentiality and data protection. By adhering to these standards, the KYO aims to foster an environment where all candidates are treated equitably and every hiring decision is based on merit, qualifications, and alignment with our organizational goals. Regular reviews and updates to our policies and procedures ensure ongoing alignment with evolving legal frameworks and best practices in employment law.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-bold text-lg font-headline text-foreground">5.2 Review and Evaluation</h4>
                        <p>
                            Our hiring policy is designed to uphold the principles of transparency, fairness, and equal opportunity throughout our recruitment and selection processes. We are committed to regularly reviewing and updating this policy to ensure it aligns with the KYO’s strategic objectives and incorporates evolving best practices in the field of human resources. Feedback from hiring managers, candidates, and stakeholders is integral to this process, as it provides valuable insights that help us enhance the effectiveness and fairness of our hiring practices. By continuously refining our approach based on feedback and industry advancements, we aim to maintain a robust hiring framework that attracts top talent while promoting diversity, inclusivity, and organizational excellence.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </section>
    </div>
  );
}
