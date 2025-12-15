
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
import { ArrowLeft, Pencil, Trash2, CalendarIcon, X } from "lucide-react";
import Link from "next/link";
import { 
    fetchAnnouncementsFromFirebase, 
    addAnnouncementToFirebase, 
    deleteAnnouncementFromFirebase, 
    updateAnnouncementInFirebase 
} from "@/lib/announcements";
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
  imageUrl: z.string().url().optional().or(z.literal('')),
  pinned: z.boolean().default(false),
  unpinsAt: z.date().optional(),
  disappearsAt: z.date().optional(),
});

export default function AnnouncementsAdminPage() {
    const { toast } = useToast();
    const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
    const [editingAnnouncement, setEditingAnnouncement] = React.useState<Announcement | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);

    // Load announcements from Firebase
    React.useEffect(() => {
        const loadAnnouncements = async () => {
            try {
                const data = await fetchAnnouncementsFromFirebase();
                setAnnouncements(data);
            } catch (error) {
                console.error('Error loading announcements:', error);
                toast({
                    title: "Error",
                    description: "Failed to load announcements from database.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadAnnouncements();
    }, [toast]);

    const form = useForm<z.infer<typeof announcementSchema>>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
            title: "",
            content: "",
            imageUrl: "",
            pinned: false,
        },
    });

    React.useEffect(() => {
        if (editingAnnouncement) {
            form.reset({
                title: editingAnnouncement.title,
                content: editingAnnouncement.content,
                imageUrl: editingAnnouncement.imageUrl || "",
                pinned: editingAnnouncement.pinned,
                unpinsAt: editingAnnouncement.unpinsAt ? new Date(editingAnnouncement.unpinsAt) : undefined,
                disappearsAt: editingAnnouncement.disappearsAt ? new Date(editingAnnouncement.disappearsAt) : undefined,
            });
        } else {
            form.reset({
                title: "",
                content: "",
                imageUrl: "",
                pinned: false,
                unpinsAt: undefined,
                disappearsAt: undefined,
            });
        }
    }, [editingAnnouncement, form]);

    const contentValue = form.watch("content");
    const isPinned = form.watch("pinned");

    async function onSubmit(values: z.infer<typeof announcementSchema>) {
        setIsSaving(true);
        try {
            const announcementData = {
                ...values,
                date: format(new Date(), 'yyyy-MM-dd'),
                excerpt: values.content.substring(0, 150) + (values.content.length > 150 ? '...' : ''),
                unpinsAt: values.unpinsAt ? format(values.unpinsAt, 'yyyy-MM-dd') : undefined,
                disappearsAt: values.disappearsAt ? format(values.disappearsAt, 'yyyy-MM-dd') : undefined,
            };
            
            if (editingAnnouncement) {
                await updateAnnouncementInFirebase(editingAnnouncement.id, announcementData);
                const updatedAnnouncements = announcements.map(a => 
                    a.id === editingAnnouncement.id ? { ...a, ...announcementData } : a
                );
                setAnnouncements(updatedAnnouncements);
                toast({
                    title: "Announcement Updated!",
                    description: "The announcement has been updated.",
                });
                setEditingAnnouncement(null);
            } else {
                const newAnnouncement = await addAnnouncementToFirebase(announcementData);
                setAnnouncements([newAnnouncement, ...announcements]);
                toast({
                    title: "Announcement Created!",
                    description: "The new announcement has been saved to the database.",
                });
            }
            form.reset();
        } catch (error) {
            console.error('Error saving announcement:', error);
            toast({
                title: "Error",
                description: "Failed to save announcement. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(announcementToDelete: Announcement) {
        try {
            await deleteAnnouncementFromFirebase(announcementToDelete.id);
            setAnnouncements(announcements.filter(a => a.id !== announcementToDelete.id));
            toast({
                title: "Announcement Deleted",
                description: `"${announcementToDelete.title}" has been deleted from the database.`,
                variant: "destructive",
            });
        } catch (error) {
            console.error('Error deleting announcement:', error);
            toast({
                title: "Error",
                description: "Failed to delete announcement. Please try again.",
                variant: "destructive",
            });
        }
    }

    async function handlePinToggle(announcementId: string) {
        const announcement = announcements.find(a => a.id === announcementId);
        if (announcement) {
            try {
                const newPinnedStatus = !announcement.pinned;
                await updateAnnouncementInFirebase(announcementId, { pinned: newPinnedStatus });
                
                const updatedAnnouncements = announcements.map(a => 
                    a.id === announcementId ? { ...a, pinned: newPinnedStatus } : a
                );
                setAnnouncements(updatedAnnouncements);
                
                toast({
                    title: "Announcement Updated",
                    description: `"${announcement.title}" pinning status changed.`,
                });
            } catch (error) {
                console.error('Error updating announcement:', error);
                toast({
                    title: "Error",
                    description: "Failed to update announcement. Please try again.",
                    variant: "destructive",
                });
            }
        }
    }

    const handleEditClick = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    const handleCancelEdit = () => {
        setEditingAnnouncement(null);
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
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(announcement)}>
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-2xl">
                            {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
                        </CardTitle>
                        <CardDescription>
                            {editingAnnouncement ? "Update the details of the announcement." : "Fill out the form below to add a new announcement."}
                        </CardDescription>
                    </div>
                    {editingAnnouncement && (
                        <Button variant="ghost" onClick={handleCancelEdit}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel Edit
                        </Button>
                    )}
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
                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image URL (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Add a URL for an image to display with the announcement.
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

                             <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Saving..." : (editingAnnouncement ? "Update Announcement" : "Create Announcement")}
                             </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
