
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil, Save, X } from "lucide-react";
import Link from "next/link";
import { getLinks } from "@/lib/links";
import type { ExternalLink } from "@/lib/links";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from "react";

const linkSchema = z.object({
  id: z.string(),
  url: z.string().url("Please enter a valid URL."),
});

export default function LinksAdminPage() {
    const { toast } = useToast();
    const initialLinks = getLinks();
    const [links, setLinks] = React.useState<ExternalLink[]>(initialLinks);
    const [editingLinkId, setEditingLinkId] = React.useState<string | null>(null);

    const form = useForm<z.infer<typeof linkSchema>>({
        resolver: zodResolver(linkSchema),
        defaultValues: {
            id: "",
            url: "",
        },
    });
    
    const handleEditClick = (link: ExternalLink) => {
        setEditingLinkId(link.id);
        form.reset({ id: link.id, url: link.url });
    };

    const handleCancel = () => {
        setEditingLinkId(null);
        form.reset({ id: "", url: "" });
    };

    function onSubmit(values: z.infer<typeof linkSchema>) {
        console.log("Updating link:", values);
        
        // Update the link in the local state
        setLinks(currentLinks => 
            currentLinks.map(link => 
                link.id === values.id ? { ...link, url: values.url } : link
            )
        );

        toast({
            title: "Link Updated!",
            description: `The link has been updated successfully.`,
        });
        setEditingLinkId(null);
    }
    
    const isEditing = (id: string) => editingLinkId === id;

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
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Manage External Links</CardTitle>
                    <CardDescription>Edit the URLs for important calls-to-action across the site.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>URL</TableHead>
                                        <TableHead className="text-right w-[150px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {links.map((link) => (
                                        <TableRow key={link.id}>
                                            <TableCell className="font-medium">{link.name}</TableCell>
                                            <TableCell>
                                                {isEditing(link.id) ? (
                                                    <FormField
                                                        control={form.control}
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
                                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                                                        {link.url}
                                                    </a>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {isEditing(link.id) ? (
                                                    <div className="flex gap-2 justify-end">
                                                        <Button type="submit" size="icon">
                                                            <Save className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={handleCancel}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(link)}>
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
        </div>
    );
}
