
import ContactCard from "@/components/shared/ContactCard";
import ContactInfoCard from "@/components/shared/ContactInfoCard";
import ContactMap from "@/components/shared/ContactMap";
import PageHeader from "@/components/shared/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { getLinkById } from "@/lib/links";
import { Facebook, Instagram, Mail, Phone, Clock } from "lucide-react";


export default function ContactPage() {
    const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-support');
    const phoneLink = getLinkById('contact-phone');
    const emailLink = getLinkById('contact-main');
    const facebookLink = getLinkById('social-facebook');
    const instagramLink = getLinkById('social-instagram');

    const socialLinks = [
      { name: 'Facebook', link: facebookLink, icon: Facebook },
      { name: 'Instagram', link: instagramLink, icon: Instagram },
    ];
    
    return (
        <div>
            <PageHeader
                title="Contact Us"
                subtitle="Get in touch with KYO. We're here to answer your questions, hear your feedback, and explore how you can be part of our musical community."
                image={headerImage}
            />
            <section className="container mx-auto">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <ContactInfoCard
                        icon={Phone}
                        title="Phone Number"
                        content={phoneLink ? <a href={phoneLink.url} className="hover:text-primary">{phoneLink.url.replace('tel:', '')}</a> : "705-410-4025"}
                    />
                    <ContactInfoCard
                        icon={Mail}
                        title="E-mail"
                        content={emailLink ? <a href={emailLink.url} className="hover:text-primary">{emailLink.url.replace('mailto:', '')}</a> : "contactus@thekyo.ca"}
                        buttonText="Send us an email"
                        buttonLink={emailLink?.url}
                    />
                     <ContactInfoCard
                        icon={Clock}
                        title="Office Hours"
                        content={
                             <ul className="text-muted-foreground">
                                <li><strong>Tuesday:</strong> 2-7 p.m.</li>
                                <li><strong>Thursday:</strong> 2-7 p.m.</li>
                                <li><strong>Sunday:</strong> 1:30-5:30 p.m.</li>
                            </ul>
                        }
                        note="Please note that, due to the nature of our programming and for the safety of our members, we cannot accept any walk-ins. If you need to speak with a member of our staff in person, please contact us to schedule an appointment."
                    />
                </div>
            </section>
            <section className="bg-secondary">
                <ContactMap />
            </section>
        </div>
    )
}
