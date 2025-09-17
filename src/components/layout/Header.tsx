
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger as SheetTriggerPrimitive } from '@/components/ui/sheet';
import { Logo } from '@/components/icons/Logo';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getLinkById } from '@/lib/links';
import type { ExternalLink } from '@/lib/links';

const navLinks = [
  { name: 'Home', href: '/' },
  {
    name: 'About Us',
    href: '/about',
    subLinks: [
      { name: 'Our Story', href: '/about' },
      { name: 'Staff & Board', href: '/staff' },
    ]
  },
  {
    name: 'Programs',
    href: '#',
    subLinks: [
      { name: 'The Orchestras', href: '/orchestras' },
      { name: 'Upbeat!', href: '/upbeat' },
      { name: 'Lessons', href: '/lessons' },
    ]
  },
  { name: 'Calendar', href: '/calendar' },
  {
    name: 'Support Us',
    href: '/support',
    subLinks: [
        { name: 'Ways to Give', href: '/support' },
        { name: 'Donate', href: '/donate' },
        { name: 'Volunteer', href: '/volunteer' },
    ]
  },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [registrationLink, setRegistrationLink] = useState<ExternalLink | undefined>(undefined);

  useEffect(() => {
    setRegistrationLink(getLinkById('register'));
  }, []);


  const handleMenuInteraction = (name: string, open: boolean) => {
    setOpenMenus(prev => ({ ...prev, [name]: open }));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
            <Logo />
            </Link>
        </div>


        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            link.subLinks ? (
              <DropdownMenu key={link.name} open={openMenus[link.name]} onOpenChange={(open) => handleMenuInteraction(link.name, open)}>
                <DropdownMenuTrigger asChild>
                  <div
                    onMouseEnter={() => handleMenuInteraction(link.name, true)}
                    className="flex items-center gap-1 cursor-default text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.name} <ChevronDown className="h-4 w-4" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent onMouseLeave={() => handleMenuInteraction(link.name, false)}>
                  {link.subLinks.map(subLink => (
                    <DropdownMenuItem key={subLink.name} asChild>
                      <Link href={subLink.href} className={cn("cursor-pointer", pathname === subLink.href && "font-bold")}>{subLink.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.name}
              </Link>
            )
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {registrationLink && (
            <Button asChild>
              <Link href={registrationLink.url} target="_blank" rel="noopener noreferrer">Register</Link>
            </Button>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTriggerPrimitive asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTriggerPrimitive>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                        <Logo />
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="h-6 w-6" />
                        <span className="sr-only">Close menu</span>
                    </Button>
                </div>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                     link.subLinks ? (
                        <div key={link.name}>
                            <h3 className="font-semibold text-muted-foreground px-4 py-2">{link.name}</h3>
                            {link.subLinks.map(subLink => (
                                <Link
                                    key={subLink.name}
                                    href={subLink.href}
                                    className="block px-8 py-2 text-lg"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {subLink.name}
                                </Link>
                            ))}
                        </div>
                     ) : (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-lg font-medium"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                     )
                  ))}
                </nav>
                 {registrationLink && (
                  <Button asChild className="w-full mt-8">
                      <Link href={registrationLink.url} target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
