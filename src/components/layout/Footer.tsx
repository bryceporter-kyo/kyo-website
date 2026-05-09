
"use client";

import { Logo } from "@/components/icons/Logo";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Mail, MapPin, Phone, Cookie } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from 'react';
import type { ExternalLink } from '@/lib/links';
import { useData } from '@/components/providers/DataProvider';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Orchestras', href: '/programs/orchestras' },
  { name: 'Upbeat!', href: '/programs/upbeat' },
  { name: 'Lessons', href: '/programs/lessons' },
  { name: 'Donate', href: '/support-us/donate' },
];

type SocialLink = {
  name: string;
  link: ExternalLink | undefined;
  icon: React.ElementType;
}

type LegalLink = {
    name: string;
    href: string;
}

const legalLinks: LegalLink[] = [
    { name: 'Legal Overview', href: '/legal' },
    { name: 'Privacy Policy', href: '/legal/privacy-policy' },
    { name: 'Terms of Use', href: '/legal/terms-of-use' },
    { name: 'Accessibility', href: '/legal/accessibility-policy' },
];

export default function Footer() {
  const { getLink, legalPages } = useData();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [mailingAddressLink, setMailingAddressLink] = useState<ExternalLink | undefined>(undefined);
  const [physicalAddressLink, setPhysicalAddressLink] = useState<ExternalLink | undefined>(undefined);
  const [phoneLink, setPhoneLink] = useState<ExternalLink | undefined>(undefined);
  const [emailLink, setEmailLink] = useState<ExternalLink | undefined>(undefined);
  const [registrationLink, setRegistrationLink] = useState<ExternalLink | undefined>(undefined);

  useEffect(() => {
    const facebookLink = getLink('social-facebook');
    const instagramLink = getLink('social-instagram');
    setSocialLinks([
      { name: 'Facebook', link: facebookLink, icon: Facebook },
      { name: 'Instagram', link: instagramLink, icon: Instagram },
    ]);
    setMailingAddressLink(getLink('address-mailing'));
    setPhysicalAddressLink(getLink('address-physical'));
    setPhoneLink(getLink('contact-phone'));
    setEmailLink(getLink('contact-main'));
    setRegistrationLink(getLink('register'));
  }, [getLink]);

  const openCookieSettings = () => {
    const event = new CustomEvent('openCookieSettings');
    window.dispatchEvent(event);
  };

  return (
    <footer className="bg-secondary">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <Link href="/" className="block">
              <Logo fullWidth={true} className="max-w-[400px] md:max-w-none" />
            </Link>
          </div>

          <div className="md:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase font-headline">Quick Links</h3>
                <ul className="mt-4 space-y-2">
                  {navLinks.slice(1).map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-base text-muted-foreground hover:text-primary transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    {registrationLink && (
                      <Link href={registrationLink.url} target="_blank" rel="noopener noreferrer" className="text-base text-muted-foreground hover:text-primary transition-colors">
                        Register
                      </Link>
                    )}
                  </li>
                </ul>
              </div>

              <div className="md:col-span-3">
                <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase font-headline">Contact Us</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2 group">
                    <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-primary group-hover:scale-110 transition-transform" />
                    {mailingAddressLink && (
                      <a href={mailingAddressLink.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-sm">
                          P.O. Box 53, 150 King Street<br/>Peterborough ON, K9J 6Y5
                      </a>
                    )}
                  </li>
                  <li className="flex items-start gap-2 group">
                    <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-primary group-hover:scale-110 transition-transform" />
                     {physicalAddressLink && (
                      <a href={physicalAddressLink.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-sm">
                          221 Romaine Street<br/>Peterborough, ON, K9J 2C3
                      </a>
                     )}
                  </li>
                  <li className="flex items-center gap-2 group">
                    <Phone className="w-5 h-5 shrink-0 text-primary group-hover:scale-110 transition-transform" />
                    {phoneLink && <a href={phoneLink.url} className="hover:text-primary transition-colors">{phoneLink.url.replace('tel:', '')}</a>}
                  </li>
                  <li className="flex items-center gap-2 group">
                    <Mail className="w-5 h-5 shrink-0 text-primary group-hover:scale-110 transition-transform" />
                    <a href="mailto:Contactus@thekyo.ca" className="hover:text-primary transition-colors">Contactus@thekyo.ca</a>
                  </li>
                </ul>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase font-headline">Compliance</h3>
                <ul className="mt-4 space-y-2">
                  {legalLinks.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-base text-muted-foreground hover:text-primary transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                  {legalPages.filter(p => p.showInFooter).map((page) => (
                    <li key={page.id}>
                      <Link href={`/legal/${page.slug}`} className="text-base text-muted-foreground hover:text-primary transition-colors">
                        {page.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-primary/5 space-y-4">
              <p className="text-[1.1rem] font-bold text-foreground leading-relaxed italic">
                Every young musician belongs here.
              </p>
              <div className="text-xs text-muted-foreground leading-relaxed max-w-4xl space-y-3">
                <p>
                  Kawartha Youth Orchestra (KYO) is a registered charitable nonprofit organization (CRA #89168 2700 RR 0001). 
                  Our mission is to provide youth with access to high-quality music education and orchestral training in a safe, 
                  welcoming community where they can develop artistry, build social connections, grow in confidence, and foster 
                  a lifelong love of music.
                </p>
                <p>
                  We are deeply grateful for the generous support of the Community Foundation of Greater Peterborough, Google Ads Grants, 
                  NetSuite Social Impact, the City of Peterborough Community Investment Grant, the Lloyd Carr Harris Foundation, 
                  the Aqueduct Foundation, and the F.K. Morrow Foundation. Your support makes this community possible.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between">
            <div className="text-sm text-muted-foreground flex items-center gap-4">
                <Link href="/admin" className="hover:text-primary">Admin Panel</Link>
                <Link href="/internal" className="hover:text-primary">KYO Internal</Link>
                <button onClick={openCookieSettings} className="hover:text-primary flex items-center gap-1"><Cookie className="w-4 h-4"/>Cookie Settings</button>
            </div>
            <p className="text-sm text-muted-foreground text-center flex-1">
                &copy; 2025 Kawartha Youth Orchestra. All rights reserved.
            </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            {socialLinks.map((social) => (
              social.link && (
                <a key={social.name} href={social.link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                  <social.icon className="h-6 w-6" />
                  <span className="sr-only">{social.name}</span>
                </a>
              )
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
