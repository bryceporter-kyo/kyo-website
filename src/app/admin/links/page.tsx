
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { getLinks } from "@/lib/links";
import type { ExternalLink } from "@/lib/links";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from "react";

const linkSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url("Please enter a valid URL."),
});

export default function LinksAdminPage() {
    const { toast } = useToast();
    const links = getLinks();
    const [editingLink, setEditingLink] = React.useState<ExternalLink | null>(null);

    const form = useForm<z.infer<typeof linkSchema>>({
        resolver: zodResolver(linkSchema),
    });

    React.useEffect(() => {
        if (editingLink) {
            form.reset(editingLink);
        }
    }, [editingLink, form]);

    function onSubmit(values: z.infer<typeof linkSchema>) {
        console.log("Updating link:", values);
        toast({
            title: "Link Updated!",
            description: `The link "${values.name}" has been updated.`,
        });
        setEditingLink(null);
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
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Manage External Links</CardTitle>
                    <CardDescription>Edit the URLs for important calls-to-action across the site.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead className="text-right w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {links.map((link) => (
                                <TableRow key={link.id}>
                                    <TableCell className="font-medium">{link.name}</TableCell>
                                    <TableCell>
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                                            {link.url}
                                        </a>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => setEditingLink(link)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {editingLink && (
                        <div className="mt-8 pt-8 border-t">
                             <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <h3 className="text-lg font-medium font-headline">Editing: {editingLink.name}</h3>
                                     <FormField
                                        control={form.control}
                                        name="url"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex gap-4">
                                        <Button type="submit">Save Changes</Button>
                                        <Button variant="outline" onClick={() => setEditingLink(null)}>Cancel</Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
