import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getImagesByIds } from "@/lib/image-service-server";
import { Gift, Handshake, Heart } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';

const supportOptions = [
    {
        icon: Heart,
        title: "Volunteer Your Time",
        description: "We rely on dedicated volunteers to help with concerts, events, and administrative tasks. Whether you can help usher at a concert, assist with mailings, or serve on a committee, your time and talent are invaluable to us. It's a great way to get involved and see our programs in action.",
        cta: "Become a Volunteer"
    },
    {
        icon: Handshake,
        title: "Corporate Sponsorships",
        description: "Partner with KYO Hub to support the arts in our community while gaining visibility for your business. We offer a variety of sponsorship packages with benefits like concert program ads, website recognition, and event tickets. Align your brand with artistic excellence and youth development.",
        cta: "Learn About Sponsorship"
    },
    {
        icon: Gift,
        title: "In-Kind Donations",
        description: "Non-monetary contributions are a great way to support our mission. We welcome donations of new or gently-used musical instruments, office supplies, and professional services such as printing, marketing, or photography. Your in-kind gift helps us reduce operational costs.",
        cta: "Make an In-Kind Gift"
    }
]

export default async function SupportPage() {
    const images = await getImagesByIds(['page-header-support', 'support-volunteer', 'support-cta']);
    const headerImage = images.get('page-header-support');
    const supportImage = images.get('support-volunteer');
    const supportCtaImage = images.get('support-cta');

    return (
        <div>
            <PageHeader
                title="Support KYO Hub"
                subtitle="There are many ways to contribute to our mission."
                image={headerImage}
            />
            <section className="container mx-auto">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-headline font-bold">More Than Just a Donation</h2>
                        <p className="text-muted-foreground text-lg">
                            Financial contributions are vital, but your support can come in many forms. By giving your time, resources, or expertise, you become a partner in our mission to nurture young musicians. Every act of support helps us create a vibrant and accessible musical community.
                        </p>
                         <p className="text-muted-foreground text-lg">
                            Explore the options below to find the best way for you to make an impact. We are deeply grateful for our community of supporters who make our work possible.
                        </p>
                    </div>
                    {supportImage && (
                        <div className="rounded-lg overflow-hidden shadow-lg">
                            <Image 
                                src={supportImage.imageUrl}
                                alt={supportImage.description}
                                width={600}
                                height={400}
                                className="object-cover w-full h-full"
                                data-ai-hint={supportImage.imageHint}
                            />
                        </div>
                    )}
                </div>

                 <div className="mt-24">
                     <div className="text-center mb-12">
                        <h2 className="text-3xl font-headline font-bold">Ways to Give</h2>
                        <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mt-4">
                            Find the perfect way to share your passion for music and community.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {supportOptions.map(option => (
                            <Card key={option.title} className="text-center flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                <CardHeader className="items-center">
                                    <div className="bg-primary text-primary-foreground p-4 rounded-full">
                                        <option.icon className="h-8 w-8" />
                                    </div>
                                    <CardTitle className="font-headline text-2xl pt-4">{option.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-muted-foreground">{option.description}</p>
                                </CardContent>
                                <div className="p-6 pt-0">
                                    <Button variant="outline">{option.cta}</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                 </div>
            </section>

             <section className="bg-secondary">
                 <div className="container mx-auto">
                    <div className="rounded-lg bg-primary text-primary-foreground p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center overflow-hidden">
                        <div className="text-center md:text-left relative z-10">
                            <h2 className="text-3xl font-headline font-bold">Become a Benefactor</h2>
                            <p className="mt-4 max-w-xl mx-auto md:mx-0 text-lg text-primary-foreground/80">
                                Your contribution, whether time, talent, or a donation, is an investment in the future of arts and culture in our community. Join us and make a lasting impact.
                            </p>
                            <div className="mt-8 flex justify-center md:justify-start">
                                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold">
                                    <Link href="/donate">Donate Now</Link>
                                </Button>
                            </div>
                        </div>
                         {supportCtaImage && (
                            <div className="relative h-64 md:h-full">
                                <Image
                                    src={supportCtaImage.imageUrl}
                                    alt={supportCtaImage.description}
                                    fill
                                    className="object-cover rounded-lg"
                                    data-ai-hint={supportCtaImage.imageHint}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
