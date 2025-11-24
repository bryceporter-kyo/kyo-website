
import PageHeader from "@/components/shared/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";

const mainSections = [
    { name: 'Home', href: '/' },
    {
        name: 'About Us',
        subLinks: [
            { name: 'Our Story', href: '/about' },
            { name: 'Team', href: '/team' },
        ]
    },
    {
        name: 'Programs',
        subLinks: [
            { name: 'The Orchestras', href: '/orchestras' },
            { name: 'Upbeat!', href: '/upbeat' },
            { name: 'Lessons', href: '/lessons' },
        ]
    },
    { name: 'Calendar', href: '/calendar' },
    {
        name: 'Support Us',
        subLinks: [
            { name: 'Ways to Give', href: '/support' },
            { name: 'Donate', href: '/donate' },
            { name: 'Donation Options', href: '/donate' },
            { name: 'Volunteer', href: '/volunteer' },
        ]
    },
    { name: 'Contact', href: '/contact' },
];

const legalSections = [
    { name: 'Privacy & Cookie Policy', href: '/legal/privacy-policy' },
    { name: 'Terms & Conditions', href: '/legal/terms-and-conditions' },
    { name: 'Digital Terms of Use', href: '/legal/terms-of-use' },
    { name: 'Accessibility Policy', href: '/legal/accessibility-policy' },
    { name: 'Hiring & EEO Policy', href: '/legal/hiring-policy' },
    { name: 'Protection of Children and Vulnerable Persons Policy', href: '/legal/protection-of-children-and-vulnerable-persons-policy' },
    { name: 'Information Accuracy Policy', href: '/legal/information-accuracy-policy' },
];

const utilitySections = [
    { name: 'Admin Panel', href: '/admin' },
    { name: 'KYO Internal', href: '/internal' },
];

export default function SitemapPage() {
    const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-conditions');

    return (
        <div>
            <PageHeader
                title="Sitemap"
                subtitle="An overview of the Kawartha Youth Orchestra website."
                image={headerImage}
            />
            <section className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">Main Website</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {mainSections.map(section => (
                                    <li key={section.name}>
                                        {section.href ? (
                                            <Link href={section.href} className="flex items-start text-primary hover:underline">
                                                <ChevronRight className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                                                <span>{section.name}</span>
                                            </Link>
                                        ) : (
                                            <p className="font-semibold text-muted-foreground">{section.name}</p>
                                        )}
                                        {section.subLinks && (
                                            <ul className="pl-6 mt-2 space-y-2 border-l ml-2">
                                                {section.subLinks.map(subLink => (
                                                    <li key={subLink.name}>
                                                        <Link href={subLink.href} className="flex items-start text-primary hover:underline">
                                                            <ChevronRight className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                                                            <span>{subLink.name}</span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">Legal & Policies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {legalSections.map(link => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="flex items-start text-primary hover:underline">
                                            <ChevronRight className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                                            <span>{link.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                     <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-xl">Utility</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {utilitySections.map(link => (
                                        <li key={link.name}>
                                            <Link href={link.href} className="flex items-start text-primary hover:underline">
                                                <ChevronRight className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                                                <span>{link.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                    <li>
                                        <Link href="/sitemap" className="flex items-start text-primary hover:underline">
                                            <ChevronRight className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                                            <span>Sitemap</span>
                                        </Link>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                         <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-xl">External Forms</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                     <li>
                                        <a href="https://docs.google.com/forms/d/e/1FAIpQLSf3tGbfSdo8jdVtx85G7BbX0c4AVxTgRUviCLkhbBDbXia19A/viewform?usp=sf_link" target="_blank" rel="noopener noreferrer" className="flex items-start text-primary hover:underline">
                                            <ExternalLink className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                                            <span>Main Registration Form</span>
                                        </a>
                                    </li>
                                     <li>
                                        <a href="https://forms.gle/tUwncYLCnuALW8FT7" target="_blank" rel="noopener noreferrer" className="flex items-start text-primary hover:underline">
                                            <ExternalLink className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                                            <span>Upbeat! Registration Form</span>
                                        </a>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    );
}
