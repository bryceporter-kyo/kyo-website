
"use client";

import PageHeader from "@/components/shared/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight, ExternalLink, Gift, Heart, CreditCard, Mail, Car, Landmark, HandCoins } from "lucide-react";
import { getLinkById } from "@/lib/links";

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

const donationOptions = [
    { name: 'One-Time Donation', linkId: 'donate-stripe-one-time', icon: Heart },
    { name: 'Monthly Donation', href: '/donate', icon: Gift },
    { name: 'Donate via CanadaHelps', linkId: 'donate-canadahelps-general', icon: CreditCard },
    { name: 'Donate Securities', linkId: 'donate-canadahelps-securities', icon: Landmark },
    { name: 'Donate by E-Transfer', linkId: 'donate-email', icon: Mail },
    { name: 'Donate by Cheque', href: '/donate', icon: Mail },
    { name: 'Donate to the Tenuto Trust', linkId: 'tenuto-trust', icon: Landmark },
    { name: 'Donate an Instrument', linkId: 'contact-instrument-donation', icon: HandCoins },
    { name: 'Donate a Car', linkId: 'donate-a-car', icon: Car },
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">Donation Options</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {donationOptions.map(option => {
                                    const link = option.linkId ? getLinkById(option.linkId) : null;
                                    const href = link ? link.url : option.href;
                                    if (!href) return null;

                                    const isExternal = href.startsWith('http') || href.startsWith('mailto');
                                    const Icon = isExternal ? ExternalLink : ChevronRight;

                                    return (
                                        <li key={option.name}>
                                            <Link href={href} target={isExternal ? '_blank' : '_self'} rel={isExternal ? 'noopener noreferrer' : ''} className="flex items-start text-primary hover:underline">
                                                <Icon className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                                                <span>{option.name}</span>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
