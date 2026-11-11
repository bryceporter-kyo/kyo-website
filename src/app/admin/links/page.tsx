
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { fetchLinksFromFirebase, updateLinkInFirebase, addLinkToFirebase, deleteLinkFromFirebase } from "@/lib/links";
import type { ExternalLink } from "@/lib/links";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";

// ── Schemas ────────────────────────────────────────────────────────────────────

const editLinkSchema = z.object({
  id: z.string(),
  url: z.string().min(1, "URL is required."),
});

const newLinkSchema = z.object({
  id: z
    .string()
    .min(1, "ID is required.")
    .regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
  name: z.string().min(1, "Display name is required."),
  url: z.string().min(1, "URL is required."),
});

type NewLinkValues = z.infer<typeof newLinkSchema>;

// ── Component ──────────────────────────────────────────────────────────────────

export default function LinksAdminPage() {
    const { toast } = useToast();
    const [links, setLinks] = React.useState<ExternalLink[]>([]);
    const [editingLinkId, setEditingLinkId] = React.useState<string | null>(null);
    const [deletingLink, setDeletingLink] = React.useState<ExternalLink | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [showAddDialog, setShowAddDialog] = React.useState(false);

    const searchParams = useSearchParams();
    const linkToEdit = searchParams.get("edit");

    // ── Load links ─────────────────────────────────────────────────────────────

    useEffect(() => {
        const loadLinks = async () => {
            try {
                const data = await fetchLinksFromFirebase();
                setLinks(data);
            } catch (error) {
                console.error("Error loading links:", error);
                toast({
                    title: "Error",
                    description: "Failed to load links from database.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadLinks();
    }, [toast]);

    // ── Edit form ──────────────────────────────────────────────────────────────

    const editForm = useForm<z.infer<typeof editLinkSchema>>({
        resolver: zodResolver(editLinkSchema),
        defaultValues: { id: "", url: "" },
    });

    useEffect(() => {
        if (linkToEdit && links.length > 0) {
            const link = links.find((l) => l.id === linkToEdit);
            if (link) {
                handleEditClick(link);
                setTimeout(() => {
                    const element = document.getElementById(link.id);
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                }, 100);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [linkToEdit, links]);

    const handleEditClick = (link: ExternalLink) => {
        setEditingLinkId(link.id);
        editForm.reset({ id: link.id, url: link.url });
    };

    const handleCancelEdit = () => {
        setEditingLinkId(null);
        editForm.reset({ id: "", url: "" });
    };

    async function onEditSubmit(values: z.infer<typeof editLinkSchema>) {
        setIsSaving(true);
        try {
            await updateLinkInFirebase(values.id, { url: values.url });
            setLinks((current) =>
                current.map((link) =>
                    link.id === values.id ? { ...link, url: values.url } : link
                )
            );
            toast({ title: "Link updated!", description: "The URL has been saved." });
            setEditingLinkId(null);
        } catch (error) {
            console.error("Error updating link:", error);
            toast({ title: "Error", description: "Failed to update link. Please try again.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }

    // ── Add form ───────────────────────────────────────────────────────────────

    const addForm = useForm<NewLinkValues>({
        resolver: zodResolver(newLinkSchema),
        defaultValues: { id: "", name: "", url: "" },
    });

    async function onAddSubmit(values: NewLinkValues) {
        // Check for duplicate ID
        if (links.some((l) => l.id === values.id)) {
            addForm.setError("id", { message: "A link with this ID already exists." });
            return;
        }
        setIsSaving(true);
        try {
            const newLink: ExternalLink = { id: values.id, name: values.name, url: values.url };
            await addLinkToFirebase(newLink);
            setLinks((current) => [...current, newLink].sort((a, b) => a.name.localeCompare(b.name)));
            toast({ title: "Link added!", description: `"${values.name}" is now available in the link picker.` });
            addForm.reset();
            setShowAddDialog(false);
        } catch (error) {
            console.error("Error adding link:", error);
            toast({ title: "Error", description: "Failed to add link. Please try again.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }

    // ── Delete ─────────────────────────────────────────────────────────────────

    async function handleDeleteConfirm() {
        if (!deletingLink) return;
        setIsSaving(true);
        try {
            await deleteLinkFromFirebase(deletingLink.id);
            setLinks((current) => current.filter((l) => l.id !== deletingLink.id));
            toast({ title: "Link deleted.", description: `"${deletingLink.name}" has been removed.` });
        } catch (error) {
            console.error("Error deleting link:", error);
            toast({ title: "Error", description: "Failed to delete link. Please try again.", variant: "destructive" });
        } finally {
            setIsSaving(false);
            setDeletingLink(null);
        }
    }

    const isEditing = (id: string) => editingLinkId === id;

    // ── Render ─────────────────────────────────────────────────────────────────

    if (isLoading) {
        return <div className="container mx-auto py-12">Loading...</div>;
    }

    return (
        <div className="container mx-auto py-12">
            <div className="mb-8">
                <Button asChild variant="outline">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Admin
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                        <CardTitle className="font-headline text-2xl">Manage Links</CardTitle>
                        <CardDescription>
                            Add, edit, or remove links. These IDs are used in buttons across the site.
                        </CardDescription>
                    </div>
                    <Button onClick={() => { addForm.reset(); setShowAddDialog(true); }} className="shrink-0">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Link
                    </Button>
                </CardHeader>
                <CardContent>
                    <Form {...editForm}>
                        <form onSubmit={(e) => { e.preventDefault(); editForm.handleSubmit(onEditSubmit)(); }}>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">Name</TableHead>
                                        <TableHead className="w-[160px] text-muted-foreground font-mono text-xs">ID</TableHead>
                                        <TableHead>URL</TableHead>
                                        <TableHead className="text-right w-[120px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {links.map((link) => (
                                        <TableRow key={link.id} id={link.id}>
                                            <TableCell className="font-medium align-top pt-4">{link.name}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground align-top pt-4">{link.id}</TableCell>
                                            <TableCell className="align-top pt-3">
                                                {isEditing(link.id) ? (
                                                    <FormField
                                                        control={editForm.control}
                                                        name="url"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input placeholder="https://example.com" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                ) : (
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary underline hover:text-primary/80 break-all text-sm"
                                                    >
                                                        {link.url}
                                                    </a>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right align-top pt-2">
                                                {isEditing(link.id) ? (
                                                    <div className="flex gap-1 justify-end">
                                                        <Button type="submit" size="icon" disabled={isSaving}>
                                                            <Save className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={handleCancelEdit} disabled={isSaving}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-1 justify-end">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(link)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => setDeletingLink(link)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* ── Add Link Dialog ───────────────────────────────────────────────── */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Link</DialogTitle>
                        <DialogDescription>
                            Create a new link that can be assigned to buttons across the site.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...addForm}>
                        <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                            <FormField
                                control={addForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Summer Camp Registration" {...field} />
                                        </FormControl>
                                        <FormDescription>Shown in the link picker dropdown.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addForm.control}
                                name="id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Link ID</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. summer-camp-registration"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value
                                                            .toLowerCase()
                                                            .replace(/\s+/g, "-")
                                                            .replace(/[^a-z0-9-]/g, "")
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Unique identifier used in code (lowercase, hyphens only). Auto-formatted.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addForm.control}
                                name="url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com or /internal/page" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            External URL, internal path (/contact), or mailto:/tel: link.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? "Adding…" : "Add Link"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation ───────────────────────────────────────────── */}
            <AlertDialog open={!!deletingLink} onOpenChange={(open) => { if (!open) setDeletingLink(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete link?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove <strong>&ldquo;{deletingLink?.name}&rdquo;</strong> (ID:{" "}
                            <code className="font-mono text-xs">{deletingLink?.id}</code>). Any buttons currently
                            pointing to this ID will break. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
