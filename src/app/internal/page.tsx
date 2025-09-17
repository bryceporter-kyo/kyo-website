
import PageHeader from "@/components/shared/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Folder, Users, DollarSign, Handshake, Cpu, Settings, Briefcase, FileText, ExternalLink, Mail } from "lucide-react";

const internalSections = [
    {
        title: "Board of Directors",
        icon: Users,
        chair: "Bryce Porter",
        email: "bryce.porter@thekyo.ca",
        driveLink: "https://docs.google.com/folderview?authuser=0&id=0AIg5MzxiNC6kUk9PVA"
    },
    {
        title: "Business & Finance",
        icon: DollarSign,
        chair: "Bryce Porter",
        email: "bryce.porter@thekyo.ca",
        driveLink: "https://docs.google.com/folderview?authuser=0&id=0AErmWCq_aldfUk9PVA"
    },
    {
        title: "Community Engagement",
        icon: Handshake,
        chair: "Joy Simmonds",
        email: "joy.simmonds@thekyo.ca",
        driveLink: "https://docs.google.com/folderview?authuser=0&id=0AEyvIWCQxa5sUk9PVA"
    },
    {
        title: "IT and Data",
        icon: Cpu,
        chair: "IT Admin",
        email: "it-admin@thekyo.ca",
        driveLink: "https://docs.google.com/folderview?authuser=0&id=0AGcOhRlolhPGUk9PVA"
    },
    {
        title: "Operations",
        icon: Settings,
        chair: "Carolyn Hoy",
        email: "carolyn.hoy@thekyo.ca",
        driveLink: "https://docs.google.com/folderview?authuser=0&id=0AGGadfYGeR4gUk9PVA"
    },
    {
        title: "Programming",
        icon: Briefcase,
        chair: "Colin McMahon",
        email: "colin.mcmahon@thekyo.ca",
        driveLink: "https://docs.google.com/folderview?authuser=0&id=0AJg3p-IjDhMHUk9PVA"
    },
    {
        title: "HR & Compliance",
        icon: Users,
        chair: "HR Committee",
        email: "hr-committee@thekyo.ca",
        driveLink: "https://docs.google.com/folderview?authuser=0&id=0ALlBblkGfNM0Uk9PVA"
    },
    {
        title: "Templates",
        icon: FileText,
        chair: "IT Admin",
        email: "it-admin@thekyo.ca",
        driveLink: "https://docs.google.com/folderview?authuser=0&id=0AAAYa0lcUo66Uk9PVA"
    }
];

const externalLinks = [
    { title: "CEC One-time Donation", href: "https://donate.stripe.com/bIYdT82n68Nqdyw28a" },
    { title: "CEC Recurring Donation", href: "https://buy.stripe.com/3cs9CSgdWaVycus6or" },
    { title: "New Director Form", href: "https://docs.google.com/forms/d/e/1FAIpQLSfCu3Ed8NGQ3SuiAzBhmmRz-zUVuD55nmTqKaTzvfAsTQl_IA/viewform?usp=sf_link" },
    { title: "KYO By-Laws", href: "https://docs.google.com/document/d/1LBWfo3YOSOn7JJvfJiCwGWWTntUW8dAwLoz_Nuetfbk/edit?usp=sharing" },
    { title: "HR Policy Manual", href: "https://drive.google.com/a/thekyo.ca/open?id=1WFsMZhoSSsYpqtrEi8b6juUixMuTuH9Y7LlzvBPxlWY" },
    { title: "New Volunteer Form", href: "https://docs.google.com/forms/d/e/1FAIpQLSehFJqXQ9jCuahd538rDKSOmtrEpDaF159wXOaTl3dXhMuMqA/viewform?usp=sf_link" },
    { title: "KYO Tech Stack", href: "https://docs.google.com/spreadsheets/d/10SfPaiyl-DUtscwcpLAbeYcN7schQK4p9WQ2YuyacsY/edit?usp=sharing" },
    { title: "Fees & Bursaries", href: "https://docs.google.com/spreadsheets/d/1ruAwHlTZcXh9fLSkyCzIWYuEDSqrS6Ye/edit?usp=sharing&ouid=104354503853228405665&rtpof=true&sd=true" },
    { title: "Program Registration", href: "https://docs.google.com/spreadsheets/d/1yV-a2IjwgvRxBg9W7I63_RBMQh-MCRT0shMAHHim1Sk/edit?usp=sharing" },
    { title: "Program Offerings", href: "https://docs.google.com/document/d/1z31RtdleoYDg3oj46WJosGbwpSMVO2IenE4nUNMXunk/edit?usp=sharing" },
    { title: "2024-2025 Budget", href: "https://docs.google.com/spreadsheets/d/16sXl5dRiIOKwEaERmGNvJwtIxW7O8kZiL43N0SSH9Fc/edit?gid=1242267988#gid=1242267988" }
]

export default function InternalPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-internal');
  return (
    <div>
      <PageHeader
        title="KYO Internal Resources"
        subtitle="This section is for internal staff, board, and volunteer use."
        image={headerImage}
      />
      <section className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {internalSections.map(section => (
                <Card key={section.title} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                             <section.icon className="w-8 h-8 text-primary" />
                             <CardTitle className="font-headline text-xl">{section.title}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                        <p className="text-sm text-muted-foreground">Chair: {section.chair}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4"/>
                            <a href={`mailto:${section.email}`} className="hover:text-primary">{section.email}</a>
                        </div>
                    </CardContent>
                    <div className="p-6 pt-0">
                        <Button asChild variant="outline" className="w-full">
                            <Link href={section.driveLink} target="_blank" rel="noopener noreferrer">
                                <Folder className="mr-2"/>
                                View Drive Folder
                            </Link>
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
         <Card className="mt-12">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Quick Links</CardTitle>
                <CardDescription>Important documents and resources.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {externalLinks.map(link => (
                        <Button asChild variant="ghost" className="justify-start" key={link.title}>
                            <Link href={link.href} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2"/>
                                {link.title}
                            </Link>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
