import PageHeader from "@/components/shared/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

export default function AboutPage() {
    const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-orchestras');
    const aboutImage = PlaceHolderImages.find(p => p.id === 'program-orchestra');

    return (
        <div>
            <PageHeader
                title="About KYO Hub"
                subtitle="Nurturing the next generation of musicians."
                image={headerImage}
            />
            <section className="container mx-auto">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-headline font-bold">Our Mission</h2>
                        <p className="text-muted-foreground text-lg">
                            Our mission is to provide exceptional music education and performance opportunities to young people, fostering artistic excellence, personal growth, and a lifelong love of music. We believe in creating an inclusive and supportive community where every student can thrive.
                        </p>
                         <p className="text-muted-foreground text-lg">
                            Since our founding, we have been dedicated to making high-quality music accessible to all, regardless of background or financial circumstances. We are proud to be a cultural cornerstone of the community.
                        </p>
                    </div>
                    {aboutImage && (
                        <div className="rounded-lg overflow-hidden shadow-lg">
                            <Image
                                src={aboutImage.imageUrl}
                                alt={aboutImage.description}
                                width={600}
                                height={400}
                                className="object-cover w-full h-full"
                                data-ai-hint={aboutImage.imageHint}
                            />
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
