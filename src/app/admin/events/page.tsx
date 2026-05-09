
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
import { ArrowLeft, Pencil, Trash2, Download, Upload, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import { fetchEventsFromFirebase, addEventToFirebase, updateEventInFirebase, deleteEventFromFirebase } from "@/lib/events";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import React from "react";
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

    // Load events from Firebase
    React.useEffect(() => {
        const loadEvents = async () => {
            try {
                const data = await fetchEventsFromFirebase();
                setEvents(data);
            } catch (error) {
                console.error('Error loading events:', error);
                toast({
                    title: "Error",
                    description: "Failed to load events from database.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadEvents();
    }, [toast]);
    
    const parseDate = (dateString: string) => {
      // Dates in JSON are "YYYY-MM-DD". 
      return new Date(dateString);
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
                // Update existing event in Firebase
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
                // Create new event in Firebase
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
            + "2025-01-15,Sample Event,Showplace Performance Centre,7:30 PM,9:30 PM,Bring formal attire.,https://example.com,normal\n"
            + "2025-06-20,Summer Concert,Showplace,7:30 PM,10:00 PM,Grand Finale.,,special";
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
                            type: (row.type === "special" ? "special" : "normal") as "special" | "normal",
                        };

                        // Basic validation
                        if (!eventData.name || !eventData.date) {
                            console.error("Invalid event data in CSV:", row);
                            errorCount++;
                            continue;
                        }

                        // Validate date format (YYYY-MM-DD)
                        if (!/^\d{4}-\d{2}-\d{2}$/.test(eventData.date)) {
                            console.error("Invalid date format in CSV (expected YYYY-MM-DD):", eventData.date);
                            errorCount++;
                            continue;
                        }

                        const newEvent = await addEventToFirebase(eventData);
                        newEvents.push(newEvent);
                        successCount++;
                    } catch (error) {
                        console.error("Error importing event from CSV:", error);
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
                
                // Clear input
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
                    <CardDescription>Manage, edit, or delete existing events.</CardDescription>
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
                                        <Badge variant={event.type === 'special' ? 'default' : 'secondary'}>{event.type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(event)}>
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
                                                    This action cannot be undone. This will permanently delete the event
                                                    "{event.name}".
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(event)}>
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

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">{editingEvent ? "Edit Event" : "Create Event"}</CardTitle>
                    <CardDescription>{editingEvent ? `Editing "${editingEvent.name}"` : "Fill out the form below to add a new event to the calendar."}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                                    <FormLabel>Event Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                        >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="normal" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Normal Event (e.g., Rehearsal) - Appears in light green
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="special" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Special Event (e.g., Concert) - Appears in bold green
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

    