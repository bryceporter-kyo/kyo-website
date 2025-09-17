
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLinkById } from "@/lib/links";
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function ContactCard() {
    const phoneLink = getLinkById('contact-phone');
    const emailLink = getLinkById('contact-main');
    const mailingAddressLink = getLinkById('address-mailing');
    const physicalAddressLink = getLinkById('address-physical');

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Get in Touch</CardTitle>
                <CardDescription>
                    Have a question or want to learn more? Reach out to us through any of the channels below.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <h3 className="font-bold text-lg font-headline">Contact Information</h3>
                        <ul className="space-y-4 text-muted-foreground">
                            <li className="flex items-center gap-4">
                                <Phone className="w-6 h-6 shrink-0 text-primary" />
                                <div>
                                    <p className="font-semibold">Phone</p>
                                    {phoneLink ? (
                                        <a href={phoneLink.url} className="hover:text-primary">{phoneLink.url.replace('tel:', '')}</a>
                                    ) : (
                                        <span>705-410-4025</span>
                                    )}
                                </div>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail className="w-6 h-6 shrink-0 text-primary" />
                                <div>
                                    <p className="font-semibold">Email</p>
                                    {emailLink ? (
                                        <a href={emailLink.url} className="hover:text-primary">{emailLink.url.replace('mailto:', '')}</a>
                                    ) : (
                                        <span>ContactUs@thekyo.ca</span>
                                    )}
                                </div>
                            </li>
                        </ul>
                    </div>
                     <div className="space-y-4">
                        <h3 className="font-bold text-lg font-headline">Our Locations</h3>
                         <ul className="space-y-4 text-muted-foreground">
                            <li className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 mt-1 shrink-0 text-primary" />
                                <div>
                                    <p className="font-semibold">Mailing Address</p>
                                    {mailingAddressLink ? (
                                        <a href={mailingAddressLink.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                            P.O. Box 53, 150 King Street<br/>Peterborough ON, K9J 6Y5
                                        </a>
                                    ) : (
                                        <span>P.O. Box 53, 150 King Street<br/>Peterborough ON, K9J 6Y5</span>
                                    )}
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 mt-1 shrink-0 text-primary" />
                                <div>
                                    <p className="font-semibold">Physical Address</p>
                                    {physicalAddressLink ? (
                                        <a href={physicalAddressLink.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                            221 Romaine Street<br/>Peterborough, ON, K9J 2C3
                                        </a>
                                    ) : (
                                        <span>221 Romaine Street<br/>Peterborough, ON, K9J 2C3</span>
                                    )}
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
