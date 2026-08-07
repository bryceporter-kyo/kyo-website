
"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Download, Upload, AlertCircle, FileSpreadsheet, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormEditor } from "@/components/admin/FormEditor/FormEditor";
import { getRegistrationForm, saveRegistrationForm } from "@/lib/registration-form-service";
import { RegistrationFormConfig, FormProgram } from "@/lib/registration-form";
import { getRegistrationSubmissions, batchImportSubmissions, updateRegistrationSubmissionStatus, RegistrationSubmission } from "@/lib/registration-submission-service";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CsvManagerDialog } from "@/components/shared/CsvManagerDialog";
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
import { format } from "date-fns";
import Papa from 'papaparse';

interface Props {
  params: Promise<{ program: string }>;
}

export default function AdminRegistrationProgramPage(props: Props) {
  const unwrappedParams = use(props.params);
  const program = unwrappedParams.program as FormProgram;
  
  if (program !== "orchestras" && program !== "upbeat") {
    notFound();
  }

  const { user } = useAuthContext();
  const { toast } = useToast();
  const [config, setConfig] = useState<RegistrationFormConfig | null>(null);
  const [submissions, setSubmissions] = useState<RegistrationSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRegistrationForm(program),
      getRegistrationSubmissions(program)
    ])
      .then(([fetchedConfig, fetchedSubs]) => {
        setConfig(fetchedConfig);
        setSubmissions(fetchedSubs.filter(s => s.status !== 'deleted'));
      })
      .finally(() => setIsLoading(false));
  }, [program]);

  const handleSaveConfig = async (updated: RegistrationFormConfig) => {
    await saveRegistrationForm(updated, user?.email ?? undefined);
    setConfig(updated);
    toast({ title: "Form saved", description: "Registration form updated successfully." });
  };

  const programTitle = program === "orchestras" ? "Orchestras" : "UpBeat!";

  // Compute "Submissions since last export"
  let newSubmissionsCount = submissions.length;
  if (config?.lastExportedAt) {
     const exportDate = new Date(config.lastExportedAt);
     newSubmissionsCount = submissions.filter(s => new Date(s.submittedAt) > exportDate).length;
  }

  // Handle Export Completion (tracking metadata)
  const trackExport = async () => {
    if (!config || !user?.email) return;
    const updated = {
      ...config,
      lastExportedAt: new Date().toISOString(),
      lastExportedBy: user.email,
    };
    await saveRegistrationForm(updated, user.email);
    setConfig(updated);
  };

  // Generate CSV rows for export
  const handleExport = (onlyNew = false) => {
    if (!config) return;
    
    let toExport = submissions;
    if (onlyNew && config.lastExportedAt) {
      const exportDate = new Date(config.lastExportedAt);
      toExport = toExport.filter(s => new Date(s.submittedAt) > exportDate);
    }
    
    const rows = toExport.map(sub => {
       const row: Record<string, any> = {
         SubmissionDate: sub.submittedAt,
         Status: sub.status,
       };
       config.questions.forEach(q => {
         if (q.type !== 'section_header') {
           row[q.label] = Array.isArray(sub.answers[q.id]) 
             ? sub.answers[q.id].join(", ") 
             : sub.answers[q.id];
         }
       });
       return row;
    });

    const csvContent = Papa.unparse(rows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${program}_registrations_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    trackExport();
  };

  // Handle Import
  const handleImport = async (data: any[], mode: 'append' | 'overwrite') => {
    if (!config) return;
    
    const subsToImport = data.map((row: any) => {
      // Map columns back to question IDs
      const answers: Record<string, any> = {};
      config.questions.forEach(q => {
        if (q.type !== 'section_header' && row[q.label] !== undefined) {
          answers[q.id] = row[q.label];
        }
      });
      return {
        program,
        formId: config.id,
        formTitle: config.title,
        status: "new" as const,
        answers
      };
    });
    
    await batchImportSubmissions(subsToImport);
    const fetchedSubs = await getRegistrationSubmissions(program);
    setSubmissions(fetchedSubs.filter(s => s.status !== 'deleted'));
    toast({ title: "Import Successful", description: `Imported ${subsToImport.length} submissions.` });
  };

  const handleDelete = async (id: string) => {
    try {
      await updateRegistrationSubmissionStatus(id, 'deleted');
      setSubmissions(prev => prev.filter(s => s.id !== id));
      toast({ title: "Submission deleted", description: "The registration has been removed from the UI." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete submission.", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto py-12 max-w-5xl">
      <Button asChild variant="outline" className="mb-8">
        <Link href="/admin/registrations">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Registration Forms
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline mb-2">{programTitle} Program Management</h1>
        <p className="text-muted-foreground">
          Manage the registration form structure and view/export submitted data.
        </p>
      </div>

      {isLoading || !config ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="editor" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="editor">Form Editor</TabsTrigger>
            <TabsTrigger value="data">Submissions Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor">
            <FormEditor
              initialConfig={config}
              onSave={handleSaveConfig}
              publicUrl={`/programs/registration/${program}`}
            />
          </TabsContent>
          
          <TabsContent value="data">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>Data Export History</CardTitle>
                  <CardDescription>Keep track of when registration data was last exported</CardDescription>
                </CardHeader>
                <CardContent>
                  {config.lastExportedAt ? (
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full text-primary">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Last exported by <span className="font-bold">{config.lastExportedBy}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          on {format(new Date(config.lastExportedAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700 border-green-200">
                          {newSubmissionsCount} new submissions since last export
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <AlertCircle className="w-5 h-5" />
                      <p>Data has not been exported yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Button variant="default" className="w-full justify-start" onClick={() => handleExport(false)}>
                    <Download className="mr-2 h-4 w-4" /> Export All Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleExport(true)} disabled={newSubmissionsCount === 0}>
                    <Download className="mr-2 h-4 w-4" /> Export New Data
                  </Button>
                  <CsvManagerDialog
                    title="Import Submissions"
                    description="Upload a CSV to import submissions. The columns must match the question labels exactly."
                    templateHeaders={["SubmissionDate", "Status", ...config.questions.filter(q => q.type !== 'section_header').map(q => q.label)]}
                    templateSampleRow={["2025-01-01", "new", ...config.questions.filter(q => q.type !== 'section_header').map(q => "Sample Answer")]}
                    instructionText="Leave SubmissionDate and Status blank to auto-generate them."
                    onUpload={handleImport}
                    triggerButtonText="Import CSV"
                  />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions ({submissions.length})</CardTitle>
                <CardDescription>A summary of the most recent registrations received.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="overflow-x-auto rounded-md border">
                   <table className="w-full text-sm">
                     <thead className="bg-muted/50 text-muted-foreground">
                       <tr>
                         <th className="px-4 py-3 text-left font-medium rounded-tl-md">Date</th>
                         <th className="px-4 py-3 text-left font-medium">Registrant</th>
                         <th className="px-4 py-3 text-left font-medium">Status</th>
                         <th className="px-4 py-3 text-left font-medium">Fields (Count)</th>
                         <th className="px-4 py-3 text-right font-medium rounded-tr-md">Actions</th>
                       </tr>
                     </thead>
                     <tbody>
                       {submissions.length === 0 ? (
                         <tr>
                           <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No submissions found.</td>
                         </tr>
                       ) : (
                         submissions.slice(0, 10).map(s => {
                           const fq = config.questions.find(q => q.label.toLowerCase().includes("first name") || q.label.toLowerCase().includes("firstname"));
                           const lq = config.questions.find(q => q.label.toLowerCase().includes("last name") || q.label.toLowerCase().includes("lastname"));
                           const first = fq ? s.answers[fq.id] : "";
                           const last = lq ? s.answers[lq.id] : "";
                           const name = (first || last) ? `${first} ${last}`.trim() : "Unknown Registrant";
                           
                           const handleDelete = async (id: string) => {
    try {
      await updateRegistrationSubmissionStatus(id, 'deleted');
      setSubmissions(prev => prev.filter(s => s.id !== id));
      toast({ title: "Submission deleted", description: "The registration has been removed from the UI." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete submission.", variant: "destructive" });
    }
  };

  return (
                           <tr key={s.id} className="border-t hover:bg-muted/30 transition-colors">
                             <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{format(new Date(s.submittedAt), "MMM d, yy h:mm a")}</td>
                             <td className="px-4 py-3 font-semibold text-foreground">{name}</td>
                             <td className="px-4 py-3">
                               <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize bg-primary/10 text-primary border-primary/20">
                                 {s.status}
                               </span>
                             </td>
                             <td className="px-4 py-3 text-muted-foreground">{Object.keys(s.answers).length} answers</td>
                             <td className="px-4 py-3 text-right">
                               <AlertDialog>
                                 <AlertDialogTrigger asChild>
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                     <Trash2 className="h-4 w-4" />
                                   </Button>
                                 </AlertDialogTrigger>
                                 <AlertDialogContent>
                                   <AlertDialogHeader>
                                     <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                     <AlertDialogDescription>
                                       This action cannot be undone. This will permanently remove this registration from the UI and future data exports. The raw data will still be retained in Firestore.
                                     </AlertDialogDescription>
                                   </AlertDialogHeader>
                                   <AlertDialogFooter>
                                     <AlertDialogCancel>Cancel</AlertDialogCancel>
                                     <AlertDialogAction onClick={() => s.id && handleDelete(s.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                       Yes, delete registration
                                     </AlertDialogAction>
                                   </AlertDialogFooter>
                                 </AlertDialogContent>
                               </AlertDialog>
                             </td>
                           </tr>
                         )})
                       )}
                     </tbody>
                   </table>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
