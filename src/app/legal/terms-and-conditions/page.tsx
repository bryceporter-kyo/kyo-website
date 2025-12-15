
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLinkById } from "@/lib/links";
import { getImageById } from "@/lib/image-service-server";
import Link from "next/link";

export default async function TermsAndConditionsPage() {
  const headerImage = await getImageById('page-header-conditions');
  const mainContactLink = getLinkById('contact-main');
  const hrCommitteeLink = getLinkById('contact-hiring-policy');
  const chairLink = getLinkById('contact-chair');
  const attendanceLink = getLinkById('contact-attendance');
  const itAdminLink = getLinkById('contact-it-admin');


  return (
    <div>
      <PageHeader
        title="Terms & Conditions"
        subtitle="Last updated: October 26, 2023"
        image={headerImage}
      />
      <section className="container mx-auto">
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Introduction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>Welcome to the Kawartha Youth Orchestra (KYO)! We are delighted to have you as a part of our vibrant musical community. Our mission is to ignite and foster a lifelong love for ensemble music among youth in a safe and supportive environment. The following Terms and Conditions are designed to ensure a clear understanding of the policies and procedures that govern our programs and activities.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Purpose of the Terms and Conditions</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>The purpose of these Terms and Conditions is to outline the rights and responsibilities of students, parents, teachers, volunteers, and staff involved with the KYO. By participating in our programs, you agree to adhere to these guidelines to help us maintain a harmonious and effective learning environment.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Definitions</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <dl className="space-y-4">
                        <div>
                        <dt className="font-semibold text-foreground">Non-scaling Programs:</dt>
                        <dd>A non-scaling program is a program where the operational costs to administer and finance the program remain relatively constant regardless of the number of participants or registrants. Non-scaling programs are identified by the Finance and Business Committee.</dd>
                        </div>
                        <div>
                        <dt className="font-semibold text-foreground">Public Benefit Corporation:</dt>
                        <dd>As defined in the Not-for-Profit Corporations Act, 2010, S.O. 2010, c. 15, a Public benefit corporation means: a charitable corporation, or a non-charitable corporation that receives more than $10,000 or other prescribed amount in a financial year, in the form of donations or gifts from persons who are not members, directors, officers or employees of the corporation, or in the form of grants or similar financial assistance from the federal government or a provincial or municipal government or an agency of any such government.</dd>
                        </div>
                        <div>
                        <dt className="font-semibold text-foreground">Scaling Programs:</dt>
                        <dd>A scaling program is a financial strategy in which operational costs to administer and finance the program increase proportionally with the number of participants or registrants. Scaling programs are identified by the Finance and Business Committee.</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Applicability and Scope</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>These Terms and Conditions apply to all participants in the KYO, including students, parents or guardians, teachers, volunteers, and staff. They cover a wide range of topics, including financial policies, interactions among youth, teachers, and volunteers, transportation guidelines, behavior expectations, governance, health and safety protocols, privacy and data protection, inclusivity, parental involvement, intellectual property, program-specific policies, complaint mechanisms, termination, and withdrawal procedures, and miscellaneous policies.</p>
                    <p>We believe that clear communication and mutual understanding are key to the success of our programs. We encourage you to read these Terms and Conditions carefully and to reach out to us with any questions or concerns. Together, we can ensure that the Kawartha Youth Orchestra remains a positive and enriching experience for all involved.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Governing Law and Applicable Legislation Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>The Kawartha Youth Orchestra (KYO) is committed to operating in compliance with all applicable laws and regulations. This policy outlines the governing law and relevant legislation that guide the organization’s operations, ensuring adherence to legal standards and promoting transparency, accountability, and integrity in all activities.</p>

                    <h4 className="font-bold text-lg font-headline text-foreground">Governing Law</h4>
                    <p>The operations and activities of the Kawartha Youth Orchestra shall be governed by the laws of the Province of Ontario and the federal laws of Canada.</p>

                    <h4 className="font-bold text-lg font-headline text-foreground">Applicable Legislation</h4>
                    <p>The KYO is bound by, but not limited to, the following legislative acts:</p>
                    <ul className="list-disc list-outside pl-6 space-y-2">
                        <li><strong>Not-for-Profit Corporations Act, 2010, S.O. 2010, c. 15:</strong> Governs the incorporation, governance, and dissolution of not-for-profit organizations in Ontario. Ensures that the KYO operates transparently, with clear bylaws, effective governance, and accountability to its members and stakeholders.</li>
                        <li><strong>The Personal Information Protection and Electronic Documents Act S.C. 2000, c. 5 (PIPEDA):</strong> Regulates the collection, use, and disclosure of personal information in the course of commercial activities. Ensures that the KYO handles personal information responsibly and secures the privacy of its members, participants, and stakeholders.</li>
                        <li><strong>Human Rights Code, R.S.O. 1990, c. H.19:</strong> Prohibits discrimination and harassment on various grounds, including race, gender, disability, and age. Ensures that the KYO provides an inclusive and respectful environment for all individuals involved in its activities.</li>
                        <li><strong>Labour Relations Act, 1995, S.O. 1995, c. 1, Sched. A:</strong> Governs the relationship between employers and employees, including collective bargaining and the rights of workers. Ensures that the KYO respects the rights of its employees and maintains fair and equitable labor practices.</li>
                        <li><strong>Employment Standards Act, 2000, S.O. 2000, c. 41:</strong> Sets out the minimum standards for working conditions, including wages, hours of work, and workplace safety. Ensures that the KYO complies with employment standards to provide a fair and safe working environment for its staff.</li>
                    </ul>

                    <h4 className="font-bold text-lg font-headline text-foreground">Additional Applicable Legislation</h4>
                    <p>The KYO recognizes that other federal, provincial, and municipal laws may apply to its operations. The organization is committed to ongoing compliance with all relevant legislation to ensure its operations are lawful, ethical, and aligned with best practices.</p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Financial Policies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <h4 className="font-bold text-lg font-headline text-foreground">Payment and Fees</h4>
                    <p><strong>Tuition and Enrollment Fees:</strong> All fees associated with participation in KYO programs are outlined at the time of registration. These fees cover tuition, materials, and other program-specific expenses required for the successful delivery of our programs unless otherwise stated. Any specific amounts or material requiring purchasing will be communicated to participants prior to the start of each program.</p>
                    <p><strong>Payment Schedules and Methods:</strong> The KYO recommends that all members pay their membership dues at the beginning of the season. This ensures smooth administration and allows for better financial planning and resource allocation. Despite this recommendation, members may opt for alternative payment schedules, such as quarterly or monthly payments. To arrange this, members must communicate their preferred payment plan to the KYO prior to their fees becoming due. Acceptable payment methods include:</p>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li>Credit/Debit Card through PayPal, NetSuite Pay, or Stripe;</li>
                        <li>Electronic Funds Transfer (EFT) or Interac E-Transfer;</li>
                        <li>Direct Deposit;</li>
                        <li>Cheque (by mail or in-person); or</li>
                        <li>Cash (in-person only).</li>
                    </ul>
                    <p><strong>Late Payment Penalties:</strong> Late payments may incur penalties if arrangements have not been proactively arranged with KYO administration. The specifics of these penalties, including the amount and conditions under which they apply, will be communicated to members in advance. Consistent late payments may result in a review of the member’s participation in KYO programs. In extreme cases, this could lead to suspension or termination of the member’s involvement in the program until all dues are settled.</p>

                    <h4 className="font-bold text-lg font-headline text-foreground">Refund Policy</h4>
                    <p><strong>Restrictions on Refunds:</strong> The KYO is legislatively prohibited from providing refunds according to the Not-for-Profit Corporations Act, 2010, S.O. 2010, c. 15 Part IX, section 89 subsection 1 and 2, as the KYO is a public benefit corporation. Consequently, all fees paid are final and non-refundable.</p>
                    <p><strong>Conditions for Refunds:</strong> Due to the requirements of the Not-for-Profit Corporations Act, 2010, S.O. 2010, the KYO cannot issue refunds for any reason.</p>
                    <p><strong>Process for Requesting Refunds:</strong> In exceptional cases such as program cancellation by the KYO, credit toward future participation or other programming will be provided. Members should submit a request through their programs instructor or the KYO program manager for such considerations, if they have not been provided proactively. This applies in cases where the individual is willingly leaving KYO programming, but the current KYO programming is still running.</p>

                    <h4 className="font-bold text-lg font-headline text-foreground">Scholarships and Financial Aid</h4>
                    <p><strong>Bursary Availability:</strong> The KYO endeavors to provide bursaries for all Non-Scaling programs upon request. These bursaries aim to make our programs accessible to a broader range of participants who may otherwise be unable to afford any fees related to the program. Interested members must complete a bursary application form, which includes details about the applicant’s financial situation and the specific program they wish to join. This form is contained within the registration form itself, should the option to request a bursary be selected.</p>
                    <p><strong>Scaling Program Bursaries:</strong> Programs classified as scaling are run seasonally as interest in these programs dictates, and require a minimum number of participants be registered before they can run. Individuals registering for or participating in scaling programs by way of bursaries or reductions of fees as a result of sibling discounts, other program registrations, or as an appreciative gesture for volunteer services rendered are not included in the minimum registrant number. This policy ensures the financial viability of scaling programs and ensures that all programs run or administered by the KYO work towards achieving the KYO’s objectives of supporting accessible music education.</p>
                    <p><strong>Non-Scaling Program Bursaries:</strong> Programs classified as non-scaling are available to any individual that meets the eligibility criteria for that specific program or ensemble. These programs may be subject to minimum enrollment requirements, however access to bursaries or reductions in fees payable as a result of sibling discounts, other program registrations, or as an appreciative gesture for volunteer services rendered are available regardless.</p>
                    
                    <h5 className="font-bold pt-2 text-foreground">Bursary Application Process</h5>
                    <p>The KYO offers two types of bursaries;</p>
                    <ul className="list-disc list-outside pl-6 space-y-2">
                        <li><strong>Direct Participant Bursaries:</strong> Financial assistance given directly to participants or registrants to support their participation in KYO programs.</li>
                        <li><strong>Fee Reduction Bursaries:</strong> Financial assistance provided by reducing the fees payable or by applying funds directly towards the participant’s program fees.</li>
                    </ul>

                    <p><strong>Direct Participant Bursaries:</strong> There is no application process for Direct Participant Bursaries. These bursaries are selected by one or multiple of either:</p>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li>The Board of Directors;</li>
                        <li>Selected advisory boards;</li>
                        <li>Applicable Committee(s);</li>
                        <li>Teachers, Ensemble leaders, or educators within KYO programs;</li>
                        <li>The individual(s), organization(s), or private enterprise(s) responsible for providing the bursaries; or</li>
                        <li>Any group as selected by the KYO Board of Directors or as selected as required by contract, the KYO bylaws, or applicable legislation.</li>
                    </ul>

                    <p><strong>Fee Reduction Bursaries:</strong> The application for Fee Reduction bursaries can be submitted at the time of registration by indicating a subsidy was being sought and providing the information required in the application.</p>
                    <ol className="list-decimal list-outside pl-6 space-y-1">
                        <li>Complete the relevant registration form, providing all required information and indicate your interest in receiving a bursary;</li>
                        <li>Provide all of the information required in the application and submit the registration form;</li>
                        <li>Bursary applications for regular requests follow the KYO’s Bursary policy based on the information provided. To amend information provided at the time of registration, please send your corrections to {mainContactLink ? <Link href={mainContactLink.url} className="text-primary underline">{mainContactLink.url.replace('mailto:', '')}</Link> : 'contactus@thekyo.ca'}. Bursary requests for unusual or amounts in excess of regular KYO Bursary policies are reviewed by the KYO’s accessibility committee.</li>
                        <li>Decisions on bursary amounts are communicated to registrants on the invoice provided for any accounts payable. Invoices are provided to all registrants, even if no balance owing exists or the KYO provides a 100% bursary.</li>
                    </ol>

                    <h5 className="font-bold pt-2 text-foreground">Volunteer Bursaries</h5>
                    <p>The KYO offers a volunteer bursary program to provide financial assistance to those who are committed to supporting the organization through volunteer work. The value of a volunteer bursary is capped at $3,500 annually. Once an individual registers for a program and indicates that they would like to receive a volunteer bursary, they will be required to fulfill a number of volunteer hours proportional to the non-bursary cost of the program(s) they are registered in, divided by the current minimum wage at the time of registration. These volunteer hours can apply to the participant themselves or to a direct relation of the volunteer.</p>
                    <p><strong>Volunteer Commitment and Scheduling:</strong> After the bursary application is submitted, the registrant will work with the KYO Operations or Program Manager to create a volunteer schedule that fits both the needs of the organization and the individual’s availability. Volunteer hours must be worked during KYO programming times and will be coordinated by the Operations or Program Manager to ensure that the hours align with KYO’s operational needs. Individuals receiving the volunteer bursary are expected to volunteer in a regular, scheduled capacity. This commitment ensures that KYO can rely on consistent support, and it allows the volunteer to meet their bursary obligations in a timely and structured manner.</p>
                    <p><strong>Non-Completion of Volunteer Hours:</strong> If a volunteer fails to meet their agreed-upon volunteer hours, they will be responsible for paying the entire or remaining balance of the program fees, as determined by the Operations Manager. The amount due will be calculated based on the number of hours worked so far. If only a portion of the volunteer hours has been completed, the remaining hours will be converted into a financial obligation. The volunteer bursary program is designed to help those in need while also ensuring that KYO receives the necessary support to keep its programs running smoothly. We encourage all volunteers to stay committed to their agreed schedules to avoid any financial penalties.</p>

                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Youth-Teacher-Volunteer Interactions Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>The Kawartha Youth Orchestra is committed to creating a safe, respectful, and inclusive environment for all its participants, including youth, teachers, and volunteers. This policy outlines the expected conduct and guidelines for interactions among youth, teachers, and volunteers within the organization.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Code of Conduct</h4>
                    <p><strong>Expected Behavior for Students, Teachers, and Volunteers:</strong> All participants are expected to treat each other with respect and dignity, act in a manner that promotes a positive, inclusive, and supportive environment, communicate openly, honestly, and with consideration for others, refrain from any form of bullying, harassment, or discrimination, and follow all KYO policies and procedures.</p>
                    <p><strong>Respect and Inclusion:</strong> The KYO values diversity and inclusivity. All participants must respect cultural, ethnic, religious, and personal differences, promote an inclusive atmosphere where everyone feels welcome and valued, and avoid language or actions that may be perceived as offensive or discriminatory.</p>
                    <p>Details on the code of conduct or expectations as they relate to specific KYO programs can be found in the code of conduct, musicians handbook, or other documentation provided for specific programs.</p>

                    <h4 className="font-bold text-lg font-headline text-foreground">Mandatory Reporting</h4>
                    <p><strong>Child Protection Policies:</strong> KYO is committed to the safety and well-being of all its youth participants. All teachers and volunteers must adhere to child protection policies and procedures, recognize signs of abuse and neglect, and understand their obligation to report any suspicions.</p>
                    <p><strong>Reporting Procedures for Suspected Abuse:</strong> In cases of suspected abuse or neglect, concerns must be immediately reported via email as follows:</p>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li>If the abuse relates to someone not on the HR committee: report to the HR Committee at {hrCommitteeLink ? <Link href={hrCommitteeLink.url} className="text-primary underline">{hrCommitteeLink.url.replace('mailto:', '')}</Link> : 'hr-committee@thekyo.ca'}.</li>
                        <li>If the abuse relates to someone on the HR committee or the Board of Directors: report to the Chair of the Board of Directors at {chairLink ? <Link href={chairLink.url} className="text-primary underline">{chairLink.url.replace('mailto:', '')}</Link> : 'chair@thekyo.ca'}.</li>
                        <li>If the abuse relates to the Chair: Report to the Program Manager.</li>
                    </ul>
                    <p>Confidentiality must be maintained to ensure the privacy of the individuals involved. Additionally, legal requirements for reporting to the appropriate authorities must be followed.</p>

                    <h4 className="font-bold text-lg font-headline text-foreground">Communication Policy</h4>
                    <p><strong>Guidelines for Communication:</strong> All communications within the Kawartha Youth Orchestra (KYO) must be professional, respectful, and appropriate. Approved channels for communication, such as official KYO email addresses and platforms, should always be used. Personal contact information should only be shared when necessary and with proper permissions. Individuals working with the KYO are prohibited from interacting with youth participants through any platform not designated by the KYO. While participants over the age of majority may choose to communicate with instructors or volunteers outside of these approved channels, such communications are considered personal and fall outside the professional scope of KYO staff and volunteers.</p>
                    <p><strong>Digital Communication and Social Media Guidelines:</strong> Professionalism must be maintained in all digital communication and social media interactions. Avoid private messaging with youth participants; use group messages or official channels instead. Do not post or share content that could harm the reputation of KYO or its members, including through personal channels. Failure to adhere to these guidelines may result in termination from the program or employment.</p>

                    <h4 className="font-bold text-lg font-headline text-foreground">Training and Awareness</h4>
                    <p><strong>General Information:</strong> The Kawartha Youth Orchestra (KYO) provides general information on maintaining effective, professional, and safe working relationships between youth and teachers/volunteers. Individuals employed by or working with the KYO should ask a member of the HR committee if they have any questions regarding such guidelines.</p>
                    <p><strong>Information for Participants and Families:</strong> KYO discussed with participants and their families regarding appropriate program behaviour each semester and as needed in an ongoing capacity.</p>

                    <h4 className="font-bold text-lg font-headline text-foreground">Volunteer Engagement</h4>
                    <p><strong>Roles and Responsibilities:</strong> Volunteers must understand their roles and the expectations set forth by KYO, and adhere to all KYO policies and procedures. The KYO provides training for volunteers and ongoing support and resources to ensure volunteers can perform their duties effectively. Volunteers joining the organization from secondary schools requiring their hours to be registered and signed off on must be actively engaged for the entire duration of their volunteering. Hours will only be signed for at the end of the KYO semester.</p>
                    <p><strong>Recognition and Appreciation:</strong> KYO values the contributions of its volunteers and will recognize and appreciate volunteer efforts through regular acknowledgment and formal events. KYO volunteers receive a 100% bursary to any KYO programs they choose to participate in, for the duration of their time volunteering. See our Volunteer Bursaries for more information.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Health and Safety Policies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>The Kawartha Youth Orchestra (KYO) is committed to ensuring the health, safety, and well-being of all students, staff, volunteers, and visitors. Our comprehensive Health and Safety Policies are designed to provide a safe and supportive environment for musical education and performance. These policies are in alignment with generally accepted health and safety standards and aim to prevent accidents, injuries, and illnesses. All members of the KYO community are expected to adhere to these guidelines.</p>
                    
                    <h4 className="font-bold text-lg font-headline text-foreground">Emergency Procedures</h4>
                    <p>In the event of an emergency, it is crucial that all staff, volunteers, and students are familiar with the established procedures to ensure a prompt and effective response.</p>
                    <p><strong>Evacuation Plans:</strong> Fire: In case of a fire, immediately activate the nearest fire alarm and evacuate the building following the posted evacuation routes. Do not use the elevator. Gather in the overflow parking lot located behind the Sanctuary. Other Emergencies: For emergencies such as gas leaks or structural damage, follow the specific instructions given by the KYO representative or emergency personnel.</p>
                    <p><strong>Medical Emergencies:</strong> First aid kits are located in the KYO office, and designated staff members are trained in basic first aid and CPR. In the event of a medical emergency, contact a trained staff member immediately. When administering first aid, staff members and volunteers must take reasonable steps to ensure the safety of both the youth in their care and themselves. It is crucial to remain within the scope of your first aid training. Any actions taken beyond this scope are considered personal acts and are not permitted by KYO staff or volunteers. Each student’s emergency contact information is kept on file and should be updated regularly. Parents or guardians will be notified as soon as is reasonably possible in the event of a medical emergency involving their child.</p>

                    <h4 className="font-bold text-lg font-headline text-foreground">Health Guidelines</h4>
                    <p>Maintaining a healthy environment is essential for the well-being of everyone involved in KYO activities. These health guidelines help prevent the spread of illness and ensure that all participants can safely enjoy their musical education. By adhering to these Health and Safety Policies, KYO aims to create a secure and healthy environment for all participants. These policies are regularly reviewed and updated to ensure they meet current standards and address the evolving needs of our community. We appreciate the cooperation of all students, parents, staff, and volunteers in upholding these standards and contributing to the overall safety and success of our programs.</p>
                    <p><strong>Illness and Injury Policies:</strong> Students, staff, and volunteers should stay home if they are feeling unwell or exhibit symptoms of contagious illnesses, such as fever, cough, or gastrointestinal issues. Any contagious illness should be reported to the KYO administration as soon as possible to inform other participants and take necessary precautions.</p>
                    <p><strong>Immunization Requirements:</strong> All participants are encouraged to be up to date with recommended vaccinations. This is particularly important for communicable diseases such as COVID-19, measles, mumps, rubella, and influenza.</p>
                    <p><strong>COVID-19 Policies:</strong> In response to the ongoing COVID-19 pandemic, KYO Board of Directors has implemented specific policies to protect the health and safety of our community. These policies may be updated based on public health guidelines and the COVID-19 situation as it evolves. When active, this policy entails:</p>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li><strong>Masking and Social Distancing:</strong> Masks are required indoors for all participants unless they are playing a wind instrument or singing. Masks should cover both the nose and mouth. Maintain a minimum distance of six feet from others whenever possible. Seating arrangements and practice spaces will be adjusted to support this guideline.</li>
                        <li><strong>Vaccination Requirements:</strong> All eligible participants are required to be fully vaccinated against COVID-19. Proof of vaccination may be required for participation in certain events or activities.</li>
                    </ul>
                    
                    <h4 className="font-bold text-lg font-headline text-foreground">Incident Reporting</h4>
                    <p>All accidents, injuries, and safety incidents must be reported to the KYO administration immediately. An incident report form must be completed and reviewed to identify areas for improvement and prevent future occurrences if external medical staff are required. An incident report may be required by the Board of Directors as determined situationally.</p>

                    <h4 className="font-bold text-lg font-headline text-foreground">Food Safety and Nutrition</h4>
                    <p><strong>Food Preparation:</strong> All food must be prepared and handled in accordance with food safety guidelines to prevent contamination and foodborne illnesses. One member of the KYO staff or volunteers must have their food handlers certificate at all times. The KYO follows all guidelines as set by Public Health Ontario.</p>
                    <p><strong>Allergy Management:</strong> Parents or guardians must inform KYO of any food allergies their child has. This information will be recorded and communicated to staff and volunteers. Efforts will be made to avoid providing snacks that contain common allergens, such as nuts, when students with allergies are present, however, for individuals with life-threatening allergies, the KYO can not guarantee the space will be allergen free, and we recommend parents or guardians visit the space and discuss with program staff before registering their children.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Privacy and Data Protection Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>The KYO is committed to protecting the privacy and personal information of our students, parents, volunteers, staff, and all other stakeholders. This Privacy and Data Protection Policy outlines our practices regarding the collection, use, storage, and disclosure of personal information. It is designed to comply with generally accepted health and safety policies, as well as applicable privacy laws and regulations. The KYO strives to ensure the confidentiality, integrity, and security of personal information, fostering trust and accountability within our community.</p>

                    <h4 className="font-bold text-lg font-headline text-foreground">Data Collection Practices</h4>
                    <p>We collect personal information necessary for the effective operation, reporting, granting, and sponsorship and donation solicitation of our programs and services. The types of information we collect include, but are not limited to:</p>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li><strong>Personal Identification Information (PII):</strong> Name, address, phone number, email address, date of birth, and emergency contact information;</li>
                        <li><strong>Health Information:</strong> Medical conditions, allergies, medications, and immunization records, necessary for ensuring the safety and well-being of our participants;</li>
                        <li><strong>Educational Information:</strong> School enrollment details, and music proficiency levels;</li>
                        <li><strong>Financial Information:</strong> Payment details for tuition and fees, scholarship applications, and donation records; and</li>
                        <li><strong>Parental/Guardian Information:</strong> Contact details and consent forms for minors participating in our programs.</li>
                    </ul>
                    <p>We collect this information through various means, including registration forms, consent forms, surveys, and direct communication with parents and guardians.</p>

                    <h4 className="font-bold text-lg font-headline text-foreground">Use and Storage of Data</h4>
                    <p>The personal information we collect is used for the following purposes:</p>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li><strong>Program Administration:</strong> Managing student enrollment, class assignments, and attendance records;</li>
                        <li><strong>Health and Safety:</strong> Ensuring the well-being of students during KYO activities, responding to medical emergencies, and maintaining compliance with health regulations;</li>
                        <li><strong>Communication:</strong> Providing updates on program activities, schedule changes, and important announcements to parents and guardians;</li>
                        <li><strong>Financial Administration:</strong> Processing payments, managing scholarships, and issuing tax receipts for donations;</li>
                        <li><strong>Performance Evaluation:</strong> Tracking student progress and providing feedback to improve our educational offerings;</li>
                        <li><strong>Program Evaluation:</strong> Determining the success of identifying and reaching targeted demographics, if any, and determining the impact of programming;</li>
                        <li><strong>Granting and Grant Administration:</strong> Providing or verifying compliance with or applicability of existing or future grants;</li>
                        <li><strong>Donation and Sponsorship Solicitation:</strong> Providing or describing demographic, market, or program participant information to potential donors or sponsors;</li>
                        <li>Other purposes as would reasonably be taken by other similar organizations, or as required by governing law, previous reporting requirements, or existing contractual relationships.</li>
                    </ul>
                    <p>We store personal information securely, using both physical and electronic safeguards. Access to personal information is restricted to authorized personnel only, and we employ measures such as encryption, password protection, and secure storage facilities to prevent unauthorized access, disclosure, or loss of data.</p>

                    <h4 className="font-bold text-lg font-headline text-foreground">Privacy Policy</h4>
                    <p>We respect the privacy of our stakeholders and are committed to protecting personal information. Our privacy practices include:</p>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li><strong>Consent:</strong> We obtain explicit consent from individuals or their guardians before collecting, using, or disclosing personal information, except where permitted or required by law;</li>
                        <li><strong>Access and Correction:</strong> Individuals have the right to access their personal information held by KYO and request corrections to any inaccuracies. Requests can be made in writing to our {itAdminLink ? <Link href={itAdminLink.url} className="text-primary underline">{itAdminLink.url.replace('mailto:', '')}</Link> : 'it-admin@thekyo.ca'};</li>
                        <li><strong>Data Retention:</strong> We retain personal information only as long as necessary to fulfill the purposes for which it was collected or as required by law. Once information is no longer needed, we securely dispose of it;</li>
                        <li><strong>Disclosure:</strong> We do not disclose personal information to third parties without consent, except for service providers acting on our behalf or as required by law. All third-party service providers are contractually obligated to protect the confidentiality and security of personal information; and</li>
                        <li><strong>Annonysation:</strong> Data anonymization is a type of information sanitization whose intent is privacy protection. The KYO only provides anonymized data to grantors, donors, sponsors, or other institutions or public bodies as required, unless required otherwise as a result of by governing law, previous reporting requirements, or existing contractual relationships.</li>
                    </ul>
                    
                    <h4 className="font-bold text-lg font-headline text-foreground">Rights of Students and Parents</h4>
                    <p>We recognize the rights of students and parents concerning their personal information. These rights include:</p>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li><strong>Right to Information:</strong> Individuals have the right to know what personal information we collect, how it is used, and to whom it is disclosed;</li>
                        <li><strong>Right to Access:</strong> Individuals can request access to their personal information and obtain a copy;</li>
                        <li><strong>Right to Correction:</strong> Individuals can request corrections to their personal information if they believe it is inaccurate or incomplete; and</li>
                        <li><strong>Right to Withdraw Consent:</strong> Individuals can withdraw their consent for the use and disclosure of their personal information at any time, subject to legal and contractual restrictions. Withdrawing consent for data use or retention may be treated as a withdrawal from KYO programming, and may result in termination of rights to KYO programming. The right to withdraw consent is specifically governed by the Personal Information Protection and Electronic Documents Act (S.C. 2000, c. 5), and, where a disagreement occurs, the act takes precedence over this document.</li>
                    </ul>

                    <h4 className="font-bold text-lg font-headline text-foreground">Security Measures</h4>
                    <p>We are committed to protecting personal information through appropriate security measures, including:</p>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li><strong>Physical Security:</strong> Securing physical records in locked cabinets and controlling access to facilities where personal information is stored;</li>
                        <li><strong>Technical Security:</strong> Using encryption, secure servers, password protection for electronic records, and other methods as would reasonably be expected by similar organizations or industry standards; and</li>
                        <li><strong>Administrative Security:</strong> Implementing policies and procedures to safeguard personal information, including staff training on privacy and data protection best practices.</li>
                    </ul>

                    <h4 className="font-bold text-lg font-headline text-foreground">Contact Information</h4>
                    <p>For any questions, concerns, or requests regarding your personal information, please contact us at:</p>
                    <div className="pl-4">
                        <p>Kawartha Youth Orchestra</p>
                        <p>Address: P.O. Box 53, 150 King Street, Peterborough, Ontario, K9J 6Y5</p>
                        <p>Email: {itAdminLink ? <Link href={itAdminLink.url} className="text-primary underline">{itAdminLink.url.replace('mailto:', '')}</Link> : 'it-admin@thekyo.ca'}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Inclusivity and Non-Discrimination Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <h4 className="font-bold text-lg font-headline text-foreground">Equal Opportunity</h4>
                    <p>The KYO is committed to providing equal opportunities for all individuals regardless of race, ethnicity, color, religion, creed, national origin, ancestry, citizenship status, sex, gender identity, sexual orientation, age, marital status, disability, or any other protected characteristic as defined by the Ontario Human Rights Commission and the Canadian Human Rights Commission. We believe in fostering an inclusive environment where everyone is treated with dignity, respect, and fairness.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Non-Discrimination</h4>
                    <p>KYO prohibits discrimination in all aspects of its operations, including recruitment, enrollment, participation, employment, and access to programs and services. Discrimination or harassment based on any protected characteristic is strictly prohibited and will not be tolerated. Any form of discriminatory behavior, including but not limited to verbal, physical, or visual harassment, will result in disciplinary action, up to and including termination of enrollment or employment.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Accessibility Accommodations</h4>
                    <p>KYO is committed to providing reasonable accommodations to ensure equal access and participation for individuals with disabilities. We will work closely with individuals to identify and implement appropriate accommodations to facilitate their full inclusion in our programs and activities. Requests for accommodations should be directed to the KYO by email to {mainContactLink ? <Link href={mainContactLink.url} className="text-primary underline">{mainContactLink.url.replace('mailto:', '')}</Link> : 'contactus@thekyo.ca'}. We will work with the individual to assess needs and implement accommodations in accordance with applicable laws and regulations.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Cultural Competency</h4>
                    <p>KYO recognizes the importance of cultural competency in creating an inclusive environment. We are committed to promoting cultural awareness, understanding, and sensitivity among our staff, volunteers, students, and families. The KYO makes reasonable efforts to ensure that our programs and services are culturally responsive and respectful of the diverse backgrounds and experiences of our participants. We encourage open dialogue and collaboration to foster a sense of belonging and mutual respect within our community.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Compliance and Accountability</h4>
                    <p>All members of the KYO community are expected to uphold the principles of inclusivity and non-discrimination in their interactions and conduct. Violations of this policy will be promptly investigated, and appropriate corrective action will be taken, which may include education, counseling, disciplinary measures, or termination of enrollment or employment. The KYO is committed to fostering a culture of accountability and continuous improvement in support of our mission to provide equitable access to music education for all.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Intellectual Property Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>This Intellectual Property Policy governs the ownership, use, and protection of intellectual property assets created or utilized by the KYO, ensuring the organization’s rights are respected and maintained while providing clarity and guidance to all members and stakeholders.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Ownership of Intellectual Property</h4>
                    <p>All intellectual property (IP) created, developed, or produced by employees, volunteers, contractors, or students of the KYO during the course of their engagement with the organization shall be the sole property of the KYO. IP includes, but is not limited to, original musical compositions, arrangements, recordings, educational materials, written content, artwork, logos, trademarks, and any other creative works. The KYO retains all rights, title, and interest in and to the IP, including the right to use, reproduce, distribute, display, perform, and modify the IP for organizational purposes.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Use of KYO Materials</h4>
                    <p>Members, including students, teachers, volunteers, and staff, may use KYO materials (e.g., sheet music, educational resources, logos) solely for authorized KYO activities and programs. Unauthorized use, reproduction, or distribution of KYO materials is strictly prohibited and may result in disciplinary action or termination from KYO programming.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Licensing and Permissions</h4>
                    <p>Permission to use KYO materials for external purposes, including performances, recordings, publications, or any other commercial or non-commercial use, must be obtained from the KYO Board of Directors or Program Manager.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Media Release</h4>
                    <p>By participating in KYO programs and activities, members consent to the use of their likeness, name, voice, or other personal attributes in photographs, videos, recordings, or other media for promotional, educational, or archival purposes. Members in some programs may be required to submit a media release waiver upon registration. This requirement will be at the discretion of the Board of Directors.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Media Release Opt-Out</h4>
                    <p>Members have the right to opt out of media release by submitting a written request. Although members can choose to opt out, such opt-outs may limit the member’s participation in certain KYO activities.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Enforcement</h4>
                    <p>The KYO reserves the right to take legal action against any individual or entity found to have infringed upon its intellectual property rights. Any member found to have violated this Intellectual Property Policy may be subject to disciplinary action, up to and including termination of membership or legal proceedings.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Code of Conduct</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <h4 className="font-bold text-lg font-headline text-foreground">Student Code of Conduct</h4>
                    <p>The KYO is committed to providing a positive and inclusive environment for all participants. To ensure a safe and enjoyable experience for everyone, we have established this Code of Conduct.</p>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li><strong>Respect and Courtesy:</strong> Treat fellow participants, instructors, and staff with kindness and respect. Listen attentively during rehearsals and follow the instructions of the instructors.</li>
                        <li><strong>Punctuality:</strong> Arrive on time for rehearsals, lessons, and performances. Notify the program attendance email ({attendanceLink ? <Link href={attendanceLink.url} className="text-primary underline">{attendanceLink.url.replace('mailto:', '')}</Link> : 'attendance@thekyo.ca'}) in advance if you are unable to attend a session.</li>
                        <li><strong>Instrument Care:</strong> Respect and care for program instruments and equipment. Report any damages promptly to the class instructor or program manager.</li>
                        <li><strong>Personal Responsibility:</strong> Be responsible for your personal belongings. Upbeat staff will designate places for belongings to be kept when not in use.</li>
                        <li><strong>Communication:</strong> Express concerns or questions to instructors in a constructive manner. Avoid disruptive behavior during lessons, rehearsals, and performances.</li>
                    </ul>
                    <h4 className="font-bold text-lg font-headline text-foreground">Behavior Management</h4>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li><strong>Discussion with the Student:</strong> If a participant exhibits inappropriate behavior, the instructor will have a private conversation with the student. The purpose is to address the issue, provide feedback, and encourage a positive change in behavior.</li>
                        <li><strong>Discussion with Parents/Guardians:</strong> If the inappropriate behavior persists, the program manager will schedule a meeting with the parents/guardians. The goal is to discuss the concerns, collaborate on a resolution, and gain parental support for behavior improvement. Decisions concerning the parents of Upbeat participants are up to the discretion of the Youth Worker for the first behavioral violation, however, any further violations must result in a discussion with the parents held by a member of administrative staff or the program manager.</li>
                        <li><strong>Program Suspension:</strong> If the behavior continues despite previous interventions, the participant may face a temporary suspension from the program, as determined by the program manager. The duration of the suspension will be determined by the severity and recurrence of the behavior. Reinstatement will be contingent upon the participant’s commitment to improved behavior and adherence to the Code of Conduct.</li>
                    </ul>
                    <p>We believe that these guidelines will contribute to a positive and enriching experience for everyone involved in Upbeat!. Thank you for your cooperation and commitment to creating a supportive musical community.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Liability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>By enrolling in the Kawartha Youth Orchestra (KYO) programs and activities, the undersigned participant and any listed sponsoring adult(s) agree to the following liability conditions:</p>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li><strong>Assumption of Risk:</strong> The participant and their guardians understand and acknowledge that participation in KYO programs, including rehearsals, performances, and other related activities, involves inherent risks similar to other musical or afterschool programs. These risks may include, but are not limited to, physical injury, property damage, and other potential hazards. The participant and their guardians voluntarily assume all such risks associated with participation.</li>
                        <li><strong>Release of Liability:</strong> The participant and their guardians hereby release, waive, discharge, and covenant not to sue KYO, its officers, directors, employees, volunteers, agents, and representatives from any and all liabilities, claims, demands, actions, or causes of action that may arise from participation in KYO programs and activities, whether caused by negligence or otherwise.</li>
                        <li><strong>Indemnification:</strong> The participant and their guardians agree to indemnify and hold harmless KYO, its officers, directors, employees, volunteers, agents, and representatives from any and all claims, demands, losses, liabilities, damages, costs, and expenses, including attorney fees, arising out of or related to participation in KYO programs and activities.</li>
                        <li><strong>Medical Consent:</strong> In the event of an emergency, the participant and their guardians authorize KYO and its representatives to secure medical treatment, including hospitalization, necessary for the participant’s health and safety. The participant and their guardians agree to assume responsibility for any medical costs incurred.</li>
                        <li><strong>Severability:</strong> If any provision of this waiver is found to be unenforceable or invalid, the remaining provisions shall remain in full force and effect.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Anti-Bullying and Harassment Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>The Kawartha Youth Orchestra (KYO) is committed to providing a safe and inclusive environment for all participants, including musicians, volunteers, staff, and audience members. We believe in fostering a culture of respect, kindness, and acceptance. This Anti-Bullying and Harassment Policy outlines our commitment to preventing and addressing bullying and harassment within our organization. This policy applies to all individuals associated with the Kawartha Youth Orchestra, including but not limited to musicians, volunteers, staff, contractors, and audience members.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Definitions</h4>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li><strong>Bullying:</strong> Bullying is defined as any unwanted, aggressive behavior that involves a real or perceived power imbalance. This behavior is repeated over time and may take various forms, such as physical, verbal, social, or cyberbullying.</li>
                        <li><strong>Harassment:</strong> Harassment is defined as any unwelcome conduct, comment, gesture, or display that creates an intimidating, hostile, or offensive environment. Harassment may be based on race, color, religion, sex, national origin, age, disability, or any other protected status.</li>
                    </ul>
                    <h4 className="font-bold text-lg font-headline text-foreground">Prohibited Conduct</h4>
                    <p>The Kawartha Youth Orchestra strictly prohibits:</p>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li>Bullying in any form;</li>
                        <li>Harassment based on race, color, religion, sex, national origin, age, disability, or any other protected status; and</li>
                        <li>Retaliation against individuals who report bullying or harassment.</li>
                    </ul>
                    <h4 className="font-bold text-lg font-headline text-foreground">Responsibilities</h4>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li><strong>Participants:</strong> All participants in KYO programs are responsible for treating each other with respect and reporting any incidents of bullying or harassment.</li>
                        <li><strong>Staff and Volunteers:</strong> Staff and volunteers are responsible for taking appropriate action to prevent and address bullying and harassment. This includes promptly reporting incidents and providing support to those affected.</li>
                        <li><strong>Leadership:</strong> The leadership of the KYO is committed to creating a safe environment, conducting thorough investigations, and taking appropriate disciplinary action when necessary.</li>
                    </ul>
                    <h4 className="font-bold text-lg font-headline text-foreground">Reporting Procedures</h4>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li>Individuals who experience or witness bullying or harassment should report the incident to a staff member, volunteer, or organizational leader.</li>
                        <li>Reports may be made verbally or in writing and will be treated with confidentiality to the extent permitted by law.</li>
                        <li>The Kawartha Youth Orchestra will promptly investigate all reports and take appropriate corrective action.</li>
                    </ul>
                    <h4 className="font-bold text-lg font-headline text-foreground">Disciplinary Action</h4>
                    <p>Failure to adhere to the guidelines outlined in this Anti-Bullying and Harassment Policy may lead to disciplinary measures, ranging from suspension or expulsion from participation in Kawartha Youth Orchestra programming, to the termination of volunteer or staff positions. The severity and frequency of the behavior will be considered in determining the appropriate course of action.</p>
                    <p>The KYO is committed to maintaining a positive and inclusive environment where everyone can participate and enjoy the benefits of music without fear of bullying or harassment. We believe that by fostering respect and understanding, we can create a vibrant and supportive community for all.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Surveys and Survey Collection Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>To support this mission, measure our impact, and for reporting program impact to governmental bodies and sponsoring organizations, the KYO may conduct periodic surveys and collect data from our program participants and their families. By participating in KYO programs, you consent to the collection, use, and disclosure of information necessary for the support, direction, and implementation of our programs. This policy outlines the purposes, use, confidentiality, and rights associated with our data collection practices.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Purpose of Data Collection</h4>
                    <p>The primary purposes of collecting survey responses and other data are to enhance and tailor our programs to better meet the needs of our participants, fulfill any requirements mandated by applicable legislation, and comply with contractual obligations with our funding partners and stakeholders. These activities are essential to ensure the continued improvement and success of our programs.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Use of Information</h4>
                    <p>The information collected through surveys and other means will be used exclusively for internal purposes related to program improvement and reporting. We will anonymize personal information wherever possible to protect the privacy of our participants. All collected data will be securely stored and will only be accessible to authorized KYO staff and contractors who require access to this information to perform their duties.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Confidentiality and Privacy</h4>
                    <p>The KYO is committed to maintaining the confidentiality and privacy of all collected data in accordance with the Personal Information Protection and Electronic Documents Act (PIPEDA) and other relevant laws. We take all necessary precautions to safeguard personal information from unauthorized access, use, or disclosure. We will not share or sell personal information to third parties for marketing or other purposes without obtaining explicit consent from the participants or their guardians.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Participant Rights</h4>
                    <p>Participation in KYO surveys is entirely voluntary. You may choose to opt out of any survey without affecting your child’s involvement in KYO programs. Additionally, you have the right to access, correct, or request the deletion of your personal data held by the KYO at any time. To exercise these rights, please contact our administrative office.</p>
                    <p>By registering your child in KYO programs, you acknowledge and agree to these terms regarding surveys and data collection. Your cooperation and feedback are invaluable in helping us provide high-quality, accessible music education and fostering a vibrant musical community.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Termination and Withdrawal Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>This Termination and Withdrawal Policy outlines the procedures and guidelines for participants in any Kawartha Youth Orchestra programs, including Upbeat (“Program”) who wish to terminate their enrollment or withdraw from the Program. It also addresses the organization’s stance on refunds in accordance with the Not-for-Profit Corporations Act, 2010, S.O. 2010.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Withdrawal from Programming</h4>
                    <p>Participants or their legal guardians must follow the outlined procedures below when terminating or withdrawing from the Program:</p>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li><strong>Notification:</strong> To terminate enrollment or withdraw from the Program, participants or their legal guardians must submit notice by email to {attendanceLink ? <Link href={attendanceLink.url} className="text-primary underline">{attendanceLink.url.replace('mailto:', '')}</Link> : 'attendance@thekyo.ca'}. The notice should include the participant’s full name, contact information, and the reason for termination or withdrawal.</li>
                    </ul>
                    <h4 className="font-bold text-lg font-headline text-foreground">Refund Policy</h4>
                    <p>Refer to Financial Policies: Refund Policies for more information.</p>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li><strong>Tuition and Program Fees:</strong> Tuition and program fees paid in advance are non-refundable after the start of the Program in accordance with the Not-for-Profit Corporations Act, 2010, S.O. 2010, c. 15, Part IX, Section 89 (1)(2).</li>
                        <li>In the event of termination or withdrawal before the Program start date, a partial refund in the form of crediting accounts receivable may be considered, subject to administrative and processing fees and prorated to the end of the closest operating semester.</li>
                        <li>Registration in Kawartha Youth Orchestra programming means an acceptance of the fees owed, including payment of any fees following the termination of a participant’s membership.</li>
                        <li>Pursuant to this legal framework, the organization is unable to offer refunds for fees paid due to the nature of its non-profit, charitable, public benefit corporation status.</li>
                    </ul>
                    <h4 className="font-bold text-lg font-headline text-foreground">Exceptions</h4>
                    <p>No exceptions to the refund policy can be made due to the Kawartha Youth Orchestra’s status as a public benefit corporation.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Termination by the Program</h4>
                    <p>The Program reserves the right to terminate a participant’s enrollment for reasons including but not limited to violation of Program policies, disruptive behavior, or non-compliance with program requirements. In such cases, the Program will still be unable to offer refunds.</p>
                    <p>It is each participant’s responsibility to be aware of and understand the nature and requirements the Kawartha Youth Orchestra expects for continued participation in KYO programming.</p>
                    <h4 className="font-bold text-lg font-headline text-foreground">Assumed Withdrawal</h4>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li><strong>Notification:</strong> The music program coordinator or designated staff member will notify the member in writing after the first and second unexplained absences, emphasizing the importance of regular attendance and providing an opportunity for the member to explain the absences.</li>
                        <li><strong>Presumed Withdrawal:</strong> If a member accumulates three consecutive unexplained absences, they will be presumed to have voluntarily withdrawn from the program. The member will be notified in writing of this presumption and the implications thereof.</li>
                        <li><strong>Membership Fee Handling:</strong> No refund will be provided for membership fees paid for the semester in which the assumed withdrawal occurs. Unpaid membership fees for future semesters will be deemed not-payable. For members that have prepaid for the season, the KYO will be unable to offer refunds in accordance with our Refund policy.</li>
                    </ul>
                    <h4 className="font-bold text-lg font-headline text-foreground">Re-Registration Process</h4>
                    <ul className="list-disc list-outside pl-6 space-y-1">
                        <li><strong>Process:</strong> Re-registration in Kawartha Youth Orchestra programs</li>
                        <li><strong>Availability of Space:</strong> Re-registration is subject to the availability of space in the music program.</li>
                        <li><strong>Timely Re-registration:</strong> To utilize the membership fees for re-registration, the member must submit a re-registration request within the same semester they were last in the program.</li>
                        <li><strong>Reinstatement Fee:</strong> If the member wishes to re-register after the semester in which they were last enrolled, a second registration fee may apply.</li>
                    </ul>
                    <h4 className="font-bold text-lg font-headline text-foreground">Appeals</h4>
                    <p>A member who disputes the assumed withdrawal status may submit a written appeal to the program manager within 14 days of receiving the assumed withdrawal notification. The program manager will review the appeal and provide a written response within 30 days.</p>
                </CardContent>
            </Card>
        </div>
      </section>
    </div>
  );
}

    