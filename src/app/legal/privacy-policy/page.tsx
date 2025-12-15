
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLinkById } from "@/lib/links";
import { getImageById } from "@/lib/image-service-server";
import Link from "next/link";

export default async function PrivacyPolicyPage() {
  const headerImage = await getImageById('page-header-privacy');
  const dpoLink = getLinkById('contact-dpo');

  return (
    <div>
      <PageHeader
        title="Privacy & Cookie Policy"
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
                    <p>
                        Kawartha Youth Orchestra, its subsidiaries, and its affiliates (“Kawartha Youth Orchestra”, “KYO”, “we”, “us”, “our”) respect your privacy and are committed to protecting your personal data. This Privacy & Cookie Policy (also referred to as Privacy Policy) describes our data collection and processing activities, including:
                    </p>
                    <ul className="list-decimal list-outside pl-6 space-y-2">
                        <li>what personal data we may collect when you interact with us through our various channels online (such as our website at https://kawarthayouthorchestra.org, https://thekyo.ca and via our apps and social networks) and offline (such as over the telephone, via text, messaging application, in meetings or at events) and what we may do with that personal data;</li>
                        <li>how we may collect and process information through the use of cookies and related tracking technologies on our online channels; and</li>
                        <li>your data protection rights, including (where applicable) a right to object to processing and a right to withdraw your consent to processing, and how to exercise them.</li>
                    </ul>
                    <p>
                        When we refer to “personal data” in this Privacy Policy we are referring to any information that falls under the definition of “personal data” in the Personal Information Protection and Electronic Documents Act.
                    </p>
                    <p>
                        It is important that you read this Privacy & Cookie Policy together with any other privacy notice or fair processing notice we may provide on specific occasions when we are collecting or processing personal data about you, so that you are fully aware of how and why we are using your data. This Privacy & Cookie Policy supplements the other notices and is not intended to override them.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">1. Important Information and Who We Are</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                        Kawartha Youth Orchestra is responsible for the processing of your personal data as described in this Privacy Policy. For the purposes of the Personal Information Protection and Electronic Documents Act, in respect of our core service offerings, Kawartha Youth Orchestra acts as the controller, business, and personal information processor, respectively, of such personal data.
                    </p>
                    <p>
                        The contact details of Kawartha Youth Orchestra’s Data Protection Officer are provided in Section 11 below.
                    </p>
                    
                    <h4 className="font-bold text-lg font-headline pt-2 text-foreground">1.1. Updates to this privacy & cookie policy</h4>
                    <p>
                        This Privacy & Cookie Policy may be updated periodically. We will update the date at the top of this Privacy & Cookie Policy accordingly and encourage you to check for changes to this Privacy & Cookie Policy, which will be available on our website. On some occasions, we may also actively advise you of specific data handling activities or significant changes to this Privacy & Cookie Policy, as required by applicable law.
                    </p>

                    <h4 className="font-bold text-lg font-headline pt-2 text-foreground">1.2 Third-party links</h4>
                    <p>
                        Our website(s) may include links to or functionality from third-party websites, plug-ins and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements. When you leave our website, we encourage you to read the privacy policy of every website you visit.
                    </p>
                    
                    <h4 className="font-bold text-lg font-headline pt-2 text-foreground">1.3 Kawartha Youth Orchestra as Data Processor</h4>
                    <p>
                        From time to time, Kawartha Youth Orchestra may process personal data in the role of a service provider on behalf of partner organizations, funders, or program collaborators. For example, this may occur where we facilitate surveys, grant reporting, program evaluations, or other forms of data collection requested by a partner. In these cases, the partner organization acts as the data controller and maintains its own privacy and data security practices, which will also apply. Kawartha Youth Orchestra will, however, support our partners as necessary to respond to any requests you may have regarding the processing of your personal data. If you require further information about a partner’s data processing activities, please contact us using the details in Section 11.
                    </p>
                    <p>
                        Please note that if you participate in a survey facilitated by Kawartha Youth Orchestra, this survey may either be administered by us on behalf of a partner or programmed by a third party directly on behalf of that partner. This Privacy Policy will apply to the processing of your survey responses where Kawartha Youth Orchestra administers the survey. Where the survey is administered by a third party, Kawartha Youth Orchestra will not collect, store, or otherwise process your survey results, and the third party and/or partner organization will have in place separate privacy and data security practices that apply.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">2. What personal data do we collect and how?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                        “Personal data” means any personally identifiable information belonging to an identifiable natural person, including but not limited to an identifier such as a name, an identification number, location data, an online identifier, or factors specific to the physical, economic, cultural, or social identity of that natural person, and for the avoidance of doubt, includes the term “personal data” as defined in the Personal Information Protection and Electronic Documents Act.
                    </p>
                    <h4 className="font-bold text-lg font-headline pt-2 text-foreground">2.1 Categories of Personal Data Collected</h4>
                    <p>
                        We may collect, create, use, store and otherwise process different categories of personal data depending on how you use and interact with our products, services and online channels. We have grouped these categories below as follows:
                    </p>
                    <ul className="list-disc list-outside pl-6 space-y-2">
                        <li><strong>Identifier Data</strong>, including first name, maiden name, last name, job title, and company name.</li>
                        <li><strong>Contact Data</strong>, including your address(es), email address(es), and telephone number(s).</li>
                        <li><strong>Profile Data</strong>, including your CV, professional background, professional headshot, languages spoken, location and country of residence, relevant qualifications, career history and moves, and any additional information, which may include special category personal data and sensitive personal information to the extent it is manifestly made public by you or you voluntarily choose to provide it to Kawartha Youth Orchestra in connection with a particular project or service offering.</li>
                        <li><strong>Due Diligence Data</strong>, including data you make publicly available (e.g., via social media and networking platforms) where required to meet specific anti money laundering, counter terrorism financing, anti-bribery legislation, or other regulatory requirements, or where needed to research, filter, and verify the experience and qualifications of board members, volunteers, employees, consultants, or contractors, or to screen for potential conflicts of interest.</li>
                        <li><strong>Identity Data</strong>, including a copy of your governmental ID and a photo of your face that contains facial scan or “biometric” data.</li>
                        <li><strong>Financial data</strong>, (if we need to pay you), including bank account details.</li>
                        <li><strong>Payment Data</strong>, (if you engage with Kawartha Youth Orchestra as a client, participant, or donor), including your card details and other information to process your payments, including your payment history and billing address.</li>
                        <li><strong>Transaction Data</strong>, including interactions you may have had with us (e.g., parties entering and exiting our conference bridge, duration and time of interactions), and any expert/client feedback.</li>
                        <li><strong>Marketing and Communications Data</strong>, including your preferences for receiving marketing from us and your communication preferences.</li>
                        <li><strong>Technical Data</strong>, including internet protocol (IP) address, login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access our website(s) and online services.</li>
                        <li><strong>Usage Data</strong>, including information about how you use our website, social media pages, apps, products, and services, including the URL clickstream to, through, and from our online channels (including date and time), products you viewed or searched for, the content that you view or interact with, page response times, download errors, length of visits to certain pages, page interaction information (such as scrolling, clicks, and mouse-overs or acceptance of our Terms of Engagement), and methods used to browse away from the page.</li>
                    </ul>

                    <h4 className="font-bold text-lg font-headline pt-2 text-foreground">2.2 Circumstances When we May Collect Your Personal Data</h4>
                    <p>
                        We may collect such categories of personal data either directly from you or from third parties and publicly available sources. We may ask you to confirm the accuracy of the personal data we process about you.
                    </p>

                    <h4 className="font-bold text-lg font-headline pt-2 text-foreground">2.3 Aggregating Your Personal Data</h4>
                    <p>
                        We aggregate your Usage Data with the information of other website visitors, experts and clients, creating a dataset of information about the usage of our online channels, our apps, products and services, and other general, grouped information about our user base. It provides a valuable insight into the use of our services and we may share it with select third parties. This dataset is aggregated and anonymized, meaning it cannot directly identify you as an individual and is not considered personal data.
                    </p>
                    <h4 className="font-bold text-lg font-headline pt-2 text-foreground">2.4 When am I Required to Provide Personal Data?</h4>
                    <p>
                        We may have a legal obligation to collect and process your personal data, or we may require your personal data in order to provide you with specific products and services, including accessing our platform.
                    </p>
                    <p>
                        If you fail to provide that data when requested, we may not be able to perform the contract we have or are trying to enter into with you, and/or the quality of the products and services we provide to you might be affected. In these circumstances, we may cancel a service you receive from us or stop proceeding with a contract we are trying to enter into with you, but we will notify you if this is the case at the time.
                    </p>
                    <p>
                        Please note that this does not apply to the collection of biometric data provided by contractors or consultants in applicable jurisdictions for identity verification purposes. The provision of biometric data is voluntary and will not, in any way, impact our payment obligations to you. However, we may be unable to engage you in any further engagements with Kawartha Youth Orchestra without first completing our identity check.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">3. Why we process your personal data and the lawful bases on which we rely</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        In accordance with the Personal Information Protection and Electronic Documents Act S.C. 2000, c. 5, we rely on a number of lawful bases to process your personal data.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">4. Personal Information and Personally Identifiable Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                        In certain situations, we may need to process, or ask third parties to process on our behalf, your special category personal data. Special category personal data means information that can reveal your racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic or biometric data (if used to uniquely identify that person), and information concerning a person’s health, sex life, or sexual orientation. We will also rely on your prior, explicit consent to process:
                    </p>
                    <p>
                        Profile Data that you voluntarily share with us that falls within the definition of special category personal data, including personal data revealing your racial or ethnic origin and data concerning your health or sexual orientation, for the purposes of facilitating specific projects that fall within that scope;
                    </p>
                    <p>
                        any facial scan data that is processed by an approved third party on our behalf to verify your identity.
                    </p>
                    <p>
                        Your consent is entirely voluntary and failure to provide consent will not prevent us from fulfilling our contractual obligations to you.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">5. Cookies and Related Technologies</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        Our website uses cookies to enhance functionality and analyze site traffic. Cookies are small text files stored on your device. You can control cookie preferences through your browser settings. Disabling cookies may affect your experience on our site.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">6. Who do we Share Your Personal Data With?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        We may be required to share your personal data with the third parties listed below for the purposes described in Section 3 above or otherwise with your consent:
                    </p>
                    <ul className="list-disc list-outside pl-6 space-y-2 mt-4">
                        <li><strong>Affiliated Charitable Programs and Partners</strong>: Kawartha Youth Orchestra is a Canadian registered charity that works in collaboration with community partners and funders. Personal data collected by us in accordance with this Privacy Policy may be used and shared with affiliated organizations and partner charities to support the effective delivery of programs, services, and outreach.</li>
                        <li><strong>Service Providers</strong>: When we engage third-party organizations or individuals to perform services on our behalf (such as IT support, cloud hosting, payment processing, or survey administration), we provide them with only the personal data necessary to perform their specific function. These providers are contractually authorised to use your personal data only as required to deliver services to us.</li>
                        <li><strong>Volunteers, Instructors, and Program Staff</strong>: In limited circumstances, we may share contact or participation data with individuals engaged in delivering our programs (such as music instructors, accompanists, or volunteers) to ensure safe and effective program administration.</li>
                        <li><strong>Funders and Grantmakers</strong>: We may share de-identified or aggregate data with funders, foundations, and government agencies for purposes of program evaluation and grant reporting. Identifiable personal data is shared only when required and with your consent.</li>
                        <li><strong>Legal Requirements</strong>: We may disclose personal data to government authorities, regulators, or other third parties if required to do so by law.</li>
                        <li><strong>Organizational Changes</strong>: In the unlikely event of a merger, dissolution, or transfer of programs to another charitable organization, relevant personal data may be included as part of the transition to ensure continuity of services.</li>
                        <li><strong>Technology Partners</strong>: Kawartha Youth Orchestra may use digital platforms, including tools that incorporate artificial intelligence (AI), to provide you with certain services such as online communications or survey analysis. Should you choose to use these technologies, any personal data provided by you may be shared with the underlying third-party technology provider in accordance with their privacy practices.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">7. International Transfers of Personal Data</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        Your personal data may be transferred to and stored by Kawartha Youth Orchestra online using Google infrastructure. Your personal data may also be used and accessed by members of our group, including those across Canada, the USA, and transferred to the third parties disclosed in Section 6 above who are internationally based. Accordingly, your personal data may be processed outside of your country or jurisdiction. If we transfer your personal data outside of your country or jurisdiction, we ensure that the recipient of your personal data has appropriate safeguards in place to protect your personal data.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">8. Data Security</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        We have put in place appropriate organisational, technical and physical security measures to prevent your personal data from being accidentally lost, used, accessed in an unauthorised way, altered or disclosed. We limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. We have also put in place procedures to deal with any suspected personal data breach and will notify you and any applicable regulator of a breach where we are legally required to do so.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">9. How Long will You Use my Personal Data For?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        We will only retain your personal data for as long as we believe necessary to fulfil the purposes we collected it for, including for the purposes of satisfying any legal, accounting, reporting, or audit requirements. To determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorised use or disclosure of your personal data, the purposes for which we process your personal data and whether we can achieve those purposes through other means, and the applicable legal requirements.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">10. Your Rights Relating to Your Personal Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <h4 className="font-bold text-lg font-headline pt-2 text-foreground">10.1 Your Rights</h4>
                    <p>
                        Under certain circumstances, you have rights under data protection laws in relation to your personal data. These include the right to request access, correction, erasure, object to processing, opt out of direct marketing, request restrictions on processing, request the transfer of your data, and withdraw consent.
                    </p>
                    <h4 className="font-bold text-lg font-headline pt-2 text-foreground">10.2 How to Exercise Your Rights</h4>
                    <p>
                        To exercise your rights, please contact us using the information in Section 11 below.
                    </p>
                    <h4 className="font-bold text-lg font-headline pt-2 text-foreground">10.3 No Fee Usually Required</h4>
                    <p>
                        You will not have to pay a fee to access your personal data (or to exercise any of the other rights). However, we may charge a reasonable fee if your request is clearly unfounded, repetitive or excessive.
                    </p>
                    <h4 className="font-bold text-lg font-headline pt-2 text-foreground">10.4 What we May Need From You</h4>
                    <p>
                        We may need to request specific information from you to help us confirm your identity and ensure your right to access your personal data.
                    </p>
                    <h4 className="font-bold text-lg font-headline pt-2 text-foreground">10.5 Time Limit to Respond</h4>
                    <p>
                        We try to respond to all legitimate requests within one month. Occasionally, it may take us longer than a month if your request is particularly complex or you have made a number of requests.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">11. How do You Contact us with Privacy or Personal Data Requests?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        We hope we can satisfy any queries you may have about the way we process your personal data. If you have any concerns or would like to exercise any of your rights, contact our Data Protection Officer by email at {dpoLink ? <Link href={dpoLink.url} className="text-primary underline">{dpoLink.url.replace('mailto:', '')}</Link> : 'dpo@thekyo.ca'}. We are committed to working with you to obtain a fair resolution of any complaint or concern about your privacy.
                    </p>
                </CardContent>
            </Card>
        </div>
      </section>
    </div>
  );
}
