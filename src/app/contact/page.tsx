
import ContactMap from "@/components/shared/ContactMap";
import PageHeader from "@/components/shared/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { getLinkById } from "@/lib/links";
import { Facebook, Instagram, Mail, Phone, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ContactInfoCard from "@/components/shared/ContactInfoCard";


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
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    <Card className="flex flex-col">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="bg-primary text-primary-foreground p-3 rounded-full">
                                <Mail className="w-6 h-6" />
                            </div>
                            <CardTitle className="font-headline text-xl">General Inquiries</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <div className="flex items-center gap-4 text-lg">
                                <Phone className="w-6 h-6 text-primary"/>
                                {phoneLink ? <a href={phoneLink.url} className="hover:text-primary">{phoneLink.url.replace('tel:', '')}</a> : "705-410-4025"}
                            </div>
                            <div className="flex items-center gap-4 text-lg">
                                <Mail className="w-6 h-6 text-primary"/>
                                 {emailLink ? <a href={emailLink.url} className="hover:text-primary">{emailLink.url.replace('mailto:', '')}</a> : "contactus@thekyo.ca"}
                            </div>
                        </CardContent>
                        <div className="p-6 pt-0">
                            {emailLink && (
                                <Button asChild className="w-full">
                                    <Link href={emailLink.url}>Send us an email</Link>
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            </section>
            <section className="bg-secondary">
                <ContactMap />
            </section>
        </div>
    )
}

