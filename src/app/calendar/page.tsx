
"use client";

import { useState, useMemo, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useImages } from "@/components/providers/ImageProvider";
import { fetchEventsFromFirebase, Event } from "@/lib/events";
import { format, isSameMonth } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarPage() {
    const [month, setMonth] = useState<Date | undefined>(undefined);
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        setMonth(new Date());
        
        // Fetch events from Firebase
        const loadEvents = async () => {
            try {
                const events = await fetchEventsFromFirebase();
                setAllEvents(events);
            } catch (error) {
                console.error('Error loading events:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadEvents();
    }, []);

    const parseDate = (dateString: string) => {
        // Dates in JSON are "YYYY-MM-DD", which can be parsed directly by new Date()
        // but it's safer to ensure it's treated as UTC to avoid timezone issues.
        return new Date(`${dateString}T00:00:00`);
    }
    
    const eventsForMonth = useMemo(() => {
        if (!month) return [];
        return allEvents.filter(event => isSameMonth(parseDate(event.date), month));
    }, [allEvents, month]);

    const eventDays = useMemo(() => {
        return allEvents.map(event => parseDate(event.date));
    }, [allEvents]);

    const specialEventDays = useMemo(() => {
        return allEvents.filter(e => e.type === 'special').map(event => parseDate(event.date));
    }, [allEvents]);

    const { getImage } = useImages();
    const headerImage = getImage('page-header-calendar');

    return (
        <div>
            <PageHeader
                title="Events Calendar"
                subtitle="Key dates, concerts, and deadlines for all our programs."
                image={headerImage}
            />
            <section className="container mx-auto">
                <div className="flex flex-col gap-8">
                     <Card>
                        <CardContent className="p-0 md:p-0">
                            {month ? (
                                <Calendar
                                    mode="single"
                                    month={month}
                                    onMonthChange={setMonth}
                                    selected={month}
                                    className="p-0 w-full"
                                    classNames={{
                                        months: "flex flex-col sm:flex-row",
                                        month: "space-y-4 w-full",
                                        table: "w-full border-collapse space-y-1",
                                        head_cell: "text-muted-foreground rounded-md w-[14.28%] font-normal text-sm",
                                        row: "flex w-full mt-2",
                                        cell: "h-24 w-[14.28%] text-center text-sm p-1 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                        day: "h-full w-full p-1 font-normal aria-selected:opacity-100 justify-start items-start",
                                    }}
                                    modifiers={{
                                        event: eventDays,
                                        special: specialEventDays,
                                    }}
                                    modifiersClassNames={{
                                        event: "day-event",
                                        special: "day-special-event",
                                    }}
                                />
                            ) : (
                                <Skeleton className="w-full h-[400px]" />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Events for {month ? format(month, 'MMMM yyyy') : '...'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {eventsForMonth.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {eventsForMonth.map(event => (
                                        <Card key={event.id} className="flex flex-col">
                                            <CardHeader className="flex flex-row items-start gap-4">
                                                 <div className="text-center w-16 flex-shrink-0">
                                                    <p className="text-2xl font-bold text-primary">{format(parseDate(event.date), 'd')}</p>
                                                    <p className="text-sm text-muted-foreground">{format(parseDate(event.date), 'EEE')}</p>
                                                </div>
                                                <div className="flex-grow">
                                                    <CardTitle className="text-xl font-headline">{event.name}</CardTitle>
                                                     <div className="text-sm text-muted-foreground mt-1">
                                                        {event.location && <p>{event.location}</p>}
                                                        {event.time && <p>{event.time}</p>}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                             <CardContent className="flex-grow flex items-end justify-between">
                                                <Badge variant={event.type === 'special' ? 'default' : 'secondary'}>{event.type}</Badge>
                                                 {event.link && (
                                                     <Button asChild variant="outline" size="sm">
                                                        <Link href={event.link}>
                                                            More Info <ArrowRight className="ml-2 h-4 w-4"/>
                                                        </Link>
                                                    </Button>
                                                 )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No events scheduled for this month.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    )
}
