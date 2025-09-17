import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLinkById } from "@/lib/links";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";

export default function TermsOfUsePage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-terms');
  const boardContactLink = getLinkById('contact-board');

  return (
    <div>
      <PageHeader
        title="Digital Terms of Use"
        subtitle="Last updated: October 26, 2023"
        image={headerImage}
      />
      <section className="container mx-auto">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Agreement to Terms</CardTitle>
            <CardDescription>
             By accessing and using our website, you agree to be bound by these Terms of Use.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <p>
              The Kawartha Youth Orchestra (“KYO”) provides the content on this website (the “Site”) subject to the following terms and conditions (the “Terms”). We may periodically change the Terms without notice to you, so please check back from time to time. Unless explicitly stated otherwise, any new features that augment or enhance the Site shall be subject to these Terms. By accessing and using this Site, you agree to these Terms.
            </p>
            
            <div className="space-y-4">
              <h3 className="font-bold text-xl font-headline text-foreground">Description of Service</h3>
              <p>
                This Site provides a variety of resources and information for users to find, engage, and manage program services, financial, and donation resources (the “Services”). The Site does not provide medical, investment, or legal advice, and no special relationship is created between users of the Services and Kawartha Youth Orchestra or its licensors.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-xl font-headline text-foreground">User Content Disclaimer</h3>
              <p>
                Some of the content on this Site, including without limitation, the text, software, scripts, graphics, videos, and the like (“Site Content”) is created and developed by users and provided to Kawartha Youth Orchestra under license for dissemination over the internet (“User Content”). User Content includes, among other things, analyses, seminar workbooks, presentations, and biographical and employment information. Kawartha Youth Orchestra cannot guarantee and makes no representations as to the accuracy or quality of User Content, all of which is offered “as is.” The Kawartha Youth Orchestra does not own, develop, or endorse, and is not responsible for User Content. The use of a company or entity name in user biographical or employment information should not be construed as an express or implied endorsement by such company or entity of Kawartha Youth Orchestra or an express or implied endorsement by Kawartha Youth Orchestra of such company or entity. Users are not employees of or under the supervision of Kawartha Youth Orchestra. Users have agreed to be bound by these Terms and have represented, among other things, that they will not disclose information that is subject to a confidentiality obligation or participate in activities in violation of any agreements or duties owed to employers or other third parties. Kawartha Youth Orchestra relies on the accuracy of these representations of the users and does not necessarily seek independent verification.
              </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Confidentiality Agreement</h3>
                <p>
                    Users have agreed to and are bound by the Non-Disclosure provision of these Terms. You agree not to disclose or attempt to use or personally benefit from any Confidential Information, as defined below, you learn on Kawartha Youth Orchestra’s platform, a password-protected website. This obligation shall continue until such time as the Confidential Information has become publicly known through no action of your own. Confidential Information shall include:
                </p>
                <ul className="list-disc list-outside pl-6 space-y-2">
                    <li>The existence, title, and description of any non-public Kawartha Youth Orchestra project;</li>
                    <li>Any other confidential information of the Kawartha Youth Orchestra or its Members; and</li>
                    <li>Any intellectual property, including without limitation any trade secrets, know-how, or copyrighted information, of the Kawartha Youth Orchestra or its Members.</li>
                </ul>
                <p>
                    If you are compelled by the order of a court or other governmental or legal body or, have notice that such an order is being sought, to divulge any Confidential Information, you agree to promptly and diligently notify the Kawartha Youth Orchestra and cooperate fully with the Kawartha Youth Orchestra in protecting such information to the extent possible under applicable law.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Intellectual Property Rights</h3>
                <p>
                    Site Content and the trademarks, service marks, and logos contained therein (“Marks”) are owned by or licensed to the Kawartha Youth Orchestra, subject to copyright and other intellectual property rights under United States and foreign laws and international conventions. Site Content may not be copied, reproduced, distributed, transmitted, broadcast, displayed, sold, licensed, uploaded, or otherwise exploited without the prior written consent of the respective owners.
                </p>
            </div>

             <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">To Report A Concern About Content On The Site</h3>
                <p>
                    If you believe that any content on the Site is in any way unlawful, defamatory, threatening, deceptive, misleading, subject to a confidentiality obligation, or constitutes material, non-public information, notify the Kawartha Youth Orchestra Board of Directors at:
                </p>
                <div className="pl-4">
                    <p>Attn: Board of Directors</p>
                    <p>Kawartha Youth Orchestra</p>
                    {boardContactLink ? (
                      <Link href={boardContactLink.url} className="text-primary underline">{boardContactLink.url.replace('mailto:', '')}</Link>
                    ) : (
                      <a href="mailto:board-of-directors@thekyo.ca" className="text-primary underline">board-of-directors@thekyo.ca</a>
                    )}
                </div>
            </div>
            
            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Copyright Policy</h3>
                <p>
                    The Kawartha Youth Orchestra prohibits the posting of any information that infringes or violates the copyright rights and/or other intellectual property rights (including rights of privacy and publicity) of any person or entity. If you believe that your intellectual property right (or such a right that you are responsible for enforcing) is infringed by any content on the Site, please write to the Kawartha Youth Orchestra at the address shown below, giving a written statement that contains:
                </p>
                 <ul className="list-decimal list-outside pl-6 space-y-2">
                    <li>identification of the copyrighted work and/or intellectual property right claimed to have been infringed;</li>
                    <li>identification of the allegedly infringing material on the Site that is requested to be removed;</li>
                    <li>your name, address, and daytime telephone number, and an e-mail address if available;</li>
                    <li>a statement that you have a good faith belief that the use of the copyrighted work and/or exercise of the intellectual property right is not authorized by the owner, its agent, or the law;</li>
                    <li>a statement that the information in the notification is accurate, and, under penalty of perjury, that the signatory is authorized to act on behalf of the owner of the right that is allegedly infringed; and</li>
                    <li>the signature of the intellectual property right owner or someone authorized on the owner’s behalf to assert infringement of the right.</li>
                </ul>
                <p>
                    The Kawartha Youth Orchestra will process notices of alleged infringement which it receives and will take appropriate action as required by applicable law. Under appropriate circumstances, persons who repeatedly submit infringing or unlawful material will be prohibited from posting further submissions. The Kawartha Youth Orchestra’s contact for submission of notices under this Section regarding claimed copyright infringement is:
                </p>
                 <div className="pl-4">
                    <p>Attn: Board of Directors</p>
                    <p>Kawartha Youth Orchestra</p>
                    {boardContactLink ? (
                      <Link href={boardContactLink.url} className="text-primary underline">{boardContactLink.url.replace('mailto:', '')}</Link>
                    ) : (
                      <a href="mailto:board-of-directors@thekyo.ca" className="text-primary underline">board-of-directors@thekyo.ca</a>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Privacy & Cookie Policy</h3>
                <p>
                    You understand that your access to the Site will result in the collection, use, and storage of your information which is subject to our Privacy Policy. Through your access to the Site, you consent to the collection, use, and storage of such information, which will be held in or across Google data centre locations and may be processed and stored by other Kawartha Youth Orchestra entities around the world. For an explanation of the Kawartha Youth Orchestra’s practices and policies related to the collection, use, and storage of our users’ information, please read our Privacy Policy.
                </p>
            </div>
            
            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Disclaimer of Warranties</h3>
                <p className="uppercase">
                    THE CONTENT AND FUNCTIONALITY ON THE SITE IS PROVIDED WITH THE UNDERSTANDING THAT Kawartha Youth Orchestra IS NOT HEREIN ENGAGED IN RENDERING PROFESSIONAL ADVICE AND SERVICES TO YOU. ALL CONTENT AND FUNCTIONALITY ON THE SITE IS PROVIDED “AS IS,” WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. Kawartha Youth Orchestra MAKES NO WARRANTIES, EXPRESS OR IMPLIED, AS TO THE OWNERSHIP, ACCURACY, OR ADEQUACY OF THE SITE CONTENT OR THAT THE FUNCTIONALITY ON THIS SITE WILL BE UNINTERRUPTED OR ERROR-FREE. YOU HEREBY ACKNOWLEDGE THAT YOUR USE OF THIS SITE IS AT YOUR SOLE RISK. UNDER NO CIRCUMSTANCES SHALL Kawartha Youth Orchestra OR ANY OF ITS PREDECESSORS, SUCCESSORS, PARENTS, SUBSIDIARIES, AFFILIATES, OFFICERS, DIRECTORS, SHAREHOLDERS, INVESTORS, EMPLOYEES, AGENTS, REPRESENTATIVES, ATTORNEYS, AND THEIR RESPECTIVE HEIRS, SUCCESSORS, AND ASSIGNS BE LIABLE FOR ANY DAMAGES, INCLUDING DIRECT, INCIDENTAL, PUNITIVE, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES THAT DIRECTLY OR INDIRECTLY RESULT FROM THE USE OF, OR THE INABILITY TO USE, THIS SITE OR THE INFORMATION CONTAINED ON THIS SITE OR OBTAINED FROM YOUR USE OF THIS SITE, INCLUDING FOR VIRUSES ALLEGED TO HAVE BEEN OBTAINED FROM THE SITE, EVEN IF Kawartha Youth Orchestra HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES OR LOSSES AND REGARDLESS OF THE THEORY OF LIABILITY.
                </p>
                 <p>
                    For more details on how information and success metrics are presented on our website, please refer to our <Link href="/legal/information-accuracy-policy" className="text-primary underline">Information Accuracy and Success Metrics Policy</Link>.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Indemnification</h3>
                <p>
                    As a condition of your use of this Site, you agree to indemnify, defend and hold Kawartha Youth Orchestra, our officers, directors, employees, agents, and representatives harmless from and against all claims, damages, losses, costs (including Kawartha Youth Orchestra’s reasonable attorneys’ fees), or other expenses that arise directly or indirectly out of or from:
                </p>
                 <ul className="list-decimal list-outside pl-6 space-y-2">
                    <li>your violation of the Terms;</li>
                    <li>your use of the Site; or</li>
                    <li>your violation of the rights of any third party.</li>
                </ul>
            </div>
            
            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">Third-Party Websites</h3>
                <p>
                    We may provide links to third-party websites, and some of the content appearing to be on this Site is in fact supplied by third parties. The Kawartha Youth Orchestra does not endorse and has no responsibility for the availability or content of these third-party websites, which are governed by the Terms of Use and privacy policies, if any, of the applicable third-party content providers. The Kawartha Youth Orchestra shall have no liability or responsibility, directly or indirectly, for any damage or loss caused or alleged to be caused by the use or reliance on any content, goods, or services available on or through such sites.
                </p>
            </div>
            
            <div className="space-y-4">
                <h3 className="font-bold text-xl font-headline text-foreground">General Terms</h3>
                 <p><strong>Governing Law: Jurisdiction:</strong> These Terms are governed by the laws of the Province of Ontario without reference to the principles of conflicts of laws thereof. You agree to submit to the personal and exclusive jurisdiction of the courts located within the Province of Ontario, Canada with respect to all disputes arising out of or related to these Terms. If any part of these Terms is unlawful, void, or unenforceable, that part will be deemed severable and will not affect the validity and enforceability of the remaining provisions.</p>
                 <p><strong>Complete Agreement:</strong> These Terms set forth the entire understanding between you and the Kawartha Youth Orchestra and supersede all prior versions of the Terms. In addition, you may also be subject to additional terms and conditions when you use or access other Kawartha Youth Orchestra or Kawartha Youth Orchestra affiliate services or content. If any provision of these Terms is declared void or otherwise unenforceable, such provision shall be deemed to have been severed from these Terms, which shall otherwise remain in full force and effect.</p>
            </div>
            
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
