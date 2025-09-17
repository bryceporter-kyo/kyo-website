
import { Logo } from "@/components/icons/Logo";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Orchestras', href: '/orchestras' },
  { name: 'Upbeat!', href: '/upbeat' },
  { name: 'Lessons', href: '/lessons' },
  { name: 'Donate', href: '/donate' },
];

const legalLinks = [
  { name: 'Privacy & Cookie Policy', href: '/legal/privacy-policy' },
  { name: 'Digital Terms of Use', href: '/legal/terms-of-use' },
  { name: 'Hiring & EEO Policy', href: '/legal/hiring-policy' },
  { name: 'Terms & Conditions', href: '/legal/terms-and-conditions' },
];

const socialLinks = [
  { name: 'Facebook', href: 'https://www.facebook.com/The.KYO.Ptbo/', icon: Facebook },
  { name: 'Instagram', href: 'https://www.instagram.com/thekawarthayouthorchestra', icon: Instagram },
];

export default function Footer() {
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
                <Link href="/register" className="text-base text-muted-foreground hover:text-primary">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Contact Us</h3>
            <ul className="mt-4 space-y-2 text-muted-foreground">
               <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-1 shrink-0 text-primary" />
                <a href="https://www.google.com/maps/search/?api=1&query=P.O.+Box+53,+150+King+Street,+Peterborough+ON+K9J+6Y5" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    P.O. Box 53, 150 King Street<br/>Peterborough ON, K9J 6Y5
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-1 shrink-0 text-primary" />
                 <a href="https://www.google.com/maps/search/?api=1&query=221+Romaine+Street,+Peterborough,+ON,+K9J+2C3" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    221 Romaine Street<br/>Peterborough, ON, K9J 2C3
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 shrink-0 text-primary" />
                <a href="tel:705-410-4025" className="hover:text-primary">705-410-4025</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 shrink-0 text-primary" />
                <a href="mailto:ContactUs@thekyo.ca" className="hover:text-primary">ContactUs@thekyo.ca</a>
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
            <div className="text-sm text-muted-foreground">
                <Link href="/admin" className="hover:text-primary">Admin Panel</Link>
            </div>
            <p className="text-sm text-muted-foreground text-center flex-1">
                &copy; 2025 Kawartha Youth Orchestra. All rights reserved.
            </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            {socialLinks.map((social) => (
              <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <social.icon className="h-6 w-6" />
                <span className="sr-only">{social.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
