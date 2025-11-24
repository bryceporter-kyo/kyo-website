
"use client";

import { Logo } from "@/components/icons/Logo";
import { Button } from "@/components/ui/button";
import { getLinkById } from "@/lib/links";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from 'react';
import type { ExternalLink } from '@/lib/links';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Orchestras', href: '/orchestras' },
  { name: 'Upbeat!', href: '/upbeat' },
  { name: 'Lessons', href: '/lessons' },
  { name: 'Donate', href: '/donate' },
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

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [mailingAddressLink, setMailingAddressLink] = useState<ExternalLink | undefined>(undefined);
  const [physicalAddressLink, setPhysicalAddressLink] = useState<ExternalLink | undefined>(undefined);
  const [phoneLink, setPhoneLink] = useState<ExternalLink | undefined>(undefined);
  const [emailLink, setEmailLink] = useState<ExternalLink | undefined>(undefined);
  const [registrationLink, setRegistrationLink] = useState<ExternalLink | undefined>(undefined);
  const [legalLinks, setLegalLinks] = useState<LegalLink[]>([]);

  useEffect(() => {
    const facebookLink = getLinkById('social-facebook');
    const instagramLink = getLinkById('social-instagram');
    setSocialLinks([
      { name: 'Facebook', link: facebookLink, icon: Facebook },
      { name: 'Instagram', link: instagramLink, icon: Instagram },
    ]);
    setMailingAddressLink(getLinkById('address-mailing'));
    setPhysicalAddressLink(getLinkById('address-physical'));
    setPhoneLink(getLinkById('contact-phone'));
    setEmailLink(getLinkById('contact-main'));
    setRegistrationLink(getLinkById('register'));
    setLegalLinks([
        { name: 'Privacy & Cookie Policy', href: '/legal/privacy-policy' },
        { name: 'Terms & Conditions', href: '/legal/terms-and-conditions' },
        { name: 'Accessibility Policy', href: '/legal/accessibility-policy' },
        { name: 'Protection Policy', href: '/legal/protection-of-children-and-vulnerable-persons-policy' },
    ]);
  }, []);

  return (
    <footer className="bg-secondary">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="space-y-4 md:col-span-5">
            <Link href="/">
              <Logo />
            </Link>
            <p className="text-sm text-muted-foreground">
              Nurturing the next generation of musicians.
            </p>
            <p className="text-sm text-muted-foreground">
              Kawartha Youth Orchestra (KYO) is a registered charitable nonprofit organization (CRA #89168 2700 RR 0001). We are grateful for the support of the Community Foundation of Greater Peterborough, Google Grants, NetSuite Social Impact, the City of Peterborough Community Investment Grant, the Lloyd Carr Harris Foundation, and the F.K. Morrow Foundation.
            </p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              {navLinks.slice(1).map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-base text-muted-foreground hover:text-primary">
                    {link.name}
                  </Link>
                </li>
              ))}
               <li>
                {registrationLink && (
                  <Link href={registrationLink.url} target="_blank" rel="noopener noreferrer" className="text-base text-muted-foreground hover:text-primary">
                    Register
                  </Link>
                )}
              </li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Contact Us</h3>
            <ul className="mt-4 space-y-2 text-muted-foreground">
               <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-1 shrink-0 text-primary" />
                {mailingAddressLink && (
                  <a href={mailingAddressLink.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      P.O. Box 53, 150 King Street<br/>Peterborough ON, K9J 6Y5
                  </a>
                )}
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-1 shrink-0 text-primary" />
                 {physicalAddressLink && (
                  <a href={physicalAddressLink.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      221 Romaine Street<br/>Peterborough, ON, K9J 2C3
                  </a>
                 )}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 shrink-0 text-primary" />
                {phoneLink && <a href={phoneLink.url} className="hover:text-primary">{phoneLink.url.replace('tel:', '')}</a>}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 shrink-0 text-primary" />
                {emailLink && <a href={emailLink.url} className="hover:text-primary">{emailLink.url.replace('mailto:', '')}</a>}
              </li>
            </ul>
          </div>
           <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-base text-muted-foreground hover:text-primary">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between">
            <div className="text-sm text-muted-foreground flex items-center gap-4">
                <Link href="/admin" className="hover:text-primary">Admin Panel</Link>
                <Link href="/internal" className="hover:text-primary">KYO Internal</Link>
                <Link href="/sitemap" className="hover:text-primary">Sitemap</Link>
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
