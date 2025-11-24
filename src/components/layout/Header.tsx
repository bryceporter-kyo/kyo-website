
"use client";

import * as React from "react";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger as SheetTriggerPrimitive } from '@/components/ui/sheet';
import { Logo } from '@/components/icons/Logo';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { getLinkById } from '@/lib/links';
import type { ExternalLink } from '@/lib/links';

const navLinks = [
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
        { name: 'Volunteer', href: '/volunteer' },
    ]
  },
  { name: 'Contact', href: '/contact' },
];

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href!}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"


export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [registrationLink, setRegistrationLink] = useState<ExternalLink | undefined>(undefined);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
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
        <NavigationMenu
          className="hidden md:flex"
        >
          <NavigationMenuList onMouseLeave={() => setActiveMenu(null)}>
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.name} value={link.name}>
                {link.subLinks ? (
                  <>
                    <NavigationMenuTrigger
                        onMouseEnter={() => setActiveMenu(link.name)}
                        className={cn(navigationMenuTriggerStyle(), activeMenu === link.name && "bg-accent/50")}
                    >
                        {link.name}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[200px] lg:w-[250px] ">
                        {link.subLinks.map((subLink) => (
                           <ListItem key={subLink.name} href={subLink.href} title={subLink.name} />
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                   <NavigationMenuLink asChild>
                     <Link
                      href={link.href!}
                      onMouseEnter={() => setActiveMenu(null)}
                      className={cn(navigationMenuTriggerStyle(), pathname === link.href ? 'font-bold' : '')}
                    >
                      {link.name}
                    </Link>
                   </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

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
