"use client";

import React, { useEffect, useState } from "react";
import { 
  Sparkles, CheckCircle2, XCircle, Building2, AlertCircle, RefreshCw, 
  HelpCircle, ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchAllFunders, saveFunder, saveGrant, getGrantsSettings 
} from "@/lib/grants/grants-service";
import { Funder, GrantsSettings } from "@/lib/grants/types";
import { useAuthContext } from "@/components/providers/AuthProvider";

export default function TriagePage() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [unreviewedFunders, setUnreviewedFunders] = useState<Funder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<GrantsSettings | null>(null);

  // Reject Dialog State
  const [funderToReject, setFunderToReject] = useState<Funder | null>(null);
  const [rejectionReason, setRejectionReason] = useState("Not eligible");
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    loadTriageQueue();
    getGrantsSettings().then(setSettings).catch(console.error);
  }, []);

  const loadTriageQueue = async () => {
    setIsLoading(true);
    try {
      const all = await fetchAllFunders();
      const unreviewed = all.filter(f => f.triageStatus === "unreviewed");
      setUnreviewedFunders(unreviewed);
    } catch (e) {
      console.error(e);
      toast({
        title: "Error loading queue",
        description: "Failed to load unreviewed funders.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeProspect = async (funder: Funder) => {
    try {
      // 1. Promote funder to 'prospect'
      await saveFunder(
        { ...funder, triageStatus: "prospect" },
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );

      // 2. Automatically spawn a new Grant in 'Prospect' stage as required by Spec §3 & §4
      await saveGrant(
        {
          funderId: funder.id,
          funderName: funder.name,
          programId: funder.programs?.[0]?.id || "prog_default",
          programName: funder.programs?.[0]?.name || "General Fund",
          stage: "Prospect",
          assignedOwnerEmail: user?.email || "",
          assignedOwnerName: user?.displayName || "",
          kyoPrograms: ["Upbeat!"],
        },
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );

      toast({
        title: "Promoted to Prospect!",
        description: `Created initial Prospect grant record for ${funder.name}.`,
      });

      loadTriageQueue();
    } catch (err: any) {
      toast({
        title: "Error promoting funder",
        description: err.message || "Failed to make prospect.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmReject = async () => {
    if (!funderToReject) return;
    setIsRejecting(true);
    try {
      await saveFunder(
        {
          ...funderToReject,
          triageStatus: "rejected",
          rejectionReason: rejectionReason,
        },
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );

      toast({
        title: "Funder Rejected",
        description: `Archived as rejected (${rejectionReason}). Remains searchable.`,
      });

      setFunderToReject(null);
      loadTriageQueue();
    } catch (err: any) {
      toast({
        title: "Error rejecting funder",
        description: err.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold font-headline text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Triage Queue</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Sort arriving leads into viable Prospects or structured Rejections.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadTriageQueue} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Loading triage queue...</div>
          ) : unreviewedFunders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-80" />
              <h3 className="text-base font-bold text-foreground">Triage Queue is Clear!</h3>
              <p className="text-xs max-w-sm mx-auto">
                All newly added funders have been categorized into Prospects or Rejections.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funder Name</TableHead>
                  <TableHead>Added Date</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unreviewedFunders.map((funder) => (
                  <TableRow key={funder.id}>
                    <TableCell className="font-bold text-foreground">
                      {funder.name}
                      {funder.sortName && funder.sortName !== funder.name && (
                        <span className="block text-xs font-normal text-muted-foreground">
                          {funder.sortName}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {funder.createdAt ? new Date(funder.createdAt).toLocaleDateString() : "Recent"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {funder.website ? (
                        <a href={funder.website} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1 hover:underline">
                          <span>{funder.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs h-8"
                          onClick={() => handleMakeProspect(funder)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Make Prospect</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5 text-xs h-8"
                          onClick={() => setFunderToReject(funder)}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog with Mandatory Reason per Spec §3 */}
      <Dialog open={!!funderToReject} onOpenChange={(open) => !open && setFunderToReject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Funder</DialogTitle>
            <DialogDescription>
              A mandatory rejection reason is required to maintain structured funder history and duplicate intelligence.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
              <span className="font-bold text-foreground">Target Funder:</span>
              <p className="text-muted-foreground">{funderToReject?.name}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rej-reason" className="text-xs font-bold">Rejection Reason *</Label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger id="rej-reason">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(settings?.rejectionReasons || ["Not eligible", "Wrong focus", "Too small", "Other"]).map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => setFunderToReject(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmReject} 
              disabled={isRejecting}
            >
              {isRejecting ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
