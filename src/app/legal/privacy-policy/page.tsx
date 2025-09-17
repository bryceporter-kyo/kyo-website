import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function PrivacyPolicyPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-privacy');

  return (
    <div>
      <PageHeader
        title="Privacy & Cookie Policy"
        subtitle="Last updated: October 26, 2023"
        image={headerImage}
      />
      <section className="container mx-auto">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Our Commitment to Your Privacy</CardTitle>
            <CardDescription>
             This policy outlines how we collect, use, and protect your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="font-bold text-xl font-headline mb-2">Introduction</h3>
                <p className="text-muted-foreground mb-4">
                    Kawartha Youth Orchestra, its subsidiaries, and its affiliates (“Kawartha Youth Orchestra”, “KYO”, “we”, “us”, “our”) respect your privacy and are committed to protecting your personal data. This Privacy & Cookie Policy (also referred to as Privacy Policy) describes our data collection and processing activities, including:
                </p>
                <ul className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                    <li>what personal data we may collect when you interact with us through our various channels online (such as our website at https://kawarthayouthorchestra.org, https://thekyo.ca, https://upbeat.com and via our apps and social networks) and offline (such as over the telephone, via text, messaging application, in meetings or at events) and what we may do with that personal data;</li>
                    <li>how we may collect and process information through the use of cookies and related tracking technologies on our online channels; and</li>
                    <li>your data protection rights, including (where applicable) a right to object to processing and a right to withdraw your consent to processing, and how to exercise them.</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                    When we refer to “personal data” in this Privacy Policy we are referring to any information that falls under the definition of “personal data” in the Personal Information Protection and Electronic Documents Act.
                </p>
                <p className="text-muted-foreground">
                    It is important that you read this Privacy & Cookie Policy together with any other privacy notice or fair processing notice we may provide on specific occasions when we are collecting or processing personal data about you, so that you are fully aware of how and why we are using your data. This Privacy & Cookie Policy supplements the other notices and is not intended to override them.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline">1. Important Information and Who We Are</h3>
                <p className="text-muted-foreground">
                    Kawartha Youth Orchestra is responsible for the processing of your personal data as described in this Privacy Policy. For the purposes of the Personal Information Protection and Electronic Documents Act, in respect of our core service offerings, Kawartha Youth Orchestra acts as the controller, business, and personal information processor, respectively, of such personal data.
                </p>
                <p className="text-muted-foreground">
                   The contact details of Kawartha Youth Orchestra’s Data Protection Officer are provided in Section 11 below.
                </p>
                
                <h4 className="font-bold text-lg font-headline pt-2">1.1. Updates to this privacy & cookie policy</h4>
                <p className="text-muted-foreground">
                    This Privacy & Cookie Policy may be updated periodically. We will update the date at the top of this Privacy & Cookie Policy accordingly and encourage you to check for changes to this Privacy & Cookie Policy, which will be available on our website. On some occasions, we may also actively advise you of specific data handling activities or significant changes to this Privacy & Cookie Policy, as required by applicable law.
                </p>

                <h4 className="font-bold text-lg font-headline pt-2">1.2 Third-party links</h4>
                <p className="text-muted-foreground">
                    Our website(s) may include links to or functionality from third-party websites, plug-ins and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements. When you leave our website, we encourage you to read the privacy policy of every website you visit.
                </p>
                
                <h4 className="font-bold text-lg font-headline pt-2">1.3 Kawartha Youth Orchestra as Data Processor</h4>
                <p className="text-muted-foreground mb-4">
                   From time to time, we may process personal data in the role of a processor or, for the purposes of the Personal Information Protection and Electronic Documents Act, a service provider, on behalf of our clients, including where we facilitate the provision of specific output submitted by or derived from our consultants or clients’ engagements with our contractors or consultants, in each case at our clients’ sole request. In these specific circumstances, our clients act as the controller, and each has in place separate privacy and data security practices, which will also apply. Porter’s Management Group will, however, support our clients as necessary to respond to any requests you have in respect of the processing of your personal data. If you require any further information about our clients’ data processing activities, please get in touch using the details in Section 11.
                </p>
                 <p className="text-muted-foreground">
                    Please note that if you participate in a survey facilitated by Kawartha Youth Orchestra, this survey may either be programmed by Kawartha Youth Orchestra on behalf of our client or programmed by a third party directly on behalf of our client. This Privacy Policy will apply to the processing of your survey responses, where Kawartha Youth Orchestra is the programmer of the survey. Where Kawartha Youth Orchestra does not programme the survey, Kawartha Youth Orchestra will not collect, store, or otherwise process your survey results, and the third party survey programmer and/or our client will have in place separate privacy and data security practices that will apply.
                </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-xl font-headline">2. What personal data do we collect and how?</h3>
               <p className="text-muted-foreground">
                “Personal data” means any personally identifiable information belonging to an identifiable natural person, including but not limited to an identifier such as a name, an identification number, location data, an online identifier, or factors specific to the physical, economic, cultural, or social identity of that natural person, and for the avoidance of doubt, includes the term “personal data” as defined in the Personal Information Protection and Electronic Documents Act.
              </p>
              <h4 className="font-bold text-lg font-headline pt-2">2.1 Categories of Personal Data Collected</h4>
              <p className="text-muted-foreground">
                We may collect, create, use, store and otherwise process different categories of personal data depending on how you use and interact with our products, services and online channels. We have grouped these categories below as follows:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
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

              <h4 className="font-bold text-lg font-headline pt-2">2.2 Circumstances When we May Collect Your Personal Data</h4>
              <p className="text-muted-foreground">
                We may collect such categories of personal data either directly from you or from third parties and publicly available sources. We may ask you to confirm the accuracy of the personal data we process about you.
              </p>

              <h4 className="font-bold text-lg font-headline pt-2">2.3 Aggregating Your Personal Data</h4>
              <p className="text-muted-foreground">
                We aggregate your Usage Data with the information of other website visitors, experts and clients, creating a dataset of information about the usage of our online channels, our apps, products and services, and other general, grouped information about our user base. It provides a valuable insight into the use of our services and we may share it with select third parties. This dataset is aggregated and anonymized, meaning it cannot directly identify you as an individual and is not considered personal data.
              </p>
               <h4 className="font-bold text-lg font-headline pt-2">2.4 When am I Required to Provide Personal Data?</h4>
               <p className="text-muted-foreground mb-4">
                    We may have a legal obligation to collect and process your personal data, or we may require your personal data in order to provide you with specific products and services, including accessing our platform.
                </p>
                 <p className="text-muted-foreground mb-4">
                    If you fail to provide that data when requested, we may not be able to perform the contract we have or are trying to enter into with you, and/or the quality of the products and services we provide to you might be affected. In these circumstances, we may cancel a service you receive from us or stop proceeding with a contract we are trying to enter into with you, but we will notify you if this is the case at the time.
                </p>
                 <p className="text-muted-foreground">
                    Please note that this does not apply to the collection of biometric data provided by contractors or consultants in applicable jurisdictions for identity verification purposes. The provision of biometric data is voluntary and will not, in any way, impact our payment obligations to you. However, we may be unable to engage you in any further engagements with Kawartha Youth Orchestra without first completing our identity check.
                </p>
            </div>
             <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline">3. Why we process your personal data and the lawful bases on which we rely</h3>
                 <p className="text-muted-foreground">
                    In accordance with the Personal Information Protection and Electronic Documents Act S.C. 2000, c. 5, we rely on a number of lawful bases to process your personal data.
                </p>
            </div>
             <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline">4. Personal Information and Personally Identifiable Data</h3>
                 <p className="text-muted-foreground mb-4">
                    In certain situations, we may need to process, or ask third parties to process on our behalf, your special category personal data. Special category personal data means information that can reveal your racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic or biometric data (if used to uniquely identify that person), and information concerning a person’s health, sex life, or sexual orientation. We will also rely on your prior, explicit consent to process:
                </p>
                 <p className="text-muted-foreground mb-4">
                    Profile Data that you voluntarily share with us that falls within the definition of special category personal data, including personal data revealing your racial or ethnic origin and data concerning your health or sexual orientation, for the purposes of facilitating specific projects that fall within that scope;
                </p>
                <p className="text-muted-foreground mb-4">
                    any facial scan data that is processed by an approved third party on our behalf to verify your identity.
                </p>
                <p className="text-muted-foreground">
                    Your consent is entirely voluntary and failure to provide consent will not prevent us from fulfilling our contractual obligations to you.
                </p>
            </div>
            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline">5. Cookies and Related Technologies</h3>
                <p className="text-muted-foreground">
                    Our website uses cookies to enhance functionality and analyze site traffic. Cookies are small text files stored on your device. You can control cookie preferences through your browser settings. Disabling cookies may affect your experience on our site.
                </p>
            </div>
             <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline">6. Who do we Share Your Personal Data With?</h3>
                 <p className="text-muted-foreground">
                    We may be required to share your personal data with the third parties listed below for the purposes described in Section 3 above or otherwise with your consent:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Affiliates</strong>: Kawartha Youth Orchestra is a business with global operations, based in Canada. The personal data collected by us in accordance with this Privacy & Cookie Policy may be used and shared amongst our group companies (acting on behalf of Kawartha Youth Orchestra) to support the effective functioning of Kawartha Youth Orchestra’s business and the provision of its products and services.</li>
                    <li><strong>Service Providers</strong>: When we employ a third-party to perform a function on our behalf, we provide it with the personal data that it needs to perform its specific function. These companies are contractually authorised to use your personal data only as necessary to provide these products or services to us.</li>
                    <li><strong>Clients</strong>: We may share Identifier Data, Contact Data, Due Diligence Data, Profile Data and Transaction Data relating to our consultants with our clients in connection with a particular project.</li>
                    <li><strong>Contractors and Consultants</strong>: We may share Identifier Data relating to our clients with our experts in connection with a particular project.</li>
                    <li><strong>Legal Requirements</strong>: We disclose personal data to government authorities, regulators, or other third parties if required to do so by law.</li>
                    <li><strong>Business Transfers</strong>: In the event of a corporate sale, merger, reorganisation, dissolution, or similar event, your personal data may be part of the transferred assets.</li>
                    <li><strong>Artificial Intelligence ‘AI’ Technology Partners</strong>: Kawartha Youth Orchestra may utilise AI technology to provide you with certain services. Should you decide to use such technologies, any personal data provided by you will be shared with the underlying third party AI provider.</li>
                </ul>
            </div>
             <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline">7. International Transfers of Personal Data</h3>
                 <p className="text-muted-foreground">
                    Your personal data may be transferred to and stored by Kawartha Youth Orchestra online using Google infrastructure. Your personal data may also be used and accessed by members of our group, including those across Canada, the USA, and transferred to the third parties disclosed in Section 6 above who are internationally based. Accordingly, your personal data may be processed outside of your country or jurisdiction. If we transfer your personal data outside of your country or jurisdiction, we ensure that the recipient of your personal data has appropriate safeguards in place to protect your personal data.
                </p>
            </div>
            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline">8. Data Security</h3>
                <p className="text-muted-foreground">
                    We have put in place appropriate organisational, technical and physical security measures to prevent your personal data from being accidentally lost, used, accessed in an unauthorised way, altered or disclosed. We limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. We have also put in place procedures to deal with any suspected personal data breach and will notify you and any applicable regulator of a breach where we are legally required to do so.
                </p>
            </div>
             <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline">9. How Long will You Use my Personal Data For?</h3>
                 <p className="text-muted-foreground">
                    We will only retain your personal data for as long as we believe necessary to fulfil the purposes we collected it for, including for the purposes of satisfying any legal, accounting, reporting, or audit requirements. To determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorised use or disclosure of your personal data, the purposes for which we process your personal data and whether we can achieve those purposes through other means, and the applicable legal requirements.
                </p>
            </div>
             <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline">10. Your Rights Relating to Your Personal Data</h3>
                 <h4 className="font-bold text-lg font-headline pt-2">10.1 Your Rights</h4>
                 <p className="text-muted-foreground">
                    Under certain circumstances, you have rights under data protection laws in relation to your personal data. These include the right to request access, correction, erasure, object to processing, opt out of direct marketing, request restrictions on processing, request the transfer of your data, and withdraw consent.
                </p>
                 <h4 className="font-bold text-lg font-headline pt-2">10.2 How to Exercise Your Rights</h4>
                 <p className="text-muted-foreground">
                    To exercise your rights, please contact us using the information in Section 11 below.
                </p>
                 <h4 className="font-bold text-lg font-headline pt-2">10.3 No Fee Usually Required</h4>
                 <p className="text-muted-foreground">
                    You will not have to pay a fee to access your personal data (or to exercise any of the other rights). However, we may charge a reasonable fee if your request is clearly unfounded, repetitive or excessive.
                </p>
                 <h4 className="font-bold text-lg font-headline pt-2">10.4 What we May Need From You</h4>
                 <p className="text-muted-foreground">
                    We may need to request specific information from you to help us confirm your identity and ensure your right to access your personal data.
                </p>
                 <h4 className="font-bold text-lg font-headline pt-2">10.5 Time Limit to Respond</h4>
                 <p className="text-muted-foreground">
                    We try to respond to all legitimate requests within one month. Occasionally, it may take us longer than a month if your request is particularly complex or you have made a number of requests.
                </p>
            </div>
             <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline">11. How do You Contact us with Privacy or Personal Data Requests?</h3>
                 <p className="text-muted-foreground">
                    We hope we can satisfy any queries you may have about the way we process your personal data. If you have any concerns or would like to exercise any of your rights, contact our Data Protection Officer by email at <a href="mailto:dpo@thekyo.ca" className="text-primary underline">dpo@thekyo.ca</a>. We are committed to working with you to obtain a fair resolution of any complaint or concern about your privacy.
                </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
