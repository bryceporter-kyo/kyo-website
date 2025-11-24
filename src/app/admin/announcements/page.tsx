
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
import { ArrowLeft, Pencil, Trash2, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { getAnnouncements, addAnnouncement, deleteAnnouncement, updateAnnouncement } from "@/lib/announcements";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
import type { Announcement } from "@/lib/announcements";
import React from "react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  content: z.string().min(20, "Content must be at least 20 characters long."),
  imageUrl: z.any().optional(),
  pinned: z.boolean().default(false),
  unpinsAt: z.date().optional(),
  disappearsAt: z.date().optional(),
});

export default function AnnouncementsAdminPage() {
    const { toast } = useToast();
    const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        setAnnouncements(getAnnouncements());
        setIsLoading(false);
    }, []);

    const form = useForm<z.infer<typeof announcementSchema>>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
            title: "",
            content: "",
            imageUrl: "",
            pinned: false,
        },
    });

    const contentValue = form.watch("content");
    const imageField = form.register("imageUrl");
    const isPinned = form.watch("pinned");

    function onSubmit(values: z.infer<typeof announcementSchema>) {
        const newAnnouncements = addAnnouncement(announcements, values);
        setAnnouncements(newAnnouncements);

        toast({
            title: "Announcement Created!",
            description: "The new announcement has been saved.",
        });
        form.reset();
    }

    function handleDelete(announcementToDelete: Announcement) {
        const newAnnouncements = deleteAnnouncement(announcements, announcementToDelete.id);
        setAnnouncements(newAnnouncements);
        toast({
            title: "Announcement Deleted",
            description: `"${announcementToDelete.title}" has been deleted.`,
            variant: "destructive",
        });
    }

    function handlePinToggle(announcementId: number) {
        const announcement = announcements.find(a => a.id === announcementId);
        if (announcement) {
            const updated = { ...announcement, pinned: !announcement.pinned };
            const newAnnouncements = updateAnnouncement(announcements, updated);
            setAnnouncements(newAnnouncements);
            toast({
                title: "Announcement Updated",
                description: `"${updated.title}" pinning status changed.`,
            });
        }
    }


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
                                <TableHead>Unpins At</TableHead>
                                <TableHead>Expires</TableHead>
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
                                            onCheckedChange={() => handlePinToggle(announcement.id)}
                                            aria-label="Pin announcement"
                                        />
                                    </TableCell>
                                     <TableCell>
                                        {announcement.unpinsAt ? format(new Date(announcement.unpinsAt), "PPP") : 'Never'}
                                    </TableCell>
                                    <TableCell>
                                        {announcement.disappearsAt ? format(new Date(announcement.disappearsAt), "PPP") : 'Never'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the announcement
                                                    "{announcement.title}".
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(announcement)}>
                                                    Delete
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
                                    <FormLabel>Content (Markdown Supported)</FormLabel>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormControl>
                                            <Textarea
                                                placeholder="Write the main content of the announcement here. This field supports Markdown."
                                                className="min-h-[300px] font-mono text-sm"
                                                {...field}
                                            />
                                        </FormControl>
                                        <div className="rounded-md border bg-muted p-4 min-h-[300px]">
                                             <h4 className="text-sm font-medium mb-2 text-muted-foreground">Markdown Preview</h4>
                                            <article className="prose prose-sm dark:prose-invert max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {contentValue}
                                                </ReactMarkdown>
                                            </article>
                                        </div>
                                    </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormItem>
                                <FormLabel>Image</FormLabel>
                                <FormControl>
                                    <Input type="file" {...imageField} />
                                </FormControl>
                                <FormDescription>
                                    Upload an image for the announcement (optional).
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
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
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {isPinned && (
                                    <FormField
                                        control={form.control}
                                        name="unpinsAt"
                                        render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Unpin Date</FormLabel>
                                            <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                    "w-[240px] pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                    format(field.value, "PPP")
                                                    ) : (
                                                    <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date()
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                            </Popover>
                                            <FormDescription>
                                                Set a date for this announcement to be automatically unpinned from the homepage.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                )}
                                <FormField
                                    control={form.control}
                                    name="disappearsAt"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Expiration Date</FormLabel>
                                        <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                "w-[240px] pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                format(field.value, "PPP")
                                                ) : (
                                                <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                        </Popover>
                                        <FormDescription>
                                            Set a date for this announcement to be hidden from the website entirely.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>

                             <Button type="submit">Create Announcement</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
