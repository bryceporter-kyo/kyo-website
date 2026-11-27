"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  FolderKanban, 
  Settings as SettingsIcon, 
  Sparkles, 
  Layers,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { callGrantsAppsScript } from "@/lib/grants/grant-actions";
import { EXPECTED_APPS_SCRIPT_VERSION } from "@/lib/grants/grantsAppsScriptTemplate";

export function GrantsNav() {
  const pathname = usePathname();
  const [scriptStatus, setScriptStatus] = useState<"unknown" | "ok" | "outdated" | "error">("unknown");
  const [scriptVersion, setScriptVersion] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    callGrantsAppsScript("ping", {})
      .then((res) => {
        if (!mounted) return;
        if (!res?.success) {
          setScriptStatus("error");
          return;
        }
        const remoteVersion = res.version ? String(res.version) : "1.0.0";
        setScriptVersion(remoteVersion);
        setScriptStatus(remoteVersion === EXPECTED_APPS_SCRIPT_VERSION ? "ok" : "outdated");
      })
      .catch(() => {
        if (mounted) setScriptStatus("error");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const links = [
    { href: "/grants", label: "Grants Pipeline", icon: FolderKanban, exact: true },
    { href: "/grants/funders", label: "Funders & Programs", icon: Building2 },
    { href: "/grants/triage", label: "Triage Queue", icon: Sparkles },
    { href: "/grants/reports", label: "Reports & AGM", icon: Layers },
    { href: "/grants/training", label: "Training Guide", icon: BookOpen },
    { href: "/grants/admin", label: "Grants Admin & Setup", icon: SettingsIcon },
  ];

  const isActiveLink = (linkHref: string, exact?: boolean) => {
    if (exact) {
      return pathname === "/grants" || pathname === "/grants/";
    }
    return pathname === linkHref || pathname.startsWith(linkHref + "/");
  };

  return (
    <div className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-30 mb-8 shadow-xs">
      <div className="container mx-auto px-4 pt-3 pb-2 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold font-headline text-foreground leading-none">Grants Management</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-[11px] text-muted-foreground">KYO Funding Portal</p>
                <span className="text-[11px] text-muted-foreground">•</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      scriptStatus === "ok"
                        ? "bg-emerald-500"
                        : scriptStatus === "outdated"
                        ? "bg-amber-500"
                        : scriptStatus === "error"
                        ? "bg-destructive"
                        : "bg-muted-foreground/50 animate-pulse"
                    }`}
                  />
                  <span
                    className={
                      scriptStatus === "error"
                        ? "text-destructive"
                        : scriptStatus === "outdated"
                        ? "text-amber-600"
                        : "text-muted-foreground"
                    }
                  >
                    {scriptStatus === "ok"
                      ? `Apps Script v${EXPECTED_APPS_SCRIPT_VERSION} connected`
                      : scriptStatus === "outdated"
                      ? `Apps Script outdated (v${scriptVersion} vs v${EXPECTED_APPS_SCRIPT_VERSION})`
                      : scriptStatus === "error"
                      ? "Apps Script disconnected"
                      : "Checking connection..."}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground">
              <Link href="/internal">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>KYO Internal</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1.5 font-medium"
            >
              <Link href="/">
                <span>To KYO Website</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-1 pt-1 border-t border-border/50">
          {links.map((link) => {
            const isActive = isActiveLink(link.href, link.exact);
            return (
              <Button
                key={link.href}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={`text-xs h-8 gap-1.5 font-medium ${
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
      {(scriptStatus === "error" || scriptStatus === "outdated") && (
        <div
          className={
            scriptStatus === "outdated"
              ? "bg-amber-500/10 border-t border-amber-500/20 px-4 py-2"
              : "bg-destructive/10 border-t border-destructive/20 px-4 py-2"
          }
        >
          <div
            className={`container mx-auto flex items-center justify-between gap-2 text-xs ${
              scriptStatus === "outdated" ? "text-amber-700" : "text-destructive"
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>
                {scriptStatus === "outdated"
                  ? `Apps Script is outdated (running v${scriptVersion}, expected v${EXPECTED_APPS_SCRIPT_VERSION}) — re-copy and deploy from Admin settings.`
                  : "Apps Script connection lost — check Admin settings."}
              </span>
            </div>
            <Link href="/grants/admin" className="underline font-semibold hover:opacity-80 shrink-0">
              Open Admin Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
