
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { getAnnouncements, Announcement } from "@/lib/announcements";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  content: z.string().min(20, "Content must be at least 20 characters long."),
  imageUrl: z.string().url("Please enter a valid image URL.").optional().or(z.literal('')),
  pinned: z.boolean().default(false),
});

export default function AnnouncementsAdminPage() {
    const { toast } = useToast();
    const announcements = getAnnouncements();

    const form = useForm<z.infer<typeof announcementSchema>>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
        title: "",
        content: "",
        imageUrl: "",
        pinned: false,
        },
    });

    function onSubmit(values: z.infer<typeof announcementSchema>) {
        console.log(values);
        toast({
        title: "Announcement Created!",
        description: "The new announcement has been saved.",
        });
        form.reset();
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

            <Card className="mb-12">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Existing Announcements</CardTitle>
                    <CardDescription>Manage, edit, or delete existing announcements.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead className="w-[100px] text-center">Pinned</TableHead>
                                <TableHead className="text-right w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {announcements.map((announcement) => (
                                <TableRow key={announcement.id}>
                                    <TableCell className="font-medium">{announcement.title}</TableCell>
                                    <TableCell className="text-center">
                                        <Switch
                                            checked={announcement.pinned}
                                            aria-label="Pin announcement"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Create Announcement</CardTitle>
                    <CardDescription>Fill out the form below to add a new announcement.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., '2025 Season Auditions'" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Content</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write the main content of the announcement here. This field supports plain text."
                                            className="min-h-[200px]"
                                            {...field}
                                        />
                                    </FormControl>
                                     <FormDescription>
                                        A full WYSIWYG editor can be integrated here later.
                                    </FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Image</FormLabel>
                                    <FormControl>
                                        <Input type="file" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Upload an image for the announcement (optional).
                                    </FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="pinned"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Pin to Homepage</FormLabel>
                                            <FormDescription>
                                                If selected, this announcement will be featured on the homepage.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                             <Button type="submit">Create Announcement</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
