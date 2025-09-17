
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactCard() {
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
                                    <a href="tel:705-410-4025" className="hover:text-primary">705-410-4025</a>
                                </div>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail className="w-6 h-6 shrink-0 text-primary" />
                                <div>
                                    <p className="font-semibold">Email</p>
                                    <a href="mailto:ContactUs@thekyo.ca" className="hover:text-primary">ContactUs@thekyo.ca</a>
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
                                    <a href="https://www.google.com/maps/search/?api=1&query=P.O.+Box+53,+150+King+Street,+Peterborough+ON+K9J+6Y5" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                        P.O. Box 53, 150 King Street<br/>Peterborough ON, K9J 6Y5
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 mt-1 shrink-0 text-primary" />
                                <div>
                                    <p className="font-semibold">Physical Address</p>
                                    <a href="https://www.google.com/maps/search/?api=1&query=221+Romaine+Street,+Peterborough,+ON,+K9J+2C3" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                        221 Romaine Street<br/>Peterborough, ON, K9J 2C3
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
