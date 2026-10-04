
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
import { ArrowLeft, Pencil, Trash2, CalendarIcon, X, FileText, Download, Upload, Info, Loader2, Plus, ExternalLink, Paperclip } from "lucide-react";
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

import rehypeRaw from 'rehype-raw';
import { uploadImage } from '@/lib/image-service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";


const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  content: z.string().min(20, "Content must be at least 20 characters long."),
  imageUrl: z.string().url().optional().or(z.literal('')),
  link: z.string().url().optional().or(z.literal('')),
  pinned: z.boolean().default(false),
  unpinsAt: z.date().optional(),
  disappearsAt: z.date().optional(),
  popupPage: z.string().optional(),
});

export default function AnnouncementsAdminPage() {
    const { toast } = useToast();
    const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
    const [editingAnnouncement, setEditingAnnouncement] = React.useState<Announcement | null>(null);
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [attachments, setAttachments] = React.useState<{ name: string; url: string }[]>([]);
    const [isUploadingAttachment, setIsUploadingAttachment] = React.useState(false);
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
            link: "",
            pinned: false,
            popupPage: "",
        },
    });

    React.useEffect(() => {
        if (editingAnnouncement) {
            form.reset({
                title: editingAnnouncement.title,
                content: editingAnnouncement.content,
                imageUrl: editingAnnouncement.imageUrl || "",
                link: editingAnnouncement.link || "",
                pinned: editingAnnouncement.pinned,
                unpinsAt: editingAnnouncement.unpinsAt ? new Date(editingAnnouncement.unpinsAt) : undefined,
                disappearsAt: editingAnnouncement.disappearsAt ? new Date(editingAnnouncement.disappearsAt) : undefined,
                popupPage: editingAnnouncement.popupPage || "",
            });
            setAttachments(editingAnnouncement.attachments || []);
        } else {
            form.reset({
                title: "",
                content: "",
                imageUrl: "",
                link: "",
                pinned: false,
                popupPage: "",
                unpinsAt: undefined,
                disappearsAt: undefined,
            });
            setImageFile(null);
            setAttachments([]);
        }
    }, [editingAnnouncement, form]);

    const contentValue = form.watch("content");
    const isPinned = form.watch("pinned");

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        
        setIsUploadingAttachment(true);
        try {
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            const uploadedUrl = await uploadImage(file, `announcements/doc_${Date.now()}`);
            setAttachments(prev => [...prev, { name: file.name, url: uploadedUrl }]);
            toast({
                title: "PDF Uploaded",
                description: `"${file.name}" attached successfully.`,
            });
        } catch (error) {
            console.error("Error uploading PDF:", error);
            toast({
                title: "Upload Failed",
                description: "Failed to upload document attachment. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploadingAttachment(false);
            e.target.value = "";
        }
    };

    const handleRemoveAttachment = (indexToRemove: number) => {
        setAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    async function onSubmit(values: z.infer<typeof announcementSchema>) {
        setIsSaving(true);
        try {
            let finalImageUrl = values.imageUrl;
            if (imageFile) {
                finalImageUrl = await uploadImage(imageFile, `announcements/img_${Date.now()}`);
            }

            const announcementData = {
                ...values,
                imageUrl: finalImageUrl,
                link: values.link || undefined,
                attachments: attachments.length > 0 ? attachments : undefined,
                date: editingAnnouncement?.date || format(new Date(), 'yyyy-MM-dd'),
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
            setImageFile(null);
            setAttachments([]);
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
                                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                                    {contentValue}
                                                </ReactMarkdown>
                                            </article>
                                        </div>
                                    </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-4 rounded-xl border p-5 bg-card">
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="text-base font-semibold">Featured Image (Optional)</FormLabel>
                                                <Badge variant="secondary" className="text-xs font-normal">
                                                    Responsive Display
                                                </Badge>
                                            </div>

                                            {/* Sizing & Responsiveness Guidance Callout */}
                                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs leading-relaxed space-y-1.5 text-slate-700 dark:text-slate-200">
                                                <div className="flex items-center gap-1.5 font-semibold text-primary">
                                                    <Info className="h-4 w-4 shrink-0" />
                                                    <span>Image Sizing & Display Guide</span>
                                                </div>
                                                <p className="text-muted-foreground">
                                                    Images are <strong>dynamically responsive</strong> across all devices (mobile, tablet, and desktop) and will automatically scale and fit cleanly within cards and announcement modals.
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-muted-foreground">
                                                    <div>• <strong>Recommended aspect ratio:</strong> 16:9 or 4:3 (landscape)</div>
                                                    <div>• <strong>Recommended resolution:</strong> 1200 × 675 px or 800 × 600 px</div>
                                                    <div>• <strong>Supported formats:</strong> PNG, JPG, WebP</div>
                                                    <div>• <strong>Max file size:</strong> 5 MB</div>
                                                </div>
                                            </div>

                                            <FormControl>
                                                <div className="flex flex-col gap-3 pt-1">
                                                    {field.value && (
                                                        <div className="relative h-36 w-60 rounded-xl overflow-hidden border shadow-sm group">
                                                            <img src={field.value} className="object-cover w-full h-full" alt="Preview" />
                                                            <Button 
                                                                type="button" 
                                                                variant="destructive" 
                                                                size="icon" 
                                                                className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md"
                                                                onClick={() => {
                                                                    field.onChange("");
                                                                    setImageFile(null);
                                                                }}
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                    <Input 
                                                        type="file" 
                                                        accept="image/png,image/jpeg,image/webp,image/jpg" 
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                setImageFile(e.target.files[0]);
                                                                field.onChange(URL.createObjectURL(e.target.files[0]));
                                                            }
                                                        }} 
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Upload an image to display with the announcement across the website.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* PDF Documents & Attachments Section */}
                            <div className="space-y-4 rounded-xl border p-5 bg-slate-50/70 dark:bg-slate-900/30">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-primary" />
                                            <h4 className="font-semibold text-base">PDF Documents & Attachments (Optional)</h4>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Upload PDF flyers, brochures, schedules, or permission slips that visitors can download.
                                        </p>
                                    </div>
                                    <div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isUploadingAttachment}
                                            className="relative cursor-pointer bg-white dark:bg-slate-950"
                                            asChild
                                        >
                                            <label>
                                                {isUploadingAttachment ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Uploading PDF...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        Upload PDF File
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    accept=".pdf,application/pdf"
                                                    className="sr-only"
                                                    onChange={handlePdfUpload}
                                                    disabled={isUploadingAttachment}
                                                />
                                            </label>
                                        </Button>
                                    </div>
                                </div>

                                {attachments.length > 0 ? (
                                    <div className="space-y-2 pt-2 border-t">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Attached Documents ({attachments.length})
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {attachments.map((doc, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg border bg-white dark:bg-slate-950 text-sm shadow-sm"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <FileText className="h-4 w-4 text-rose-500 shrink-0" />
                                                        <span className="truncate font-medium text-xs">{doc.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary">
                                                            <Link href={doc.url} target="_blank" title="View Document">
                                                                <Download className="h-3.5 w-3.5" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-destructive hover:text-destructive"
                                                            onClick={() => handleRemoveAttachment(idx)}
                                                            title="Remove Document"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-muted-foreground py-2 border-t border-dashed text-center">
                                        No PDF documents attached yet. Click "Upload PDF File" above to attach documents.
                                    </div>
                                )}
                            </div>

                            {/* Related Link Field */}
                            <FormField
                                control={form.control}
                                name="link"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Related Web Link (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com/tickets or /programs/orchestras" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Add an external or internal link button for this announcement (e.g. registration page or ticket sales).
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
                                <FormField
                                    control={form.control}
                                    name="popupPage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Specific-Page Popup Path (Optional)</FormLabel>
                                            <Select onValueChange={(val) => field.onChange(val === "none" ? "" : val)} value={field.value || "none"}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a page to show popup on" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None (Don't show as popup)</SelectItem>
                                                    <SelectItem value="/">Home Page (/)</SelectItem>
                                                    <SelectItem value="/about">About Us (/about)</SelectItem>
                                                    <SelectItem value="/programs/orchestras">Orchestras (/programs/orchestras)</SelectItem>
                                                    <SelectItem value="/programs/upbeat">UpBeat! (/programs/upbeat)</SelectItem>
                                                    <SelectItem value="/auditions">Auditions (/auditions)</SelectItem>
                                                    <SelectItem value="/support">Support Us (/support)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Specify which page should trigger this announcement as a popup modal.
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
