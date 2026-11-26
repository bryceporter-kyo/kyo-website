"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BarChart3, Download, FileText, ArrowLeft, RefreshCw, Calendar, 
  CheckCircle2, DollarSign, PieChart, TrendingUp, Filter 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchAllGrants } from "@/lib/grants/grants-service";
import { Grant } from "@/lib/grants/types";

export default function GrantsReportsPage() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [yearType, setYearType] = useState<"fiscal" | "calendar">("fiscal");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  useEffect(() => {
    fetchAllGrants().then(setGrants).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const filteredGrants = grants.filter(g => {
    if (selectedYear === "all") return true;
    const dateStr = g.grantCycleYear || g.dateAwarded || g.startedAt || g.createdAt;
    if (!dateStr) return false;
    if (g.grantCycleYear) return g.grantCycleYear === selectedYear;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const yr = yearType === "fiscal" && d.getMonth() >= 6 ? d.getFullYear() + 1 : d.getFullYear();
    return yr.toString() === selectedYear;
  });

  // Performance calculations
  const totalApplied = filteredGrants.length;
  const wonGrants = filteredGrants.filter(g => g.stage.includes("Won"));
  const lostGrants = filteredGrants.filter(g => g.stage.includes("Lost"));
  const pendingGrants = filteredGrants.filter(g => !g.stage.includes("Won") && !g.stage.includes("Lost") && !g.stage.includes("Cancelled") && g.stage !== "Archived");

  const totalRequested = filteredGrants.reduce((sum, g) => sum + (g.amountRequested || 0), 0);
  const totalAwarded = wonGrants.reduce((sum, g) => sum + (g.amountAwarded || 0), 0);
  const winRate = totalApplied > 0 ? Math.round((wonGrants.length / totalApplied) * 100) : 0;

  // Program breakdowns
  const programTotals: Record<string, number> = {};
  wonGrants.forEach(g => {
    const progs = g.kyoPrograms && g.kyoPrograms.length > 0 ? g.kyoPrograms : ["General"];
    const perProg = (g.amountAwarded || 0) / progs.length;
    progs.forEach(p => {
      programTotals[p] = (programTotals[p] || 0) + perProg;
    });
  });

  // Dynamic program allocation narrative based on actual data
  const programRankings = Object.entries(programTotals)
    .filter(([_, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);

  const programAllocationSummary = (() => {
    if (totalAwarded === 0 || programRankings.length === 0) {
      if (totalApplied === 0) {
        return "No grant applications or awards have been recorded for this period yet.";
      }
      return `${pendingGrants.length} application(s) currently pending review across designated KYO programs.`;
    }

    const topProgram = programRankings[0];
    const topPercent = Math.round((topProgram[1] / totalAwarded) * 100);

    if (programRankings.length === 1) {
      return `All awarded funding ($${Math.round(topProgram[1]).toLocaleString()}) is currently allocated to ${topProgram[0]}.`;
    }

    const secondaryPrograms = programRankings
      .slice(1)
      .map(([name, amt]) => `${name} ($${Math.round(amt).toLocaleString()})`)
      .join(", ");

    return `${topProgram[0]} accounts for the largest share of secured funding ($${Math.round(topProgram[1]).toLocaleString()}, ${topPercent}%), followed by ${secondaryPrograms}.`;
  })();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold font-headline text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>Reports &amp; Analytics (Spec §11)</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Grants Performance Report and AGM High-Level Summary exportable to Google Doc, Markdown, and PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Year Filter */}
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px] text-xs h-9 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>

          {/* Calendar vs Fiscal Toggle */}
          <Select value={yearType} onValueChange={(val: any) => setYearType(val)}>
            <SelectTrigger className="w-[150px] text-xs h-9 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fiscal">Fiscal Year</SelectItem>
              <SelectItem value="calendar">Calendar Year</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs gap-1.5 h-9"
            onClick={() => {
              window.print();
            }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Total Applications</span>
            <div className="text-2xl font-bold font-headline text-foreground">{totalApplied}</div>
            <span className="text-[11px] text-muted-foreground">{wonGrants.length} Won • {lostGrants.length} Lost</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Win Rate (Success %)</span>
            <div className="text-2xl font-bold font-headline text-emerald-600">{winRate}%</div>
            <span className="text-[11px] text-muted-foreground">{pendingGrants.length} Decisions Pending</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Total Funds Awarded</span>
            <div className="text-2xl font-bold font-headline text-foreground">${totalAwarded.toLocaleString()}</div>
            <span className="text-[11px] text-muted-foreground">From ${totalRequested.toLocaleString()} requested</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Active Pending Pipeline</span>
            <div className="text-2xl font-bold font-headline text-primary">{pendingGrants.length}</div>
            <span className="text-[11px] text-muted-foreground">Applications underway</span>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown by KYO Program */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" />
            <span>Funding Won by KYO Program</span>
          </CardTitle>
          <CardDescription>
            Calculated across awarded grants using equal or custom program allocations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {["The Orchestras", "Upbeat!", "Chamber Music", "Lessons"].map(prog => (
              <div key={prog} className="p-3.5 bg-muted/30 border rounded-xl space-y-1">
                <span className="text-xs font-bold text-foreground block">{prog}</span>
                <span className="text-lg font-bold text-primary block">
                  ${Math.round(programTotals[prog] || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AGM Summary Snapshot (Spec §11) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span>AGM High-Level Summary ({yearType === "fiscal" ? "FY 2026-27" : "CY 2026"})</span>
          </CardTitle>
          <CardDescription>
            High-level executive overview designed for board meetings and the annual general report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/40 border rounded-xl text-xs space-y-2 leading-relaxed text-foreground">
            <p>
              In the current {yearType} period, Kawartha Youth Orchestra submitted <strong>{totalApplied} grant application{totalApplied === 1 ? "" : "s"}</strong>, successfully securing <strong>${totalAwarded.toLocaleString()}</strong> in funding across local, provincial, and national partners.
            </p>
            <p>
              {programAllocationSummary}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
