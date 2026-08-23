"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/icons/Logo";
import { cn } from "@/lib/utils";
import { useImages } from "@/components/providers/ImageProvider";

type NavSubLink = {
  name: string;
  href: string;
};

type NavLinkItem = {
  name: string;
  href?: string;
  subLinks?: NavSubLink[];
};

const navLinks: NavLinkItem[] = [
  { name: "Home", href: "/" },
  {
    name: "About Us",
    subLinks: [
      { name: "Our Story", href: "/about" },
      { name: "Our Team & Directors", href: "/team" },
    ],
  },
  {
    name: "Programs",
    subLinks: [
      { name: "The Orchestras", href: "/programs/orchestras" },
      { name: "Upbeat!", href: "/programs/upbeat" },
      { name: "Instrumental Lessons", href: "/programs/lessons" },
    ],
  },
  { name: "Calendar", href: "/programs/calendar" },
  {
    name: "Support Us",
    subLinks: [
      { name: "Ways to Give", href: "/support-us/ways-to-give" },
      { name: "Donate", href: "/support-us/donate" },
      { name: "Volunteer", href: "/support-us/volunteer" },
      { name: "Case For Support", href: "/support-us/case-for-support" },
    ],
  },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const { getImage } = useImages();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const desktopNavRef = React.useRef<HTMLElement | null>(null);
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openDropdownMenu = (name: string) => {
    clearCloseTimeout();
    setOpenDropdown(name);
  };

  const scheduleDropdownClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 120);
  };

  const isPathActive = (href?: string) => {
    if (!href) return false;

    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isNavLinkActive = (link: NavLinkItem) => {
    if (link.href) {
      return isPathActive(link.href);
    }

    if (link.subLinks) {
      return link.subLinks.some((subLink) => isPathActive(subLink.href));
    }

    return false;
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    setIsRegisterOpen(false);
  }, [pathname]);

  const orchestrasImage = getImage("page-header-orchestras")?.imageUrl;
  const upbeatImage = getImage("page-header-upbeat")?.imageUrl;

  // Preload registration images so they are ready when the dialog opens
  useEffect(() => {
    if (typeof window !== 'undefined') {
        // Use requestIdleCallback or setTimeout to not block initial page load
        const timer = setTimeout(() => {
            if (orchestrasImage) {
                const img1 = new window.Image();
                img1.src = orchestrasImage;
            }
            if (upbeatImage) {
                const img2 = new window.Image();
                img2.src = upbeatImage;
            }
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [orchestrasImage, upbeatImage]);

  useEffect(() => {
    return () => clearCloseTimeout();
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!desktopNavRef.current) return;

      if (!desktopNavRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const desktopLinkClasses = (active: boolean) =>
    cn(
      "relative inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg px-3 text-[1.15rem] font-medium transition-all xl:h-11 xl:px-4",
      active
        ? "bg-primary/5 font-bold text-primary"
        : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
    );

  const closeMobileAndOpenRegister = () => {
    setIsMobileMenuOpen(false);
    window.setTimeout(() => {
      setIsRegisterOpen(true);
    }, 150);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/70 shadow-md backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 md:h-20 xl:h-24">
        <Link href="/" className="group flex shrink-0 items-center gap-2 py-2">
          <Logo
            variant="small"
            size={96}
            className="shrink-0 translate-y-1 drop-shadow-md transition-transform duration-300 group-hover:scale-105 md:translate-y-2"
          />
        </Link>

        {/* Desktop navigation */}
        <nav
          ref={desktopNavRef}
          className="hidden items-center gap-0.5 xl:flex 2xl:gap-1"
          onBlurCapture={(event) => {
            if (
              !event.currentTarget.contains(
                event.relatedTarget as Node | null
              )
            ) {
              setOpenDropdown(null);
            }
          }}
        >
          {navLinks.map((link) => {
            const active = isNavLinkActive(link);

            if (link.subLinks?.length) {
              const isOpen = openDropdown === link.name;

              return (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => openDropdownMenu(link.name)}
                  onMouseLeave={scheduleDropdownClose}
                >
                  <button
                    type="button"
                    className={desktopLinkClasses(active)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() =>
                      setOpenDropdown(isOpen ? null : link.name)
                    }
                  >
                    {link.name}
                    {active && (
                      <motion.div
                        layoutId="header-nav-active"
                        className="absolute -bottom-1 left-3 right-3 h-0.5 rounded-full bg-primary"
                      />
                    )}
                  </button>

                  {isOpen && (
                    <div className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-2">
                      <div className="rounded-xl border border-primary/10 bg-popover p-2 shadow-2xl">
                        {link.subLinks.map((subLink) => {
                          const subActive = isPathActive(subLink.href);

                          return (
                            <Link
                              key={subLink.name}
                              href={subLink.href}
                              className={cn(
                                "block rounded-lg px-4 py-2.5 text-center text-[1.15rem] font-medium transition-colors hover:bg-primary/5 hover:text-primary",
                                subActive &&
                                  "bg-primary/10 font-bold text-primary"
                              )}
                            >
                              {subLink.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href!}
                className={desktopLinkClasses(active)}
              >
                {link.name}
                {active && (
                  <motion.div
                    layoutId="header-nav-active"
                    className="absolute -bottom-1 left-3 right-3 h-0.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <Button
            size="lg"
            className="h-10 rounded-xl px-5 text-sm font-bold transition-all hover:shadow-lg xl:h-11 xl:px-6 xl:text-[0.95rem]"
            onClick={() => setIsRegisterOpen(true)}
          >
            Register
          </Button>
        </div>

        {/* Mobile navigation */}
        <div className="xl:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11"
                aria-label="Open menu"
              >
                <Menu className="h-7 w-7" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[300px] flex-col p-0 sm:w-[380px]"
            >
              <SheetHeader className="border-b border-primary/5 px-6 pb-3 pt-8">
                <SheetTitle className="text-left font-headline text-lg uppercase tracking-widest text-primary/60">
                  Menu
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => {
                    const active = isNavLinkActive(link);

                    if (link.subLinks?.length) {
                      return (
                        <div
                          key={link.name}
                          className="border-b border-primary/5 py-2 last:border-0"
                        >
                          <h3
                            className={cn(
                              "mb-1 px-2 py-1 text-xs font-bold uppercase tracking-widest",
                              active
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          >
                            {link.name}
                          </h3>
                          <div className="flex flex-col gap-0.5">
                            {link.subLinks.map((subLink) => {
                              const subActive = isPathActive(subLink.href);

                              return (
                                <Link
                                  key={subLink.name}
                                  href={subLink.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className={cn(
                                    "block rounded-lg px-4 py-2 text-base font-medium transition-colors hover:bg-primary/5 hover:text-primary",
                                    subActive &&
                                      "bg-primary/10 font-bold text-primary"
                                  )}
                                >
                                  {subLink.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={link.name}
                        href={link.href!}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "rounded-lg border-b border-primary/5 px-2 py-3 text-lg font-bold transition-colors last:border-0 hover:bg-primary/5 hover:text-primary",
                          active && "text-primary"
                        )}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-primary/5 bg-muted/5 p-6">
                <Button
                  className="h-14 w-full rounded-2xl text-lg font-bold"
                  onClick={closeMobileAndOpenRegister}
                >
                  Register
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 origin-left bg-primary"
        style={{ scaleX }}
      />

      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent hideCloseButton={true} className="overflow-hidden border-none bg-transparent p-0 sm:max-w-[1000px]">
          <DialogHeader className="sr-only">
            <DialogTitle>Select Registration Program</DialogTitle>
            <DialogDescription>
              Choose between the Orchestras or Upbeat! program registration
              forms.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            <Link
              href="/programs/registration/orchestras"
              onClick={() => setIsRegisterOpen(false)}
              className="group"
            >
              <Card className="relative h-[400px] overflow-hidden border-none transition-all duration-300 group-hover:ring-2 group-hover:ring-primary">
                {orchestrasImage ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${orchestrasImage})`,
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="mb-2 font-headline text-4xl font-bold">
                    Orchestras & Lessons
                  </h3>
                  <p className="mb-4 text-sm text-white/80">
                    Junior, Intermediate, and Senior programs.
                  </p>
                  <div className="flex items-center text-sm font-bold transition-transform group-hover:translate-x-2">
                    Register Now <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link
              href="/programs/registration/upbeat"
              onClick={() => setIsRegisterOpen(false)}
              className="group"
            >
              <Card className="relative h-[400px] overflow-hidden border-none transition-all duration-300 group-hover:ring-2 group-hover:ring-primary">
                {upbeatImage ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${upbeatImage})`,
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="mb-2 font-headline text-4xl font-bold">
                    Upbeat!
                  </h3>
                  <p className="mb-4 text-sm text-white/80">
                    Specialized program for younger musicians.
                  </p>
                  <div className="flex items-center text-sm font-bold transition-transform group-hover:translate-x-2">
                    Register Now <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}