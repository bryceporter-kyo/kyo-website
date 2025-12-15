
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil, Save, X, FolderKanban, Loader2 } from "lucide-react";
import Link from "next/link";
import { fetchInternalSectionsFromFirebase, updateInternalSectionInFirebase } from "@/lib/internal-sections";
import type { InternalSection } from "@/lib/internal-sections";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchLinksFromFirebase } from "@/lib/links";
import type { ExternalLink } from "@/lib/links";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const sectionSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters."),
  manager: z.string().min(3, "Manager name must be at least 3 characters."),
  email: z.string().email("Please enter a valid email."),
  linkId: z.string().min(1, "You must select a link."),
});

export default function InternalSectionsAdminPage() {
    const { toast } = useToast();
    const [sections, setSections] = useState<InternalSection[]>([]);
    const [allLinks, setAllLinks] = useState<ExternalLink[]>([]);
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const searchParams = useSearchParams();
    const sectionToEdit = searchParams.get('edit');

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [sectionsData, linksData] = await Promise.all([
                    fetchInternalSectionsFromFirebase(),
                    fetchLinksFromFirebase()
                ]);
                setSections(sectionsData);
                setAllLinks(linksData);
            } catch (error) {
                console.error('Error loading data:', error);
                toast({
                    title: "Error",
                    description: "Failed to load data from Firebase.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [toast]);

    const form = useForm<z.infer<typeof sectionSchema>>({
        resolver: zodResolver(sectionSchema),
        defaultValues: {
            id: "",
            title: "",
            manager: "",
            email: "",
            linkId: "",
        },
    });

    useEffect(() => {
        if (sectionToEdit) {
            const section = sections.find(s => s.id === sectionToEdit);
            if (section) {
                handleEditClick(section);
                setTimeout(() => {
                    const element = document.getElementById(section.id);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
        }
    }, [sectionToEdit, sections]);
    
    const handleEditClick = (section: InternalSection) => {
        setEditingSectionId(section.id);
        form.reset({
            id: section.id,
            title: section.title,
            manager: section.manager,
            email: section.email,
            linkId: section.linkId,
        });
    };

    const handleCancel = () => {
        setEditingSectionId(null);
        form.reset({ id: "", title: "", manager: "", email: "", linkId: "" });
    };

    async function onSubmit(values: z.infer<typeof sectionSchema>) {
        setIsSaving(true);
        try {
            const updatedSection: InternalSection = {
                id: values.id,
                icon: sections.find(s => s.id === values.id)?.icon || 'Folder',
                title: values.title,
                manager: values.manager,
                email: values.email,
                linkId: values.linkId
            };
            
            await updateInternalSectionInFirebase(updatedSection);
            
            setSections(currentSections => 
                currentSections.map(section => 
                    section.id === values.id ? updatedSection : section
                )
            );

            toast({
                title: "Section Updated!",
                description: `The "${values.title}" section has been updated successfully.`,
            });
            setEditingSectionId(null);
        } catch (error) {
            console.error('Error updating section:', error);
            toast({
                title: "Error",
                description: "Failed to update section. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    }
    
    const isEditing = (id: string) => editingSectionId === id;

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

            {isLoading ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Loading sections...</span>
                    </CardContent>
                </Card>
            ) : (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><FolderKanban/> Manage Internal Sections</CardTitle>
                    <CardDescription>Edit the content for the cards displayed on the KYO Internal page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(onSubmit)(); }}>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Manager</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Drive Link</TableHead>
                                        <TableHead className="text-right w-[150px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sections.map((section) => (
                                        <TableRow key={section.id} id={section.id}>
                                            <TableCell className="font-medium">
                                                {isEditing(section.id) ? (
                                                     <FormField
                                                        control={form.control}
                                                        name="title"
                                                        render={({ field }) => <FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>}
                                                    />
                                                ) : section.title }
                                            </TableCell>
                                            <TableCell>
                                                {isEditing(section.id) ? (
                                                     <FormField
                                                        control={form.control}
                                                        name="manager"
                                                        render={({ field }) => <FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>}
                                                    />
                                                ) : section.manager }
                                            </TableCell>
                                            <TableCell>
                                                {isEditing(section.id) ? (
                                                     <FormField
                                                        control={form.control}
                                                        name="email"
                                                        render={({ field }) => <FormItem><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>}
                                                    />
                                                ) : <a href={`mailto:${section.email}`} className="text-primary hover:underline">{section.email}</a> }
                                            </TableCell>
                                             <TableCell>
                                                {isEditing(section.id) ? (
                                                    <FormField
                                                        control={form.control}
                                                        name="linkId"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select a link" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {allLinks.filter(l => l.id.startsWith("internal-drive-")).map(link => (
                                                                            <SelectItem key={link.id} value={link.id}>{link.name}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                ) : (allLinks.find(l => l.id === section.linkId)?.name || 'N/A') }
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {isEditing(section.id) ? (
                                                    <div className="flex gap-2 justify-end">
                                                        <Button type="submit" size="icon" disabled={isSaving}>
                                                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={handleCancel} disabled={isSaving}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(section)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
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
            )}
        </div>
    );
}
