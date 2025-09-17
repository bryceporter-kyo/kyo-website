
"use client";

import { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { getEvents, Event } from "@/lib/events";
import { format, isSameMonth, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
    const [month, setMonth] = useState(new Date());
    const allEvents = useMemo(() => getEvents(), []);

    const parseDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    
    const eventsForMonth = useMemo(() => {
        return allEvents.filter(event => isSameMonth(parseDate(event.date), month));
    }, [allEvents, month]);

    const eventDays = useMemo(() => {
        return allEvents.map(event => parseDate(event.date));
    }, [allEvents]);

    const specialEventDays = useMemo(() => {
        return allEvents.filter(e => e.type === 'special').map(event => parseDate(event.date));
    }, [allEvents]);


    const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-calendar');

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
                             <Calendar
                                mode="single"
                                month={month}
                                onMonthChange={setMonth}
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
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Events for {format(month, 'MMMM yyyy')}</CardTitle>
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
