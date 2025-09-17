
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
import { ArrowLeft, Pencil, Trash2, Download, Upload } from "lucide-react";
import Link from "next/link";
import { getEvents } from "@/lib/events";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import React from "react";
import { Label } from "@/components/ui/label";

const eventSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  name: z.string().min(3, "Event name must be at least 3 characters long."),
  location: z.string().optional(),
  time: z.string().optional(),
  link: z.string().optional(),
  type: z.enum(["special", "normal"], { required_error: "You need to select an event type." }),
});

export default function EventsAdminPage() {
    const { toast } = useToast();
    const events = getEvents();
    const [csvFile, setCsvFile] = React.useState<File | null>(null);

    const form = useForm<z.infer<typeof eventSchema>>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            name: "",
            location: "",
            time: "",
            link: "",
            type: "normal",
        },
    });

    function onSubmit(values: z.infer<typeof eventSchema>) {
        console.log(values);
        toast({
            title: "Event Created!",
            description: "The new event has been saved.",
        });
        form.reset();
    }
    
    const parseDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    const handleDownloadCsv = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "date,name,location,time,link,type\n"
            + "2025-01-15,Sample Event,Online,10:00 AM,/sample-event,normal";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "events_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setCsvFile(event.target.files[0]);
        }
    };

    const handleImportCsv = () => {
        if (!csvFile) {
            toast({
                title: "No file selected",
                description: "Please select a CSV file to upload.",
                variant: "destructive",
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            console.log("Parsing CSV content:", text);
            // In a real application, you would parse the CSV and send it to a server action
            toast({
                title: "CSV Uploaded",
                description: "The event data is being processed. (This is a placeholder)",
            });
        };
        reader.readAsText(csvFile);
    };

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
                    <CardDescription>Download a template or upload a CSV to manage events in bulk.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6 items-end">
                    <div>
                        <Label className="text-sm font-medium">Import from CSV</Label>
                        <p className="text-sm text-muted-foreground mb-2">Upload a CSV file to add multiple events at once.</p>
                        <div className="flex gap-2">
                            <Input type="file" accept=".csv" onChange={handleFileUpload} className="max-w-xs" />
                            <Button onClick={handleImportCsv} disabled={!csvFile} size="sm">
                                <Upload className="mr-2 h-4 w-4"/>
                                Upload
                            </Button>
                        </div>
                    </div>
                     <div className="text-right">
                        <Button onClick={handleDownloadCsv} variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4"/>
                            Download Template
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-12">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Existing Events</CardTitle>
                    <CardDescription>Manage, edit, or delete existing events.</CardDescription>
                </CardHeader>
                <CardContent>
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
                    <CardTitle className="font-headline text-2xl">Create Event</CardTitle>
                    <CardDescription>Fill out the form below to add a new event to the calendar.</CardDescription>
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
                                            <FormLabel>Time (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., '7:30 PM'" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
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
                            <Button type="submit">Create Event</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

    