
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Heart, Handshake, Gift, Star, Ticket, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const volunteerRoles = [
    {
        icon: Ticket,
        title: "Concert & Event Support",
        description: "Be the friendly face of KYO at our performances. Help with ushering, ticket-taking, and merchandise sales. Your support ensures our concerts run smoothly and our audiences have a wonderful experience.",
    },
    {
        icon: Users,
        title: "Program Assistance",
        description: "Lend a hand during our weekly programs. Assist with student check-in, snack distribution, and monitoring practice rooms. Your presence helps create a safe and organized environment for our young musicians.",
    },
    {
        icon: Handshake,
        title: "Fundraising & Outreach",
        description: "Join our team at community events to spread the word about KYO. Help us with fundraising campaigns, donor thank-you calls, or representing us at local fairs. Your voice helps us grow our community.",
    },
    {
        icon: Star,
        title: "Serve on a Committee",
        description: "Lend your expertise to one of our board committees. We have opportunities in finance, governance, fundraising, and more. Help shape the strategic direction of KYO and ensure our long-term success.",
    },
]

export default function VolunteerPage() {
    const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-volunteer');
    const volunteerImage = PlaceHolderImages.find(p => p.id === 'support-volunteer');

    return (
        <div>
            <PageHeader
                title="Volunteer With Us"
                subtitle="Share your time and talent to empower the next generation of musicians."
                image={headerImage}
            />
            <section className="container mx-auto">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-headline font-bold">Be the Heartbeat of KYO</h2>
                        <p className="text-muted-foreground text-lg">
                            Volunteers are essential to everything we do. From concert halls to classrooms, your energy and dedication create a vibrant, supportive community where young musicians can thrive. By giving your time, you become a partner in our mission and a role model for our students.
                        </p>
                        <p className="text-muted-foreground text-lg">
                            Whether you can offer a few hours at a single event or provide ongoing support, there’s a place for you at KYO Hub. Explore the opportunities to see how you can make a meaningful impact.
                        </p>
                         <Button asChild size="lg">
                            <Link href="/register">Sign Up to Volunteer</Link>
                        </Button>
                    </div>
                    {volunteerImage && (
                        <div className="rounded-lg overflow-hidden shadow-lg">
                            <Image
                                src={volunteerImage.imageUrl}
                                alt={volunteerImage.description}
                                width={600}
                                height={400}
                                className="object-cover w-full h-full"
                                data-ai-hint={volunteerImage.imageHint}
                            />
                        </div>
                    )}
                </div>
            </section>
            
            <section className="bg-secondary">
                <div className="container mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-headline font-bold">How You Can Help</h2>
                        <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-4">
                            We have a variety of roles to match your skills and availability.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {volunteerRoles.map(role => (
                             <Card key={role.title}>
                                <CardHeader className="flex flex-row items-start gap-4">
                                    <div className="bg-primary text-primary-foreground p-3 rounded-full mt-1">
                                        <role.icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="font-headline text-xl">{role.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{role.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

             <section>
                 <div className="container mx-auto">
                    <div className="rounded-lg bg-primary text-primary-foreground p-8 md:p-12 text-center">
                        <h2 className="text-3xl font-headline font-bold">Ready to Make a Difference?</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
                            Your contribution of time and expertise is one of the most valuable gifts you can give. Join our community of dedicated volunteers today.
                        </p>
                        <div className="mt-8 flex justify-center">
                            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold">
                                <Link href="/register">Become a Volunteer</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
