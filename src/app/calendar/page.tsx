"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { getSuggestions } from "../actions/suggest-times";
import { Loader2, Sparkles } from "lucide-react";
import { getAnnouncements } from "@/lib/announcements";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CalendarPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { toast } = useToast();

    const [programName, setProgramName] = useState("");
    const [userPreferences, setUserPreferences] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState("");
    
    const announcements = getAnnouncements();

    const handleSuggestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!programName || !userPreferences) {
            toast({
                title: "Missing Information",
                description: "Please select a program and enter your preferences.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        setSuggestion("");

        const res = await getSuggestions({
            programName,
            userPreferences,
            instructorAvailability: "Weekdays 4 PM - 8 PM; Weekends 10 AM - 6 PM"
        });

        setIsLoading(false);

        if (res.success && res.data) {
            setSuggestion(res.data.suggestedTimes);
             toast({
                title: "Suggestions Ready!",
                description: "We've found some potential time slots for you.",
            });
        } else {
            toast({
                title: "Error",
                description: res.error,
                variant: "destructive"
            });
        }
    }


    const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-calendar');

    return (
        <div>
            <PageHeader
                title="Events Calendar"
                subtitle="Key dates, concerts, and deadlines for all our programs."
                image={headerImage}
            />
            <section className="container mx-auto">
                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardContent className="p-2 md:p-6">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md"
                                    numberOfMonths={2}
                                />
                            </CardContent>
                            <CardFooter>
                                <CardDescription>
                                    This calendar displays important dates. Note: This is a demo and not all events are shown.
                                </CardDescription>
                            </CardFooter>
                        </Card>
                    </div>
                    <div className="lg:col-span-1">
                        <Card className="bg-secondary">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                     <Sparkles className="w-6 h-6 text-primary"/>
                                    <CardTitle className="font-headline text-2xl">Find Your Best Time</CardTitle>
                                </div>
                                <CardDescription>
                                    Use our AI tool to find the best practice times based on your schedule.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSuggestion} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="program">Program</Label>
                                         <Select onValueChange={setProgramName} value={programName}>
                                            <SelectTrigger id="program">
                                                <SelectValue placeholder="Select a program" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Orchestra">Orchestra</SelectItem>
                                                <SelectItem value="Upbeat!">Upbeat!</SelectItem>
                                                <SelectItem value="Lessons">Lessons</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="preferences">Your Availability & Preferences</Label>
                                        <Textarea 
                                            id="preferences" 
                                            placeholder="e.g., 'Weekdays after 5 PM', 'Not available on weekends', 'Prefers morning slots'"
                                            value={userPreferences}
                                            onChange={(e) => setUserPreferences(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                        Get Suggestions
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                        {suggestion && (
                            <Card className="mt-8 animate-in fade-in-50">
                                <CardHeader>
                                    <CardTitle className="font-headline text-xl">Suggested Times</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{suggestion}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </section>
            <section id="announcements" className="bg-secondary">
                <div className="container mx-auto">
                     <div className="text-center mb-12">
                        <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl md:text-5xl">Announcements</h2>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                            Stay up-to-date with the latest happenings at KYO Hub.
                        </p>
                    </div>
                    <div className="max-w-4xl mx-auto grid grid-cols-1 gap-8">
                         {announcements.map((item) => (
                            <Card key={item.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-xl font-headline">{item.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-muted-foreground">{item.excerpt}</p>
                            </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
