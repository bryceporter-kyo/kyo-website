"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil, Trash2, Download, Upload, X, Loader2, Save } from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import { fetchEventsFromFirebase, addEventToFirebase, updateEventInFirebase, deleteEventFromFirebase } from "@/lib/events";
import { fetchCalendarSettings, saveCalendarSettings } from "@/lib/calendar-settings";
import { fetchCalendarSubscribers, addCalendarSubscriber, deleteCalendarSubscriber, CalendarSubscriber } from "@/lib/calendar-subscribers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, UserPlus, Trash } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { Event } from "@/lib/events";

const eventSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  name: z.string().min(3, "Event name must be at least 3 characters long."),
  location: z.string().optional(),
  time: z.string().optional(),
  endTime: z.string().optional(),
  notes: z.string().optional(),
  link: z.string().optional(),
  type: z.string({ required_error: "You need to select an event type." }),
});

export default function EventsAdminPage() {
    const { toast } = useToast();
    const [events, setEvents] = React.useState<Event[]>([]);
    const [editingEvent, setEditingEvent] = React.useState<Event | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);

    // Google Calendar Settings States
    const [upbeatCalendarId, setUpbeatCalendarId] = React.useState("");
    const [lessonsCalendarId, setLessonsCalendarId] = React.useState("");
    const [orchestrasCalendarId, setOrchestrasCalendarId] = React.useState("");
    const [isSavingSettings, setIsSavingSettings] = React.useState(false);

    // Subscribers States
    const [subscribers, setSubscribers] = React.useState<CalendarSubscriber[]>([]);
    const [newSubscriberEmail, setNewSubscriberEmail] = React.useState("");
    const [newSubOrchestras, setNewSubOrchestras] = React.useState(false);
    const [newSubUpbeat, setNewSubUpbeat] = React.useState(false);
    const [newSubLessons, setNewSubLessons] = React.useState(false);
    const [isSavingSubscriber, setIsSavingSubscriber] = React.useState(false);

    // Load data from Firebase
    React.useEffect(() => {
        const loadData = async () => {
            try {
                const [eventsData, settings, subscribersData] = await Promise.all([
                    fetchEventsFromFirebase(),
                    fetchCalendarSettings(),
                    fetchCalendarSubscribers()
                ]);
                setEvents(eventsData);
                setUpbeatCalendarId(settings.upbeatCalendarId || "");
                setLessonsCalendarId(settings.lessonsCalendarId || "");
                setOrchestrasCalendarId(settings.orchestrasCalendarId || "");
                setSubscribers(subscribersData);
            } catch (error) {
                console.error('Error loading events:', error);
                toast({
                    title: "Error",
                    description: "Failed to load settings, subscribers, or events.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [toast]);

    const handleAddSubscriber = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubscriberEmail.trim()) return;

        const selectedPrograms: ('orchestras' | 'upbeat' | 'lessons')[] = [];
        if (newSubOrchestras) selectedPrograms.push('orchestras');
        if (newSubUpbeat) selectedPrograms.push('upbeat');
        if (newSubLessons) selectedPrograms.push('lessons');

        if (selectedPrograms.length === 0) {
            toast({
                title: "Validation Error",
                description: "Please select at least one program category.",
                variant: "destructive",
            });
            return;
        }

        setIsSavingSubscriber(true);
        try {
            const newSub = await addCalendarSubscriber(newSubscriberEmail, selectedPrograms);
            setSubscribers([...subscribers, newSub]);
            setNewSubscriberEmail("");
            setNewSubOrchestras(false);
            setNewSubUpbeat(false);
            setNewSubLessons(false);
            toast({
                title: "Subscriber Added",
                description: `Successfully subscribed ${newSubscriberEmail}.`,
            });
        } catch (error) {
            console.error('Error adding subscriber:', error);
            toast({
                title: "Error",
                description: "Failed to add subscriber.",
                variant: "destructive",
            });
        } finally {
            setIsSavingSubscriber(false);
        }
    };

    const handleDeleteSubscriber = async (id: string, email: string) => {
        try {
            await deleteCalendarSubscriber(id);
            setSubscribers(subscribers.filter(sub => sub.id !== id));
            toast({
                title: "Subscriber Removed",
                description: `${email} has been unsubscribed from live updates.`,
                variant: "destructive",
            });
        } catch (error) {
            console.error('Error deleting subscriber:', error);
            toast({
                title: "Error",
                description: "Failed to unsubscribe user.",
                variant: "destructive",
            });
        }
    };
    
    const parseDate = (dateString: string) => {
      return new Date(`${dateString}T00:00:00`);
    }

    const form = useForm<z.infer<typeof eventSchema>>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            name: "",
            location: "",
            time: "",
            endTime: "",
            notes: "",
            link: "",
            type: "normal",
        },
    });

    React.useEffect(() => {
      if (editingEvent) {
        form.reset({
          name: editingEvent.name,
          date: parseDate(editingEvent.date),
          location: editingEvent.location || "",
          time: editingEvent.time || "",
          endTime: editingEvent.endTime || "",
          notes: editingEvent.notes || "",
          link: editingEvent.link || "",
          type: editingEvent.type,
        });
      } else {
        form.reset({
          name: "",
          date: undefined,
          location: "",
          time: "",
          endTime: "",
          notes: "",
          link: "",
          type: "normal",
        });
      }
    }, [editingEvent, form]);

    async function onSubmit(values: z.infer<typeof eventSchema>) {
        setIsSaving(true);
        try {
            if (editingEvent) {
                const updatedEventData = {
                    ...values,
                    date: format(values.date, 'yyyy-MM-dd'),
                };
                await updateEventInFirebase(editingEvent.id, updatedEventData);
                
                const updatedEvents = events.map(event => 
                    event.id === editingEvent.id 
                        ? { ...event, ...updatedEventData } 
                        : event
                );
                setEvents(updatedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
                toast({
                    title: "Event Updated!",
                    description: `"${values.name}" has been updated.`,
                });
                setEditingEvent(null);
            } else {
                const newEventData = {
                    ...values,
                    date: format(values.date, 'yyyy-MM-dd'),
                };
                const newEvent = await addEventToFirebase(newEventData);
                
                const updatedEvents = [...events, newEvent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setEvents(updatedEvents);
                toast({
                    title: "Event Created!",
                    description: "The new event has been saved to the database.",
                });
            }
            form.reset();
        } catch (error) {
            console.error('Error saving event:', error);
            toast({
                title: "Error",
                description: "Failed to save event. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingSettings(true);
        try {
            await saveCalendarSettings({
                upbeatCalendarId: upbeatCalendarId.trim(),
                lessonsCalendarId: lessonsCalendarId.trim(),
                orchestrasCalendarId: orchestrasCalendarId.trim()
            });
            toast({
                title: "Settings Saved",
                description: "Google Calendar configurations have been updated successfully.",
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            toast({
                title: "Error",
                description: "Failed to save calendar configurations.",
                variant: "destructive",
            });
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleEditClick = (event: Event) => {
        setEditingEvent(event);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    const handleCancelEdit = () => {
        setEditingEvent(null);
    }
    
    const handleDownloadCsv = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "date,name,location,time,endTime,notes,link,type\n"
            + "2026-09-15,Rehearsal,Showplace,7:00 PM,9:00 PM,Standard session,,orchestras\n"
            + "2026-10-20,Fall Concert,Showplace,7:30 PM,10:00 PM,Grand Showcase.,,special";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "events_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUploadCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const newEvents: Event[] = [];
                let successCount = 0;
                let errorCount = 0;

                for (const row of results.data as any[]) {
                    try {
                        const eventData = {
                            date: row.date,
                            name: row.name,
                            location: row.location || "",
                            time: row.time || "",
                            endTime: row.endTime || "",
                            notes: row.notes || "",
                            link: row.link || "",
                            type: row.type || "normal",
                        };

                        if (!eventData.name || !eventData.date) {
                            errorCount++;
                            continue;
                        }

                        if (!/^\d{4}-\d{2}-\d{2}$/.test(eventData.date)) {
                            errorCount++;
                            continue;
                        }

                        const newEvent = await addEventToFirebase(eventData);
                        newEvents.push(newEvent);
                        successCount++;
                    } catch (error) {
                        errorCount++;
                    }
                }

                const allEvents = [...events, ...newEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setEvents(allEvents);
                setIsLoading(false);
                
                toast({
                    title: "Import Complete",
                    description: `Successfully imported ${successCount} events.${errorCount > 0 ? ` Failed to import ${errorCount} events.` : ""}`,
                    variant: errorCount > 0 ? "destructive" : "default",
                });
                
                event.target.value = "";
            },
            error: (error) => {
                console.error("CSV Parse Error:", error);
                setIsLoading(false);
                toast({
                    title: "Import Failed",
                    description: "Failed to parse CSV file.",
                    variant: "destructive",
                });
            }
        });
    };

    async function handleDelete(eventToDelete: Event) {
        try {
            await deleteEventFromFirebase(eventToDelete.id);
            setEvents(events.filter(event => event.id !== eventToDelete.id));
            toast({
                title: "Event Deleted",
                description: `"${eventToDelete.name}" has been deleted from the database.`,
                variant: "destructive",
            });
        } catch (error) {
            console.error('Error deleting event:', error);
            toast({
                title: "Error",
                description: "Failed to delete event. Please try again.",
                variant: "destructive",
            });
        }
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

            {/* Google Calendar Settings Form */}
            <Card className="mb-12 border-primary/20 shadow-md">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <CardTitle className="font-headline text-2xl">Google Calendar Integrations</CardTitle>
                    <CardDescription>
                        Enter public Google Calendar IDs to automatically pull live feeds. Leave blank to fallback to site-managed database events.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Orchestras Calendar ID</label>
                                <Input 
                                    placeholder="e.g. your-calendar-id@group.calendar.google.com" 
                                    value={orchestrasCalendarId} 
                                    onChange={(e) => setOrchestrasCalendarId(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Upbeat! Program Calendar ID</label>
                                <Input 
                                    placeholder="e.g. upbeat-id@group.calendar.google.com" 
                                    value={upbeatCalendarId} 
                                    onChange={(e) => setUpbeatCalendarId(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Lessons Calendar ID</label>
                                <Input 
                                    placeholder="e.g. lessons-id@group.calendar.google.com" 
                                    value={lessonsCalendarId} 
                                    onChange={(e) => setLessonsCalendarId(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={isSavingSettings} className="bg-primary hover:bg-primary/90 text-white">
                            {isSavingSettings ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Save Configurations
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Subscriber Management Panel */}
            <Card className="mb-12 border-primary/20 shadow-md">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <UserPlus className="w-6 h-6 text-primary" />
                        Live Calendar Subscribers
                    </CardTitle>
                    <CardDescription>
                        Manually subscribe users to program calendar channels and view active subscriptions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-8">
                    {/* Add Subscriber Form */}
                    <form onSubmit={handleAddSubscriber} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h4 className="font-bold text-sm text-slate-800">Subscribe New User</h4>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-grow space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                                <Input 
                                    type="email"
                                    placeholder="e.g. parent@example.com" 
                                    value={newSubscriberEmail} 
                                    required
                                    onChange={(e) => setNewSubscriberEmail(e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                            <div className="flex flex-wrap gap-6 py-3 px-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="sub-orch" checked={newSubOrchestras} onCheckedChange={(val) => setNewSubOrchestras(!!val)} />
                                    <label htmlFor="sub-orch" className="text-xs font-semibold cursor-pointer">Orchestras</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="sub-upbeat" checked={newSubUpbeat} onCheckedChange={(val) => setNewSubUpbeat(!!val)} />
                                    <label htmlFor="sub-upbeat" className="text-xs font-semibold cursor-pointer">Upbeat!</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="sub-lessons" checked={newSubLessons} onCheckedChange={(val) => setNewSubLessons(!!val)} />
                                    <label htmlFor="sub-lessons" className="text-xs font-semibold cursor-pointer">Lessons</label>
                                </div>
                            </div>
                            <Button type="submit" disabled={isSavingSubscriber} className="bg-primary hover:bg-primary/90 text-white shrink-0">
                                {isSavingSubscriber ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe User"}
                            </Button>
                        </div>
                    </form>

                    {/* Subscriber List Table */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-sm text-slate-800">Active Subscribers ({subscribers.length})</h4>
                        {subscribers.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic py-4">No active administrative subscribers found.</p>
                        ) : (
                            <div className="border border-slate-100 rounded-xl overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="text-xs font-bold">Email</TableHead>
                                            <TableHead className="text-xs font-bold">Involved Programs</TableHead>
                                            <TableHead className="text-xs font-bold text-right w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subscribers.map((sub) => (
                                            <TableRow key={sub.id}>
                                                <TableCell className="text-xs font-medium text-slate-700">{sub.email}</TableCell>
                                                <TableCell className="space-x-1.5">
                                                    {sub.programs.map((p) => (
                                                        <Badge key={p} variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                                                            {p}
                                                        </Badge>
                                                    ))}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-destructive hover:bg-destructive/10 h-8 w-8"
                                                        onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                                                    >
                                                        <Trash className="w-3.5 h-3.5" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

             <Card className="mb-12">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Bulk Event Management</CardTitle>
                    <CardDescription>Upload or download a CSV to add events in bulk.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">Use the template to format your events correctly for bulk import.</p>
                    <div className="flex gap-2">
                        <Button onClick={handleDownloadCsv} variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4"/>
                            Template
                        </Button>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleUploadCsv}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="Upload CSV"
                            />
                            <Button variant="outline" size="sm">
                                <Upload className="mr-2 h-4 w-4"/>
                                Upload CSV
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-12">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Existing Events</CardTitle>
                    <CardDescription>Manage, edit, or delete existing site-managed events.</CardDescription>
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
                                <TableHead>Date</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell className="font-medium">{format(parseDate(event.date), "PPP")}</TableCell>
                                    <TableCell>{event.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">{event.type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(event)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the event
                                                        "{event.name}" from the database.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(event)} className="bg-destructive hover:bg-destructive/90 text-white">
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
                    )}
                </CardContent>
            </Card>

            <Card id="edit-form-card">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">
                        {editingEvent ? "Edit Event" : "Create New Event"}
                    </CardTitle>
                    <CardDescription>
                        {editingEvent ? "Modify the fields below to update the event." : "Fill out the form to add a new event."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 'Spring Concert'" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
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
                                                date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., 'Showplace Performance Centre'" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="time"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Time (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., '7:30 PM'" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Time (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., '9:30 PM'" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes / Details (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 'Bring a music stand and formal attire.'" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="link"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Link (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., '/events/spring-concert'" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel>Event Category / Feed Channel</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="flex flex-col space-y-2"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="normal" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    General Rehearsal (Standard fallback)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="orchestras" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Orchestras Program Event
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="upbeat" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Upbeat! Program Event
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="lessons" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Lessons Program Event
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="special" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Special Event & Concerts (Always highlighted)
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-4">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? "Saving..." : (editingEvent ? "Update Event" : "Create Event")}
                                </Button>
                                {editingEvent && (
                                    <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel Edit
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}