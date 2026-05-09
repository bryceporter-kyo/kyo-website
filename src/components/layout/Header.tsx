
"use client";

import * as React from "react";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { motion } from "framer-motion";

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger as SheetTriggerPrimitive } from '@/components/ui/sheet';
import { Logo } from '@/components/icons/Logo';
import { cn } from '@/lib/utils';
import { useImages } from "@/components/providers/ImageProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ExternalLink } from '@/lib/links';
import { useData } from '@/components/providers/DataProvider';

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
  const { getLink } = useData();
  const { getImage } = useImages();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const [registrationLink, setRegistrationLink] = useState<ExternalLink | undefined>(undefined);

  useEffect(() => {
    setIsMounted(true);
    const link = getLink('register');
    if (link) {
      setRegistrationLink(link);
    }
  }, [getLink]);

    const isActive = (link: any) => {
        if (link.href === '/' && pathname !== '/') return false;
        if (link.href && pathname.startsWith(link.href)) return true;
        if (link.subLinks) {
            return link.subLinks.some((sub: any) => pathname.startsWith(sub.href));
        }
        return false;
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm shadow-sm transition-all duration-300">
            <div className="container mx-auto flex h-20 items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Logo variant="small" size={56} className="transition-transform group-hover:scale-105 duration-300" />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                {isMounted && (
                    <nav className="hidden md:flex items-center gap-3">
                        {navLinks.map((link) => {
                            const active = isActive(link);
                            
                            return link.subLinks ? (
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
                                        <button className={cn(
                                            "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-[1.1rem] font-medium transition-all h-10 px-5 py-2 cursor-pointer relative",
                                            active 
                                                ? "text-primary bg-primary/5 font-bold" 
                                                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                        )}>
                                            {link.name}
                                            {active && (
                                                <motion.div 
                                                    layoutId="nav-active"
                                                    className="absolute -bottom-1 left-5 right-5 h-0.5 bg-primary rounded-full"
                                                />
                                            )}
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent 
                                        align="start"
                                        className="rounded-xl border-primary/10 shadow-2xl p-2"
                                        onPointerEnter={() => setOpenDropdown(link.name)}
                                        onPointerLeave={() => setOpenDropdown(null)}
                                    >
                                        {link.subLinks.map((subLink) => {
                                            const subActive = pathname === subLink.href;
                                            return (
                                                <DropdownMenuItem key={subLink.name} asChild>
                                                    <Link 
                                                        href={subLink.href} 
                                                        className={cn(
                                                            "cursor-pointer rounded-lg px-4 py-2.5 transition-colors text-[1rem]",
                                                            subActive ? "bg-primary/10 text-primary font-bold" : "hover:bg-primary/5"
                                                        )}
                                                    >
                                                        {subLink.name}
                                                    </Link>
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link
                                    key={link.name}
                                    href={link.href!}
                                    className={cn(
                                        "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-[1.1rem] font-medium transition-all h-10 px-5 py-2 relative",
                                        active 
                                            ? "text-primary bg-primary/5 font-bold" 
                                            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                    )}
                                >
                                    {link.name}
                                    {active && (
                                        <motion.div 
                                            layoutId="nav-active"
                                            className="absolute -bottom-1 left-5 right-5 h-0.5 bg-primary rounded-full"
                                        />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                )}

        <div className="hidden md:flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-xl h-11 px-8 text-[1.1rem] font-bold">Register</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden border-none bg-transparent">
              <DialogHeader className="sr-only">
                <DialogTitle>Select Registration Program</DialogTitle>
                <DialogDescription>Choose between the Orchestras or Upbeat! program registration forms.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <Link href="/programs/orchestras/registration" onClick={() => setOpenDropdown(null)}>
                  <Card className="group relative overflow-hidden h-[300px] border-none hover:ring-2 hover:ring-primary transition-all duration-300">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${getImage('page-header-orchestras')?.imageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold font-headline mb-2">Orchestras</h3>
                      <p className="text-sm text-white/80 mb-4">Junior, Intermediate, and Senior programs.</p>
                      <div className="flex items-center text-sm font-bold group-hover:translate-x-2 transition-transform">
                        Register Now <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/programs/upbeat/registration" onClick={() => setOpenDropdown(null)}>
                  <Card className="group relative overflow-hidden h-[300px] border-none hover:ring-2 hover:ring-primary transition-all duration-300">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${getImage('page-header-upbeat')?.imageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold font-headline mb-2">Upbeat!</h3>
                      <p className="text-sm text-white/80 mb-4">Specialized program for younger musicians.</p>
                      <div className="flex items-center text-sm font-bold group-hover:translate-x-2 transition-transform">
                        Register Now <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTriggerPrimitive asChild>
              <Button variant="ghost" size="icon" className="h-12 w-12">
                <Menu className="h-8 w-8" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTriggerPrimitive>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="inline-block py-4">
                    <Logo variant="small" size={64} />
                </Link>
              </SheetHeader>
              <div className="p-4 pt-0 mt-6">
                <nav className="flex flex-col gap-5">
                  {navLinks.map((link) => (
                     link.subLinks ? (
                        <div key={link.name} className="space-y-3">
                            <h3 className="font-bold text-muted-foreground px-4 py-2 text-sm uppercase tracking-widest">{link.name}</h3>
                            {link.subLinks.map(subLink => (
                                <Link
                                    key={subLink.name}
                                    href={subLink.href}
                                    className="block px-8 py-3 text-[1.2rem] font-medium hover:text-primary transition-colors"
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
                            className="text-[1.3rem] font-bold px-4 py-3 hover:text-primary transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                     )
                  ))}
                </nav>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-10 h-14 text-lg font-bold rounded-2xl">Register</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px] p-4">
                    <DialogHeader>
                      <DialogTitle className="text-center font-headline text-2xl mb-4">Choose a Program</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                      <Link href="/programs/orchestras/registration" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full h-16 justify-between text-lg font-headline px-6 group">
                          Orchestras
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link href="/programs/upbeat/registration" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full h-16 justify-between text-lg font-headline px-6 group">
                          Upbeat!
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

    