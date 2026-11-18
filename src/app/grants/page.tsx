"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FolderKanban, Plus, Search, Filter, Calendar, DollarSign, 
  Clock, AlertTriangle, CheckCircle2, ChevronRight, RefreshCw, 
  ExternalLink, Layers 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchAllGrants, fetchAllFunders, saveGrant, getGrantsSettings 
} from "@/lib/grants/grants-service";
import { Grant, Funder, GrantsSettings } from "@/lib/grants/types";
import { useAuthContext } from "@/components/providers/AuthProvider";

export default function GrantsPipelinePage() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [funders, setFunders] = useState<Funder[]>([]);
  const [settings, setSettings] = useState<GrantsSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  // New Grant Dialog State
  const [isNewGrantOpen, setIsNewGrantOpen] = useState(false);
  const [selectedFunderId, setSelectedFunderId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [targetStage, setTargetStage] = useState("Prospect");
  const [amountRequested, setAmountRequested] = useState("");
  const [appDeadline, setAppDeadline] = useState("");
  const [isSavingGrant, setIsSavingGrant] = useState(false);

  useEffect(() => {
    loadPipelineData();
  }, []);

  const loadPipelineData = async () => {
    setIsLoading(true);
    try {
      const [grantsData, fundersData, settingsData] = await Promise.all([
        fetchAllGrants(),
        fetchAllFunders(),
        getGrantsSettings(),
      ]);
      setGrants(grantsData);
      setFunders(fundersData);
      setSettings(settingsData);
    } catch (e) {
      console.error(e);
      toast({
        title: "Error loading pipeline",
        description: "Failed to load grants data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFunderId) return;

    const funder = funders.find(f => f.id === selectedFunderId);
    if (!funder) return;

    const program = funder.programs?.find(p => p.id === selectedProgramId) || funder.programs?.[0] || { id: "prog_default", name: "General Fund" };

    setIsSavingGrant(true);
    try {
      await saveGrant(
        {
          funderId: funder.id,
          funderName: funder.name,
          programId: program.id,
          programName: program.name,
          stage: targetStage,
          amountRequested: parseFloat(amountRequested) || 0,
          applicationDeadline: appDeadline || undefined,
          assignedOwnerEmail: user?.email || "",
          assignedOwnerName: user?.displayName || "",
          kyoPrograms: ["Upbeat!"],
        },
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );

      toast({
        title: "Grant Opportunity Created",
        description: `Added "${funder.name} - ${program.name}" to the pipeline.`,
      });

      setIsNewGrantOpen(false);
      setSelectedFunderId("");
      setSelectedProgramId("");
      setAmountRequested("");
      setAppDeadline("");
      loadPipelineData();
    } catch (err: any) {
      toast({
        title: "Failed to create grant",
        description: err.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSavingGrant(false);
    }
  };

  // Urgency indicator calculation per Spec §10
  const getUrgency = (grant: Grant) => {
    const nextDateStr = grant.applicationDeadline || grant.returnToDate || grant.renewalDate;
    if (!nextDateStr) return null;

    const targetDate = new Date(nextDateStr);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `${Math.abs(diffDays)}d Overdue`, variant: "destructive" as const };
    } else if (diffDays <= 7) {
      return { label: `${diffDays}d Left`, variant: "destructive" as const };
    } else if (diffDays <= 30) {
      return { label: `${diffDays}d Left`, variant: "default" as const };
    }
    return { label: `${diffDays}d`, variant: "outline" as const };
  };

  const filteredGrants = grants.filter(g => {
    // Hide archived / cancelled by default unless filter matches
    if (stageFilter === "all" && (g.stage.startsWith("Cancelled") || g.stage === "Archived")) {
      return false;
    }
    const matchesSearch = !searchQuery || 
      g.funderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.programName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = stageFilter === "all" || g.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold font-headline text-foreground flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-primary" />
            <span>Grants Pipeline</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Track opportunities across all stages from prospect through reporting and renewal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* New Grant Opportunity Dialog */}
          <Dialog open={isNewGrantOpen} onOpenChange={setIsNewGrantOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                <span>New Grant Application</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Grant Opportunity</DialogTitle>
                <DialogDescription>
                  Attach an application to a funder and program in the pipeline.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateGrant} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="grant-funder" className="text-xs font-bold">Funder *</Label>
                  <Select value={selectedFunderId} onValueChange={(val) => {
                    setSelectedFunderId(val);
                    const f = funders.find(item => item.id === val);
                    setSelectedProgramId(f?.programs?.[0]?.id || "prog_default");
                  }}>
                    <SelectTrigger id="grant-funder">
                      <SelectValue placeholder="Choose a funder..." />
                    </SelectTrigger>
                    <SelectContent>
                      {funders.filter(f => f.triageStatus !== "rejected").map(f => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.sortName || f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedFunderId && (
                  <div className="space-y-1.5">
                    <Label htmlFor="grant-prog" className="text-xs font-bold">Program</Label>
                    <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                      <SelectTrigger id="grant-prog">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(funders.find(f => f.id === selectedFunderId)?.programs || [{ id: "prog_default", name: "General Fund" }]).map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="grant-stage" className="text-xs font-bold">Starting Stage</Label>
                    <Select value={targetStage} onValueChange={setTargetStage}>
                      <SelectTrigger id="grant-stage">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(settings?.stages || []).map(s => (
                          <SelectItem key={s.id} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="grant-amt" className="text-xs font-bold">Amount Requested ($)</Label>
                    <Input
                      id="grant-amt"
                      type="number"
                      placeholder="e.g. 10000"
                      value={amountRequested}
                      onChange={(e) => setAmountRequested(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="grant-deadline" className="text-xs font-bold">Application Deadline</Label>
                  <Input
                    id="grant-deadline"
                    type="date"
                    value={appDeadline}
                    onChange={(e) => setAppDeadline(e.target.value)}
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="ghost" onClick={() => setIsNewGrantOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSavingGrant || !selectedFunderId}>
                    {isSavingGrant ? "Creating..." : "Add Opportunity"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={loadPipelineData} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search grants by funder or program..."
            className="pl-9 bg-card"
          />
        </div>

        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full sm:w-[220px] bg-card">
            <SelectValue placeholder="Filter by stage..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Active Stages (Standard)</SelectItem>
            {(settings?.stages || []).map(s => (
              <SelectItem key={s.id} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Grants Pipeline Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Loading active pipeline...</div>
          ) : filteredGrants.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground space-y-2">
              <FolderKanban className="w-8 h-8 mx-auto opacity-30" />
              <p>No grants found in this view.</p>
              <Button size="sm" variant="outline" onClick={() => setIsNewGrantOpen(true)}>
                Add your first grant application
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funder &amp; Program</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Next Date &amp; Urgency</TableHead>
                    <TableHead>Requested / Awarded</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead className="text-right">Drive / Portal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrants.map((grant) => {
                    const urgency = getUrgency(grant);
                    return (
                      <TableRow key={grant.id}>
                        <TableCell>
                          <div className="font-bold text-foreground">{grant.funderName}</div>
                          <div className="text-xs text-muted-foreground">{grant.programName}</div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-xs font-semibold bg-muted/30">
                            {grant.stage}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {grant.applicationDeadline ? new Date(grant.applicationDeadline).toLocaleDateString() : "—"}
                            </span>
                            {urgency && (
                              <Badge variant={urgency.variant} className="text-[10px]">
                                {urgency.label}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-xs">
                          <div className="font-semibold text-foreground">
                            ${(grant.amountRequested || 0).toLocaleString()} req
                          </div>
                          {grant.amountAwarded ? (
                            <div className="text-emerald-600 font-bold">
                              ${grant.amountAwarded.toLocaleString()} awarded
                            </div>
                          ) : null}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {grant.assignedOwnerName || grant.assignedOwnerEmail || "Unassigned"}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {grant.driveFolderUrl && (
                              <a href={grant.driveFolderUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Open Drive Folder">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                              </a>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
