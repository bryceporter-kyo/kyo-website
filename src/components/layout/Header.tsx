"use client";

import * as React from "react";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger as SheetTriggerPrimitive } from '@/components/ui/sheet';
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
    subLinks: [
      { name: 'Our Story', href: '/about' },
      { name: 'Our Team & Directors', href: '/team' },
    ]
  },
  {
    name: 'Programs',
    subLinks: [
      { name: 'The Orchestras', href: '/orchestras' },
      { name: 'Upbeat!', href: '/upbeat' },
      { name: 'Instrumental Lessons', href: '/lessons' },
    ]
  },
  { name: 'Calendar', href: '/calendar' },
  {
    name: 'Support Us',
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
  const [isMounted, setIsMounted] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const [registrationLink, setRegistrationLink] = useState<ExternalLink | undefined>(undefined);

  useEffect(() => {
    setIsMounted(true);
    const link = getLinkById('register');
    if (link) {
      setRegistrationLink(link);
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
            <Logo />
            </Link>
        </div>

        {/* Desktop Navigation */}
        {isMounted && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              link.subLinks ? (
                <DropdownMenu 
                  key={link.name}
                  open={openDropdown === link.name}
                  onOpenChange={(open) => setOpenDropdown(open ? link.name : null)}
                >
                  <DropdownMenuTrigger 
                    asChild
                    onPointerEnter={() => setOpenDropdown(link.name)}
                    onPointerLeave={() => setOpenDropdown(null)}
                  >
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-default">
                      {link.name}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start"
                    onPointerEnter={() => setOpenDropdown(link.name)}
                    onPointerLeave={() => setOpenDropdown(null)}
                  >
                    {link.subLinks.map((subLink) => (
                      <DropdownMenuItem key={subLink.name} asChild>
                        <Link href={subLink.href} className="cursor-pointer">
                          {subLink.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.name}
                  href={link.href!}
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2",
                    pathname === link.href ? 'font-bold' : ''
                  )}
                >
                  {link.name}
                </Link>
              )
            ))}
          </nav>
        )}

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
              <SheetHeader>
                <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <Logo />
                </Link>
              </SheetHeader>
              <div className="p-4 pt-0 mt-4">
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
                            href={link.href!}
                            className="text-lg font-medium px-4 py-2"
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
