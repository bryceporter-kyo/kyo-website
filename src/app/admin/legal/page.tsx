"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil, Trash2, Loader2, Plus, ExternalLink, FileUp, Download, Check, X } from "lucide-react";
import Link from "next/link";
import React from "react";
import { fetchLegalPages, deleteLegalPage, type LegalPage } from "@/lib/legal-pages";
import { fetchLegalDocuments, saveLegalDocument, deleteLegalDocument, type LegalDocument } from "@/lib/legal-documents";
import { seedLegalPagesIfEmpty } from "@/lib/seed-legal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const legalDocumentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().min(5, "Description must be at least 5 characters."),
  url: z.string().url("Must be a valid URL link to PDF file."),
});

export default function LegalAdminPage() {
    const { toast } = useToast();
    const [pages, setPages] = React.useState<LegalPage[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    // Document States
    const [documents, setDocuments] = React.useState<LegalDocument[]>([]);
    const [isDocsLoading, setIsDocsLoading] = React.useState(true);
    const [isDocsSaving, setIsDocsSaving] = React.useState(false);
    const [editingDoc, setEditingDoc] = React.useState<LegalDocument | null>(null);

    const docForm = useForm<z.infer<typeof legalDocumentSchema>>({
        resolver: zodResolver(legalDocumentSchema),
        defaultValues: {
            name: "",
            description: "",
            url: "",
        },
    });

    React.useEffect(() => {
        loadData();
    }, []);

    React.useEffect(() => {
        if (editingDoc) {
            docForm.reset({
                name: editingDoc.name,
                description: editingDoc.description,
                url: editingDoc.url,
            });
        } else {
            docForm.reset({
                name: "",
                description: "",
                url: "",
            });
        }
    }, [editingDoc, docForm]);

    async function loadData() {
        setIsLoading(true);
        setIsDocsLoading(true);
        try {
            await seedLegalPagesIfEmpty();
            
            const [pagesData, docsData] = await Promise.all([
                fetchLegalPages(),
                fetchLegalDocuments()
            ]);
            setPages(pagesData);
            setDocuments(docsData);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load legal admin panel data.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setIsDocsLoading(false);
        }
    }

    async function handleDelete(id: string) {
        try {
            await deleteLegalPage(id);
            setPages(pages.filter(p => p.id !== id));
            toast({ title: "Page Deleted", description: "The legal page has been removed." });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to delete page.",
                variant: "destructive",
            });
        }
    }

    async function onDocSubmit(values: z.infer<typeof legalDocumentSchema>) {
        setIsDocsSaving(true);
        try {
            const docData = {
                ...values,
                uploadedAt: new Date().toISOString(),
            };
            
            const savedDoc = await saveLegalDocument(docData, editingDoc?.id);
            
            if (editingDoc) {
                setDocuments(documents.map(d => d.id === editingDoc.id ? savedDoc : d));
                toast({ title: "Document Updated", description: `"${values.name}" has been updated.` });
            } else {
                setDocuments([...documents, savedDoc]);
                toast({ title: "Document Created", description: `"${values.name}" has been saved.` });
            }
            
            setEditingDoc(null);
            docForm.reset();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to save document record.",
                variant: "destructive",
            });
        } finally {
            setIsDocsSaving(false);
        }
    }

    async function handleDocDelete(id: string) {
        try {
            await deleteLegalDocument(id);
            setDocuments(documents.filter(d => d.id !== id));
            toast({ title: "Document Removed", description: "The corporate document link was deleted." });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to delete document reference.",
                variant: "destructive",
            });
        }
    }

    return (
        <div className="container mx-auto py-12">
            <div className="mb-8 flex justify-between items-center">
                <Button asChild variant="outline">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Admin
                    </Link>
                </Button>
                {editingDoc && (
                    <Button variant="ghost" onClick={() => setEditingDoc(null)}>
                        Cancel Document Edit
                    </Button>
                )}
            </div>

            <Tabs defaultValue="policies" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8">
                    <TabsTrigger value="policies">Legal Policies</TabsTrigger>
                    <TabsTrigger value="documents">PDF Documents</TabsTrigger>
                </TabsList>

                {/* Policies Tab Content */}
                <TabsContent value="policies" className="space-y-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
                            <div>
                                <CardTitle className="font-headline text-2xl">Managed Legal Policies</CardTitle>
                                <CardDescription className="mt-1">Policies managed via Firestore that appear dynamically on `/legal` and `/legal/[slug]`</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/admin/legal/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create New Policy
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Slug</TableHead>
                                            <TableHead className="text-center">Index</TableHead>
                                            <TableHead className="text-center">Follow</TableHead>
                                            <TableHead className="text-center">Footer</TableHead>
                                            <TableHead>Last Updated</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pages.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                    No managed legal pages found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            pages.map((page) => (
                                                <TableRow key={page.id}>
                                                    <TableCell className="font-medium">{page.title}</TableCell>
                                                    <TableCell className="font-mono text-xs">/legal/{page.slug}</TableCell>
                                                    <TableCell className="text-center">
                                                        {page.index ? <Check className="h-4 w-4 mx-auto text-green-500" /> : <X className="h-4 w-4 mx-auto text-muted-foreground" />}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {page.follow ? <Check className="h-4 w-4 mx-auto text-green-500" /> : <X className="h-4 w-4 mx-auto text-muted-foreground" />}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {page.showInFooter ? <Check className="h-4 w-4 mx-auto text-green-500" /> : <X className="h-4 w-4 mx-auto text-muted-foreground" />}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {page.lastUpdated ? format(new Date(page.lastUpdated), "MMM d, yyyy") : "N/A"}
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/legal/${page.slug}`} target="_blank">
                                                                <ExternalLink className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/admin/legal/${page.id}/edit`}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-destructive">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will permanently delete the "{page.title}" legal page.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(page.id)}>Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Documents Tab Content */}
                <TabsContent value="documents" className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline text-2xl">Uploaded PDF Governance Documents</CardTitle>
                                    <CardDescription>Corporate governance documents (e.g. By-laws, manuals) that display in the downloads section on `/legal`</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isDocsLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Document Name</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead>Added Date</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {documents.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                            No governance documents found. Add one on the right!
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    documents.map((docItem) => (
                                                        <TableRow key={docItem.id}>
                                                            <TableCell className="font-medium">{docItem.name}</TableCell>
                                                            <TableCell className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">{docItem.description}</TableCell>
                                                            <TableCell className="text-sm">
                                                                {docItem.uploadedAt ? format(new Date(docItem.uploadedAt), "MMM d, yyyy") : "N/A"}
                                                            </TableCell>
                                                            <TableCell className="text-right space-x-2">
                                                                <Button variant="ghost" size="icon" asChild>
                                                                    <Link href={docItem.url} target="_blank">
                                                                        <Download className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onClick={() => setEditingDoc(docItem)}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="text-destructive">
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This will permanently delete the link to the document "{docItem.name}".
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={() => handleDocDelete(docItem.id)}>Delete</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-1">
                            <Card className="sticky top-8">
                                <CardHeader>
                                    <CardTitle className="font-headline text-2xl">
                                        {editingDoc ? "Edit Document" : "Add PDF Document"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Form {...docForm}>
                                        <form onSubmit={docForm.handleSubmit(onDocSubmit)} className="space-y-6">
                                            <FormField
                                                control={docForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Document Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. KYO By-Laws (2026)" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={docForm.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Brief Description</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Explain what this document is for..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={docForm.control}
                                                name="url"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>PDF URL (Google Drive / Firebase Storage)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="https://drive.google.com/..." {...field} />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Enter the public sharing link or URL of the PDF document.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" className="w-full" disabled={isDocsSaving}>
                                                {isDocsSaving ? (
                                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                                ) : (
                                                    <><FileUp className="mr-2 h-4 w-4" /> {editingDoc ? "Update Document Link" : "Save Document Link"}</>
                                                )}
                                            </Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
