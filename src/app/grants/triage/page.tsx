"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  Sparkles, CheckCircle2, XCircle, Building2, AlertCircle, RefreshCw, 
  HelpCircle, ExternalLink, Upload, FileSpreadsheet, Download, Filter, 
  Search, Check, Trash2, ArrowRight
} from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchAllFunders, saveFunder, saveGrant, getGrantsSettings, logGrantAudit, checkFunderDuplicate 
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

  // CSV Import State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [importedRowsCount, setImportedRowsCount] = useState<number | null>(null);
  const [importSummary, setImportSummary] = useState<{ added: number; skipped: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const createdGrant = await saveGrant(
        {
          funderId: funder.id,
          funderName: funder.name,
          programId: funder.programs?.[0]?.id || "prog_default",
          programName: funder.programs?.[0]?.name && funder.programs[0].name !== "General Fund" ? funder.programs[0].name : "",
          stage: "Prospect",
          assignedOwnerEmail: user?.email || "",
          assignedOwnerName: user?.displayName || "",
          kyoPrograms: ["Upbeat!"],
        },
        user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
      );

      if (user) {
        await logGrantAudit({
          userId: user.uid,
          userEmail: user.email || "",
          userName: user.displayName || "",
          action: "TRIAGE_PROSPECT",
          funderId: funder.id,
          grantId: createdGrant.id,
          summary: `Promoted lead "${funder.name}" to Prospect from Triage Queue. Initial grant created.`,
        });
      }

      toast({
        title: "Promoted to Prospect!",
        description: `Created initial Prospect grant for ${funder.name}. Open it from the Pipeline or configure programs in Funders & Programs.`,
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

      if (user) {
        await logGrantAudit({
          userId: user.uid,
          userEmail: user.email || "",
          userName: user.displayName || "",
          action: "TRIAGE_REJECT",
          funderId: funderToReject.id,
          summary: `Rejected lead "${funderToReject.name}" in Triage Queue. Reason: "${rejectionReason}".`,
        });
      }

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          toast({
            title: "Empty CSV",
            description: "No data rows were found in the uploaded file.",
            variant: "destructive",
          });
          return;
        }
        setCsvPreview(results.data);
        setImportSummary(null);
      },
      error: (err) => {
        toast({
          title: "CSV Parse Error",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        "Funder Name": "Example Arts Foundation",
        "Website": "https://examplefoundation.org",
        "Type": "Private foundation",
        "Geographic Scope": "Provincial",
        "Focus Areas": "Youth, Music, Arts education",
        "City": "Peterborough",
        "Province": "Ontario",
        "Eligibility Notes": "Annual grants for youth orchestra programs.",
        "Program Name": "Community Youth Music Fund",
      },
      {
        "Funder Name": "Kawartha Community Trust",
        "Website": "https://kawarthatrust.ca",
        "Type": "Community foundation",
        "Geographic Scope": "Local",
        "Focus Areas": "Music, Community",
        "City": "Peterborough",
        "Province": "Ontario",
        "Eligibility Notes": "Accepts applications twice annually.",
        "Program Name": "General Arts Program",
      }
    ];

    const csvContent = Papa.unparse(templateRows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `KYO_Grants_Triage_Import_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleProcessImport = async () => {
    if (csvPreview.length === 0) return;
    setIsImporting(true);

    let addedCount = 0;
    let skippedCount = 0;

    try {
      const existingFunders = await fetchAllFunders();
      const seenNames = new Set(existingFunders.map(f => f.name.trim().toLowerCase()));

      for (const row of csvPreview) {
        // Find matching name column
        const rawName = row["Funder Name"] || row["Funder"] || row["Name"] || row["Organization"] || row["Foundation"] || "";
        const name = String(rawName).trim();
        if (!name) {
          skippedCount++;
          continue;
        }

        const rawWebsite = row["Website"] || row["URL"] || row["Link"] || row["Web"] || "";
        const website = String(rawWebsite).trim();

        // Check for duplicate funder locally (avoids N full-collection reads)
        if (seenNames.has(name.toLowerCase())) {
          skippedCount++;
          continue;
        }
        seenNames.add(name.toLowerCase());

        const type = (row["Type"] || row["Classification"] || "Private foundation").trim();
        const geoScope = (row["Geographic Scope"] || row["Scope"] || "Local").trim();
        const rawFocus = row["Focus Areas"] || row["Focus"] || "Youth, Music";
        const focusAreas = String(rawFocus).split(",").map(s => s.trim()).filter(Boolean);
        const city = (row["City"] || "Peterborough").trim();
        const province = (row["Province"] || "Ontario").trim();
        const eligibilityNotes = (row["Eligibility Notes"] || row["Notes"] || row["Description"] || "").trim();
        const programName = (row["Program Name"] || row["Program"] || "General Fund").trim();

        await saveFunder(
          {
            name,
            website,
            type,
            geoScope,
            focusAreas,
            city,
            province,
            country: "Canada",
            eligibilityNotes,
            triageStatus: "unreviewed",
            programs: [
              {
                id: "prog_" + Math.random().toString(36).substring(2, 9),
                name: programName,
                eligibilityNotes,
              }
            ],
          },
          user ? { id: user.uid, email: user.email || "", name: user.displayName || "" } : undefined
        );

        addedCount++;
      }

      // Log to Grant Audit Log
      if (user) {
        await logGrantAudit({
          userId: user.uid,
          userEmail: user.email || "",
          userName: user.displayName || "",
          action: "IMPORT_FUNDERS_CSV",
          summary: `CSV import completed: ${addedCount} unreviewed leads added to triage, ${skippedCount} duplicates/invalid skipped.`,
          metadata: {
            totalRows: csvPreview.length,
            addedCount,
            skippedCount,
          },
        });
      }

      setImportSummary({ added: addedCount, skipped: skippedCount });
      toast({
        title: "Import Complete!",
        description: `Imported ${addedCount} unreviewed funders into the triage queue (${skippedCount} duplicates/empty skipped).`,
      });

      // Clear input and reload triage
      setCsvPreview([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadTriageQueue();
    } catch (err: any) {
      toast({
        title: "Import Error",
        description: err.message || "An error occurred during CSV processing.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
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

        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => setIsImportOpen(true)} 
            className="gap-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Leads CSV</span>
          </Button>
          <Button variant="outline" size="sm" onClick={loadTriageQueue} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
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

      {/* CSV Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <span>Import Grant Leads from CSV</span>
            </DialogTitle>
            <DialogDescription>
              Upload any spreadsheet containing potential funders, foundations, and grant leads. Imported entries will populate this Triage Queue so your team can evaluate, promote to prospects, or reject them.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Step 1: Upload / Instructions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-muted/40 rounded-xl border text-xs">
              <div className="space-y-1">
                <span className="font-bold text-foreground">Need a sample template?</span>
                <p className="text-muted-foreground">
                  Download a pre-formatted CSV template with standard column headers.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadTemplate} 
                className="gap-1.5 shrink-0 h-8 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample CSV</span>
              </Button>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed rounded-xl p-6 text-center space-y-3 bg-muted/20 hover:bg-muted/30 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
                id="triage-csv-input"
              />
              <label 
                htmlFor="triage-csv-input" 
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-sm text-foreground">Click to select CSV file</span>
                  <p className="text-xs text-muted-foreground">Supports .csv exports from Excel, Google Sheets, or Foundation directories</p>
                </div>
              </label>
            </div>

            {/* Preview Section */}
            {csvPreview.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span>Detected Rows ({csvPreview.length} leads found)</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs text-muted-foreground"
                    onClick={() => {
                      setCsvPreview([]);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Clear File
                  </Button>
                </div>

                <div className="border rounded-xl max-h-48 overflow-y-auto bg-card text-xs">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Funder Name</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Focus Areas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvPreview.slice(0, 10).map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-semibold text-foreground">
                            {row["Funder Name"] || row["Funder"] || row["Name"] || row["Organization"] || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-[11px]">
                            {row["Website"] || row["URL"] || row["Link"] || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {row["Type"] || row["Classification"] || "Private foundation"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {row["Focus Areas"] || row["Focus"] || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {csvPreview.length > 10 && (
                  <p className="text-[11px] text-muted-foreground text-center">
                    Showing first 10 rows of {csvPreview.length} total entries.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-3">
            <Button variant="ghost" onClick={() => setIsImportOpen(false)}>Cancel</Button>
            <Button
              variant="default"
              onClick={handleProcessImport}
              disabled={isImporting || csvPreview.length === 0}
              className="gap-2"
            >
              {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{isImporting ? "Importing Leads..." : `Import ${csvPreview.length || 0} Leads`}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
