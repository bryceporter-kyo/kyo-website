
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
import { ArrowLeft, Pencil, Trash2, FileText, Loader2, Plus, ExternalLink, ShieldCheck, Search, ListTodo, Info } from "lucide-react";
import Link from "next/link";
import React from "react";
import { fetchLegalPages, saveLegalPage, deleteLegalPage, generateSlug, type LegalPage } from "@/lib/legal-pages";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const legalPageSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  slug: z.string().min(3, "Slug must be at least 3 characters."),
  content: z.string().min(10, "Content must be at least 10 characters."),
  headerImageId: z.string().optional(),
  index: z.boolean(),
  follow: z.boolean(),
  showInFooter: z.boolean(),
  ageMetadata: z.string().optional(),
});

export default function LegalAdminPage() {
    const { toast } = useToast();
    const [pages, setPages] = React.useState<LegalPage[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [editingPage, setEditingPage] = React.useState<LegalPage | null>(null);

    const form = useForm<z.infer<typeof legalPageSchema>>({
        resolver: zodResolver(legalPageSchema),
        defaultValues: {
            title: "",
            slug: "",
            content: "",
            headerImageId: "page-header-terms",
            index: true,
            follow: true,
            showInFooter: false,
            ageMetadata: "",
        },
    });

    React.useEffect(() => {
        loadPages();
    }, []);

    React.useEffect(() => {
        if (editingPage) {
            form.reset({
                title: editingPage.title,
                slug: editingPage.slug,
                content: editingPage.content,
                headerImageId: editingPage.headerImageId || "page-header-terms",
                index: editingPage.index ?? true,
                follow: editingPage.follow ?? true,
                showInFooter: editingPage.showInFooter ?? false,
                ageMetadata: editingPage.ageMetadata || "",
            });
        } else {
            form.reset({
                title: "",
                slug: "",
                content: "",
                headerImageId: "page-header-terms",
                index: true,
                follow: true,
                showInFooter: false,
                ageMetadata: "",
            });
        }
    }, [editingPage, form]);

    async function loadPages() {
        setIsLoading(true);
        try {
            const data = await fetchLegalPages();
            setPages(data);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load legal pages.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function onSubmit(values: z.infer<typeof legalPageSchema>) {
        setIsSaving(true);
        try {
            const pageData = {
                ...values,
                lastUpdated: new Date().toISOString(),
            };
            
            const savedPage = await saveLegalPage(pageData, editingPage?.id);
            
            if (editingPage) {
                setPages(pages.map(p => p.id === editingPage.id ? savedPage : p));
                toast({ title: "Page Updated", description: `"${values.title}" has been updated.` });
            } else {
                setPages([...pages, savedPage]);
                toast({ title: "Page Created", description: `"${values.title}" has been saved.` });
            }
            
            setEditingPage(null);
            form.reset();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to save legal page.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
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

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        form.setValue("title", title);
        if (!editingPage) {
            form.setValue("slug", generateSlug(title));
        }
    };

    return (
        <div className="container mx-auto py-12">
            <div className="mb-8 flex justify-between items-center">
                <Button asChild variant="outline">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Admin
                    </Link>
                </Button>
                {editingPage && (
                    <Button variant="ghost" onClick={() => setEditingPage(null)}>
                        Cancel Editing
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Managed Legal Pages</CardTitle>
                            <CardDescription>Pages managed via Firestore that appear under /legal/[slug]</CardDescription>
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
                                            <TableHead>Last Updated</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pages.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    No managed legal pages found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            pages.map((page) => (
                                                <TableRow key={page.id}>
                                                    <TableCell className="font-medium">{page.title}</TableCell>
                                                    <TableCell className="font-mono text-xs">/legal/{page.slug}</TableCell>
                                                    <TableCell className="text-sm">
                                                        {format(new Date(page.lastUpdated), "MMM d, yyyy")}
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/legal/${page.slug}`} target="_blank">
                                                                <ExternalLink className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => setEditingPage(page)}>
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
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-8">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">
                                {editingPage ? "Edit Page" : "Create New Page"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Page Title</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="e.g. Refund Policy" 
                                                        {...field} 
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            handleTitleChange(e);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Slug (Internal URL)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="refund_policy" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    The URL will be /legal/{field.value || "slug"}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="headerImageId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Header Image ID</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="page-header-terms" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y border-border/50">
                                        <FormField
                                            control={form.control}
                                            name="index"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Index (SEO)</FormLabel>
                                                        <FormDescription className="text-[10px]">Allow search engines to index this page.</FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="follow"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Follow (SEO)</FormLabel>
                                                        <FormDescription className="text-[10px]">Allow search engines to follow links.</FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="showInFooter"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Show in Footer</FormLabel>
                                                        <FormDescription className="text-[10px]">Link this page in the site footer.</FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="ageMetadata"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Age Metadata</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. 13+" className="h-9 text-xs" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel>Content (Markdown Supported)</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Tabs defaultValue="write" className="w-full">
                                                        <TabsList className="grid w-full grid-cols-2">
                                                            <TabsTrigger value="write">Write</TabsTrigger>
                                                            <TabsTrigger value="preview">Preview</TabsTrigger>
                                                        </TabsList>
                                                        <TabsContent value="write" className="mt-2">
                                                            <Textarea 
                                                                placeholder="Write your policy here using Markdown..." 
                                                                className="min-h-[400px] font-mono text-sm leading-relaxed"
                                                                {...field} 
                                                            />
                                                        </TabsContent>
                                                        <TabsContent value="preview" className="mt-2">
                                                            <div className="min-h-[400px] p-4 border rounded-md bg-muted/20 prose prose-slate max-w-none dark:prose-invert prose-headings:font-headline prose-sm overflow-auto">
                                                                {field.value ? (
                                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                        {field.value}
                                                                    </ReactMarkdown>
                                                                ) : (
                                                                    <p className="text-muted-foreground italic">Nothing to preview yet...</p>
                                                                )}
                                                            </div>
                                                        </TabsContent>
                                                    </Tabs>
                                                </FormControl>
                                                <FormDescription>
                                                    Supports GFM (Tables, Task lists, etc.)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isSaving}>
                                        {isSaving ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                        ) : (
                                            <><FileText className="mr-2 h-4 w-4" /> {editingPage ? "Update Legal Page" : "Create Legal Page"}</>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
