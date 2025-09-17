
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLinkById } from "@/lib/links";
import { MapPin } from "lucide-react";

export default function ContactMap() {
    const mailingAddressLink = getLinkById('address-mailing');
    const physicalAddressLink = getLinkById('address-physical');

    return (
        <div className="container mx-auto grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 rounded-lg overflow-hidden shadow-lg">
                <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '400px' }}
                    loading="lazy"
                    allowFullScreen
                    src="https://maps.google.com/maps?q=221%20Romaine%20St%2C%20Peterborough%2C%20ON%20K9J%202C3&t=m&z=16&output=embed&iwloc=near">
                </iframe>
            </div>
            <div className="space-y-8">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <MapPin className="w-8 h-8 text-primary"/>
                        <CardTitle className="font-headline text-xl">Office/Rehearsal Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {physicalAddressLink ? (
                            <a href={physicalAddressLink.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary text-muted-foreground">
                                <strong>New Canadian Centre</strong><br />
                                221 Romaine St<br />
                                Peterborough, ON K9J 2C3
                            </a>
                        ) : (
                             <p className="text-muted-foreground">
                                <strong>New Canadian Centre</strong><br />
                                221 Romaine St<br />
                                Peterborough, ON K9J 2C3
                            </p>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <MapPin className="w-8 h-8 text-primary"/>
                        <CardTitle className="font-headline text-xl">Mailing Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {mailingAddressLink ? (
                             <a href={mailingAddressLink.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary text-muted-foreground">
                                P.O. Box 53,<br />
                                150 King Street,<br />
                                Peterborough ON K9J 6Y5
                            </a>
                        ) : (
                             <p className="text-muted-foreground">
                                P.O. Box 53,<br />
                                150 King Street,<br />
                                Peterborough ON K9J 6Y5
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
