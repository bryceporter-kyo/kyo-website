"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Building2, Plus, Search, Filter, ExternalLink, Mail, Phone, 
  MapPin, AlertCircle, CheckCircle2, XCircle, ArrowUpDown, RefreshCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchAllFunders, saveFunder, checkFunderDuplicate 
} from "@/lib/grants/grants-service";
import { Funder } from "@/lib/grants/types";
import { useAuthContext } from "@/components/providers/AuthProvider";

export default function FundersPage() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [funders, setFunders] = useState<Funder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Quick Add State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickWebsite, setQuickWebsite] = useState("");
  const [isSavingQuick, setIsSavingQuick] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{ isDuplicate: boolean; matchType?: string; matchedFunder?: Funder } | null>(null);

  useEffect(() => {
    loadFunders();
  }, []);

  const loadFunders = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllFunders();
      // Sort alphabetically by sortName
      data.sort((a, b) => (a.sortName || a.name).localeCompare(b.sortName || b.name));
      setFunders(data);
    } catch (e) {
      console.error(e);
      toast({
        title: "Error loading funders",
        description: "Failed to load funders from database.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameBlur = async () => {
    if (!quickName.trim()) {
      setDuplicateWarning(null);
      return;
    }
    const check = await checkFunderDuplicate(quickName, quickWebsite);
    if (check.isDuplicate) {
      setDuplicateWarning(check);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleQuickAddSubmit = async (e: React.FormEvent, force = false) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    if (!force && !duplicateWarning) {
      const check = await checkFunderDuplicate(quickName, quickWebsite);
      if (check.isDuplicate) {
        setDuplicateWarning(check);
        return;
      }
    }

    setIsSavingQuick(true);
    try {
      const newFunder = await saveFunder(
        {
          name: quickName.trim(),
          website: quickWebsite.trim() || undefined,
          triageStatus: "unreviewed", // Quick add lands in triage queue
          type: "Private foundation",
          geoScope: "Local",
          focusAreas: ["Youth", "Music"],
        },
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );

      toast({
        title: "Funder Added to Triage Queue",
        description: `"${newFunder.sortName}" is ready in the Triage Queue for sorting.`,
      });

      setQuickName("");
      setQuickWebsite("");
      setDuplicateWarning(null);
      setIsQuickAddOpen(false);
      loadFunders();
    } catch (err: any) {
      toast({
        title: "Failed to add funder",
        description: err.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSavingQuick(false);
    }
  };

  const filteredFunders = funders.filter((f) => {
    // Hide rejected from main list unless explicitly searched
    if (f.triageStatus === "rejected" && !searchQuery) return false;

    const matchesQuery = !searchQuery || 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.sortName && f.sortName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.city && f.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === "all" || f.type === typeFilter;

    return matchesQuery && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold font-headline text-foreground">Funders &amp; Programs</h2>
          <p className="text-sm text-muted-foreground">
            Complete directory of grantmakers, foundations, and institutional partners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Add Dialog */}
          <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                <span>Quick Add Funder</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quick Add Funder</DialogTitle>
                <DialogDescription>
                  Enter a funder name. It will be checked for duplicates and added to the Triage Queue.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={(e) => handleQuickAddSubmit(e, false)} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="quick-name" className="text-xs font-bold">Funder Name *</Label>
                  <Input
                    id="quick-name"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    onBlur={handleNameBlur}
                    placeholder="e.g. The Jackman Foundation"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="quick-web" className="text-xs font-bold">Website URL (Optional)</Label>
                  <Input
                    id="quick-web"
                    value={quickWebsite}
                    onChange={(e) => setQuickWebsite(e.target.value)}
                    onBlur={handleNameBlur}
                    placeholder="https://example.org"
                  />
                </div>

                {duplicateWarning && duplicateWarning.isDuplicate && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs text-amber-900">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Potential Duplicate Found!</span>
                    </div>
                    <p>
                      Matches existing funder: <strong>{duplicateWarning.matchedFunder?.name}</strong>
                      {duplicateWarning.matchedFunder?.triageStatus === "rejected" && (
                        <span className="text-red-700 font-semibold block mt-0.5">
                          ⚠️ This funder was previously REJECTED (Reason: {duplicateWarning.matchedFunder.rejectionReason || "None"}).
                        </span>
                      )}
                    </p>
                    <div className="pt-1 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs border-amber-400 bg-white"
                        onClick={(e) => handleQuickAddSubmit(e, true)}
                      >
                        Continue Adding Anyway
                      </Button>
                    </div>
                  </div>
                )}

                <DialogFooter className="pt-2">
                  <Button type="button" variant="ghost" onClick={() => setIsQuickAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSavingQuick}>
                    {isSavingQuick ? "Saving..." : "Add to Triage Queue"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={loadFunders} className="gap-1.5">
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
            placeholder="Search funders by name, city, or sort-name..."
            className="pl-9 bg-card"
          />
        </div>
      </div>

      {/* Funders Directory Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Loading funders...</div>
          ) : filteredFunders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground space-y-2">
              <Building2 className="w-8 h-8 mx-auto opacity-30" />
              <p>No funders match your criteria.</p>
              <Button size="sm" variant="outline" onClick={() => setIsQuickAddOpen(true)}>
                Add your first funder
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funder Name (Sort-Name)</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Programs</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFunders.map((funder) => {
                    const programsCount = funder.programs?.length || 1;
                    return (
                      <TableRow key={funder.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-bold text-foreground hover:text-primary transition-colors">
                              {funder.sortName || funder.name}
                            </div>
                            {funder.name !== funder.sortName && (
                              <div className="text-xs text-muted-foreground">{funder.name}</div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {funder.type}
                          </Badge>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{funder.geoScope}</div>
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {funder.city ? `${funder.city}, ${funder.province || "ON"}` : "Canada"}
                        </TableCell>

                        <TableCell>
                          {funder.triageStatus === "prospect" ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Prospect</Badge>
                          ) : funder.triageStatus === "rejected" ? (
                            <Badge variant="destructive">Rejected</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-900 border-amber-200">Unreviewed</Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {programsCount} {programsCount === 1 ? "Program" : "Programs"}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {funder.website && (
                              <a href={funder.website} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
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
