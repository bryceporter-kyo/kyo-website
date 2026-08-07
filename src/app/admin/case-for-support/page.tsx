"use client";

import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  Loader2,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { CsvManagerDialog } from '@/components/shared/CsvManagerDialog';
import { 
  GrantCase, 
  fetchAllGrants, 
  addGrant, 
  deleteGrant,
  getGrantUrlPath,
  grantSchema
} from '@/lib/case-for-support';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';

export default function AdminCaseForSupportPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  const [grants, setGrants] = useState<GrantCase[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAllGrants();
    setGrants(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteGrant(id);
      toast({ title: "Grant deleted successfully!" });
      loadData();
    } catch (err: any) {
      toast({
        title: "Error deleting grant",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handleCsvUpload = async (parsedData: any[], mode: 'append' | 'overwrite') => {
    let successCount = 0;
    let failCount = 0;

    for (const row of parsedData) {
      try {
        const cleanKey = (k: string) => k.toLowerCase().replace(/[\s_]+/g, '');
        const findVal = (rowObj: any, matchStr: string) => {
          const key = Object.keys(rowObj).find(k => cleanKey(k) === cleanKey(matchStr));
          return key ? rowObj[key] : undefined;
        };

        const primaryProgram = (findVal(row, 'primaryProgram') || findVal(row, 'primary') || findVal(row, 'programOfSupport') || 'Orchestras') as any;
        const submissionDate = findVal(row, 'submissionDate') || findVal(row, 'date') || new Date().toISOString().split('T')[0];

        const fundingTypeRaw = findVal(row, 'fundingType') || findVal(row, 'type');
        let fundingType = null;
        if (fundingTypeRaw) {
          const lower = String(fundingTypeRaw).toLowerCase().trim();
          if (lower.includes('multi')) fundingType = 'multi-year';
          else if (lower.includes('match')) fundingType = 'matching';
          else fundingType = 'one-time';
        }

        const numberOfYears = findVal(row, 'numberOfYears') || findVal(row, 'years');

        const parsedRow = {
          organizationName: findVal(row, 'organizationName') || findVal(row, 'organization') || 'Kawartha Youth Orchestra',
          programOfSupport: primaryProgram,
          funderName: findVal(row, 'funderName') || findVal(row, 'funder') || '',
          grantName: findVal(row, 'grantName') || findVal(row, 'grant') || '',
          amountRequested: Number(findVal(row, 'amountRequested') || findVal(row, 'amount') || 0),
          primaryProgram: primaryProgram,
          grantCycleYear: String(findVal(row, 'grantCycleYear') || findVal(row, 'year') || submissionDate.split('-')[0]),
          submissionDate: submissionDate,
          fundingType,
          numberOfYears: numberOfYears ? Number(numberOfYears) : null,
          valuesAlignment: findVal(row, 'valuesAlignment') || findVal(row, 'values') || null,
          reportingPlan: findVal(row, 'reportingPlan') || findVal(row, 'reporting') || null,
          recognitionPlan: findVal(row, 'recognitionPlan') || findVal(row, 'recognition') || null,
          signerName: findVal(row, 'signerName') || null,
          signerTitle: findVal(row, 'signerTitle') || null,
          contactName: findVal(row, 'contactName') || null,
          contactEmail: findVal(row, 'contactEmail') || null,
          headerImageUrl: findVal(row, 'headerImageUrl') || findVal(row, 'header') || null,
        };

        const validated = grantSchema.parse(parsedRow);
        await addGrant(validated);
        successCount++;
      } catch (err) {
        console.error('Failed to parse CSV row:', row, err);
        failCount++;
      }
    }

    toast({
      title: "CSV Import Completed",
      description: `Imported ${successCount} grants successfully. Failed ${failCount} rows.`,
      variant: failCount > 0 ? "default" : "default"
    });

    loadData();
  };

  const downloadMasterTemplate = () => {
    const wb = XLSX.utils.book_new();

    // 1. Core Profile
    const coreHeaders = [
      'Funder Name', 'Grant Name', 'Amount Requested', 'Primary Program', 'Submission Date',
      'Funding Type', 'Number of Years',
      'Values Alignment', 'Reporting Plan', 'Recognition Plan',
      'Signer Name', 'Signer Title', 'Contact Name', 'Contact Email', 'Header Image URL'
    ];
    const coreSample = [
      'Ontario Arts Council', 'Community Orchestras Grant', '15000', 'Orchestras', '2026-08-01',
      'multi-year', '3',
      'We believe in community...', 'We will send a report...', 'Logo on website...',
      'Jane Doe', 'Executive Director', 'John Smith', 'john@thekyo.org', 'https://example.com/image.jpg'
    ];
    const wsCore = XLSX.utils.aoa_to_sheet([coreHeaders, coreSample]);
    XLSX.utils.book_append_sheet(wb, wsCore, 'Core Profile');

    // 2. Budget
    const budgetHeaders = ['Item', 'Amount', 'Category', 'Subcategory'];
    const budgetSample = ['Sheet Music', '500', 'Artistic', 'Repertoire'];
    const wsBudget = XLSX.utils.aoa_to_sheet([budgetHeaders, budgetSample]);
    XLSX.utils.book_append_sheet(wb, wsBudget, 'Budget');

    // 3. Timeline
    const timelineHeaders = ['Milestone', 'Date', 'Description'];
    const timelineSample = ['Program Launch', '2026-09-01', 'First day of fall semester.'];
    const wsTimeline = XLSX.utils.aoa_to_sheet([timelineHeaders, timelineSample]);
    XLSX.utils.book_append_sheet(wb, wsTimeline, 'Timeline');

    // 4. Q&A
    const qaHeaders = ['Question', 'Answer'];
    const qaSample = ['Is KYO a registered charity?', 'Yes, KYO is a registered charity.'];
    const wsQA = XLSX.utils.aoa_to_sheet([qaHeaders, qaSample]);
    XLSX.utils.book_append_sheet(wb, wsQA, 'Q&A');

    // Download the file
    XLSX.writeFile(wb, 'Grant_Template_Workbook.xlsx');
  };

  const exportSpecificGrantToXlsx = (grant: GrantCase) => {
    const wb = XLSX.utils.book_new();

    // 1. Core Profile
    const coreHeaders = [
      'Funder Name', 'Grant Name', 'Amount Requested', 'Primary Program', 'Submission Date',
      'Funding Type', 'Number of Years',
      'Values Alignment', 'Reporting Plan', 'Recognition Plan',
      'Signer Name', 'Signer Title', 'Contact Name', 'Contact Email', 'Header Image URL'
    ];
    const coreData = [
      grant.funderName || '', grant.grantName || '', String(grant.amountRequested || 0), grant.primaryProgram || '', grant.submissionDate || '',
      grant.fundingType || '', grant.numberOfYears ? String(grant.numberOfYears) : '',
      grant.valuesAlignment || '', grant.reportingPlan || '', grant.recognitionPlan || '',
      grant.signerName || '', grant.signerTitle || '', grant.contactName || '', grant.contactEmail || '', grant.headerImageUrl || ''
    ];
    const wsCore = XLSX.utils.aoa_to_sheet([coreHeaders, coreData]);
    XLSX.utils.book_append_sheet(wb, wsCore, 'Core Profile');

    // 2. Budget
    const budgetHeaders = ['Item', 'Amount', 'Category', 'Subcategory'];
    const budgetData = (grant.budgetBreakdown || []).map(b => [b.item || '', b.amount || '', b.category || '', b.subcategory || '']);
    const wsBudget = XLSX.utils.aoa_to_sheet([budgetHeaders, ...budgetData]);
    XLSX.utils.book_append_sheet(wb, wsBudget, 'Budget');

    // 3. Timeline
    const timelineHeaders = ['Milestone', 'Date', 'Description'];
    const timelineData = (grant.timeline || []).map(t => [t.milestone || '', t.date || '', t.description || '']);
    const wsTimeline = XLSX.utils.aoa_to_sheet([timelineHeaders, ...timelineData]);
    XLSX.utils.book_append_sheet(wb, wsTimeline, 'Timeline');

    // 4. Q&A
    const qaHeaders = ['Question', 'Answer'];
    const qaData = (grant.grantQA || []).map(q => [q.question || '', q.answer || '']);
    const wsQA = XLSX.utils.aoa_to_sheet([qaHeaders, ...qaData]);
    XLSX.utils.book_append_sheet(wb, wsQA, 'Q&A');

    // Download the file
    const safeFunder = (grant.funderName || 'Grant').replace(/[^a-z0-9]/gi, '_');
    XLSX.writeFile(wb, `${safeFunder}_Export_${grant.grantCycleYear}.xlsx`);
  };


  const exportAllGrantsToCsv = () => {
    if (!grants.length) return;
    
    const rows = grants.map(grant => {
      return {
        'Funder Name': grant.funderName || '',
        'Grant Name': grant.grantName || '',
        'Amount Requested': grant.amountRequested || 0,
        'Primary Program': grant.primaryProgram || '',
        'Submission Date': grant.submissionDate || '',
        'Funding Type': grant.fundingType || '',
        'Number of Years': grant.numberOfYears || '',
        'Values Alignment': grant.valuesAlignment || '',
        'Reporting Plan': grant.reportingPlan || '',
        'Recognition Plan': grant.recognitionPlan || '',
        'Signer Name': grant.signerName || '',
        'Signer Title': grant.signerTitle || '',
        'Contact Name': grant.contactName || '',
        'Contact Email': grant.contactEmail || '',
        'Header Image URL': grant.headerImageUrl || ''
      };
    });

    const csvContent = Papa.unparse(rows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `All_Grants_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (

    <div className="container mx-auto py-10 space-y-8">
      {/* Back Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="rounded-full">
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-headline font-bold">Case For Support Manager</h1>
            <p className="text-sm text-muted-foreground">Manage granting organizations, UIDs, and CSV uploads.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 rounded-xl text-primary border-primary/20 hover:bg-primary/5 bg-transparent" onClick={exportAllGrantsToCsv}>
            <Download className="w-4 h-4" /> Export All Grants
          </Button>
          <Button variant="secondary" className="gap-2 rounded-xl border-primary/20 text-primary hover:bg-primary/5 bg-transparent" onClick={downloadMasterTemplate}>
            <FileSpreadsheet className="w-4 h-4" /> Download Master Template (XLSX)
          </Button>
          <CsvManagerDialog
            title="Manage Core Profile CSV"
            description="Import new grants in bulk using a CSV file. Includes basic details and narrative text."
            templateHeaders={[
              'Funder Name', 'Grant Name', 'Amount Requested', 'Primary Program', 'Submission Date',
              'Funding Type', 'Number of Years',
              'Values Alignment', 'Reporting Plan', 'Recognition Plan',
              'Signer Name', 'Signer Title', 'Contact Name', 'Contact Email', 'Header Image URL'
            ]}
            templateSampleRow={[
              'Ontario Arts Council', 'Community Orchestras Grant', '15000', 'Orchestras', '2026-08-01',
              'multi-year', '3',
              'We believe in community...', 'We will send a report...', 'Logo on website...',
              'Jane Doe', 'Executive Director', 'John Smith', 'john@thekyo.org', 'https://example.com/image.jpg'
            ]}
            instructionText="Core Profile CSV Instructions:
- Provide 1 row per grant.
- REQUIRED Columns: 'Funder Name', 'Amount Requested', 'Primary Program', 'Submission Date'.
- OPTIONAL Columns: 'Grant Name', 'Funding Type', 'Number of Years', 'Values Alignment', 'Reporting Plan', 'Recognition Plan', 'Signer Name', 'Signer Title', 'Contact Name', 'Contact Email', 'Header Image URL'.
- Funding Type must be one of: 'one-time', 'multi-year', or 'matching'.
- Primary Program must be one of: 'Orchestras', 'Upbeat!', 'Lessons', 'Chamber Music'.
- Markdown STYLING IS SUPPORTED for the 'Values Alignment', 'Reporting Plan', and 'Recognition Plan' columns!
  - You can use *italics*, **bold**, [links](https://thekyo.org).
  - To do line breaks in CSV, make sure the cell is wrapped in quotes if it spans multiple lines.
- Submission Date should be YYYY-MM-DD."
            onUpload={handleCsvUpload}
            triggerButtonText="Import Core Profiles"
          />
          <Button asChild className="gap-2 rounded-xl">
            <Link href="/admin/case-for-support/new">
              <Plus className="w-4 h-4" /> New Grant
            </Link>
          </Button>
        </div>
      </div>

      <div className="w-full">
        <Card className="rounded-[2rem] border-primary/10 shadow-lg overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>Grant Directory</CardTitle>
            <CardDescription>View, edit, and access dynamic Case for Support links.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading grants...
              </div>
            ) : grants.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground space-y-2">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300" />
                <p>No grants configured yet.</p>
                <p className="text-xs">Add a grant manually or upload a CSV to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funder & Grant Name</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Short UID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grants.map((grant) => {
                    const urlPath = getGrantUrlPath(grant);
                  
  const exportAllGrantsToCsv = () => {
    if (!grants.length) return;
    
    const rows = grants.map(grant => {
      return {
        'Funder Name': grant.funderName || '',
        'Grant Name': grant.grantName || '',
        'Amount Requested': grant.amountRequested || 0,
        'Primary Program': grant.primaryProgram || '',
        'Submission Date': grant.submissionDate || '',
        'Funding Type': grant.fundingType || '',
        'Number of Years': grant.numberOfYears || '',
        'Values Alignment': grant.valuesAlignment || '',
        'Reporting Plan': grant.reportingPlan || '',
        'Recognition Plan': grant.recognitionPlan || '',
        'Signer Name': grant.signerName || '',
        'Signer Title': grant.signerTitle || '',
        'Contact Name': grant.contactName || '',
        'Contact Email': grant.contactEmail || '',
        'Header Image URL': grant.headerImageUrl || ''
      };
    });

    const csvContent = Papa.unparse(rows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `All_Grants_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (

                      <TableRow key={grant.id}>
                        <TableCell>
                          <div className="font-semibold text-slate-900">{grant.funderName}</div>
                          <div className="text-xs text-muted-foreground">{grant.grantName}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{grant.grantCycleYear}</TableCell>
                        <TableCell className="font-semibold text-slate-700">
                          ${grant.amountRequested.toLocaleString()}
                        </TableCell>
                        <TableCell>{grant.programOfSupport}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-400">
                          {grant.id?.substring(0, 6)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="rounded-full gap-1.5 px-3 border-primary/20 text-primary hover:bg-primary/10" onClick={() => exportSpecificGrantToXlsx(grant)}>
                              <Download className="w-3.5 h-3.5" /> Export Grant
                            </Button>
                            <Button asChild variant="ghost" size="icon" className="rounded-full">
                              <Link href={urlPath} target="_blank">
                                <ExternalLink className="w-4 h-4 text-slate-400 hover:text-primary" />
                              </Link>
                            </Button>
                            <Button asChild variant="ghost" size="icon" className="rounded-full">
                              <Link href={`/admin/case-for-support/${grant.id}/edit`}>
                                <Pencil className="w-4 h-4 text-slate-400 hover:text-primary" />
                              </Link>
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10">
                                  <Trash2 className="w-4 h-4 text-slate-400 hover:text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-3xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Grant Profile?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove the grant profile for {grant.funderName} ({grant.grantCycleYear}). The corresponding dynamic URL path will no longer be accessible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(grant.id || '')} className="rounded-xl bg-destructive hover:bg-destructive/90">
                                    Confirm Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
