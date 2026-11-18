"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  FolderKanban, 
  Settings as SettingsIcon, 
  Calendar, 
  Sparkles, 
  Layers,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function GrantsNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/grants", label: "Grants Pipeline", icon: FolderKanban, exact: true },
    { href: "/admin/grants/funders", label: "Funders & Programs", icon: Building2 },
    { href: "/admin/grants/triage", label: "Triage Queue", icon: Sparkles },
    { href: "/admin/grants/reports", label: "Reports & AGM", icon: Layers },
    { href: "/admin/grants/settings", label: "Settings & Google Setup", icon: SettingsIcon },
  ];

  return (
    <div className="border-b bg-card/60 backdrop-blur-sm sticky top-0 z-30 mb-8">
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-1" /> Admin
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold font-headline text-foreground leading-none">Grants Management</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">KYO &amp; KCMC Funding Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {links.map((link) => {
            const isActive = link.exact 
              ? pathname === link.href 
              : pathname.startsWith(link.href);
            return (
              <Button
                key={link.href}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={`text-xs h-8 gap-1.5 font-medium shrink-0 ${
                  isActive ? "bg-primary/10 text-primary hover:bg-primary/15 font-bold" : "text-muted-foreground"
                }`}
              >
                <Link href={link.href}>
                  <link.icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
