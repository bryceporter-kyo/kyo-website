"use client";

import { useState, useMemo, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useImages } from "@/components/providers/ImageProvider";
import { fetchEventsFromFirebase, Event } from "@/lib/events";
import { fetchAnnouncementsFromFirebase, Announcement } from "@/lib/announcements";
import { format, isSameMonth, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Calendar as CalendarIcon, MapPin, Clock, ExternalLink, Sparkles, Info, FileText, Download, Share2, HelpCircle, CheckCircle2, Monitor, Smartphone, RefreshCw, Megaphone, Bell, Pin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { downloadCalendar } from "@/lib/calendar-export";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CalendarPage() {
    const [month, setMonth] = useState<Date | undefined>(undefined);
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
    const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
    const [origin, setOrigin] = useState("");
    
    useEffect(() => {
        setMonth(new Date());
        setOrigin(window.location.origin);
        
        const loadData = async () => {
            try {
                const [eventsData, announcementsData] = await Promise.all([
                    fetchEventsFromFirebase(),
                    fetchAnnouncementsFromFirebase()
                ]);
                setAllEvents(eventsData);
                setAnnouncements(announcementsData);
            } catch (error) {
                console.error('Error loading calendar data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, []);

    const parseDate = (dateString: string) => {
        return new Date(`${dateString}T00:00:00`);
    }
    
    const eventsForMonth = useMemo(() => {
        if (!month) return [];
        return allEvents
            .filter(event => isSameMonth(parseDate(event.date), month))
            .filter(event => event.type === 'special');
    }, [allEvents, month]);

    const eventsForSelectedDay = useMemo(() => {
        if (!selectedDay) return [];
        return allEvents
            .filter(event => isSameDay(parseDate(event.date), selectedDay))
            .sort((a, b) => {
                const timeA = a.time || "00:00";
                const timeB = b.time || "00:00";
                if (timeA !== timeB) return timeA.localeCompare(timeB);
                return a.name.localeCompare(b.name);
            });
    }, [allEvents, selectedDay]);

    const eventDays = useMemo(() => {
        return allEvents.map(event => parseDate(event.date));
    }, [allEvents]);

    const specialEventDays = useMemo(() => {
        return allEvents.filter(e => e.type === 'special').map(event => parseDate(event.date));
    }, [allEvents]);

    const { getImage } = useImages();
    const headerImage = getImage('page-header-calendar');

    const handleDayClick = (day: Date | undefined) => {
        if (!day) return;
        setSelectedDay(day);
        setIsDialogOpen(true);
    };

    const handleAnnouncementClick = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
        setIsAnnouncementDialogOpen(true);
    };

    const feedUrl = `${origin}/api/calendar`;
    const encodedFeedUrl = encodeURIComponent(feedUrl);

    const syncLinks = {
        google: `https://calendar.google.com/calendar/render?cid=${encodedFeedUrl}`,
        outlook: `https://outlook.live.com/calendar/0/addcalendar?url=${encodedFeedUrl}&name=KYO%20Events`,
        apple: feedUrl.replace(/^https?:\/\//, 'webcal://')
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    } as const;

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    } as const;

    return (
        <div className="relative overflow-hidden bg-background min-h-screen pb-24">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-[0.02]" />
            </div>

            <PageHeader
                title="Events Calendar"
                subtitle="Stay connected with our rehearsals, concerts, and community events."
                image={headerImage || undefined}
            />

            <section className="py-24 px-4">
                <div className="container mx-auto">
                    
                    {/* Announcements Section */}
                    <AnimatePresence>
                        {announcements.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-20"
                            >
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-headline font-bold">Important Bulletins</h2>
                                </div>
                                
                                <div className={cn(
                                    "grid gap-6",
                                    announcements.length % 2 === 0 
                                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" 
                                        : "grid-cols-1 max-w-4xl mx-auto"
                                )}>
                                    {announcements.map((announcement) => (
                                        <motion.div
                                            key={announcement.id}
                                            whileHover={{ y: -5 }}
                                            className="relative group cursor-pointer"
                                            onClick={() => handleAnnouncementClick(announcement)}
                                        >
                                            <Card className={cn(
                                                "h-full rounded-[2rem] border-primary/5 bg-white shadow-sm overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-primary/20",
                                                announcement.pinned && "ring-2 ring-primary/20"
                                            )}>
                                                {announcement.pinned && (
                                                    <div className="absolute top-6 right-6 text-primary">
                                                        <Pin className="w-4 h-4" />
                                                    </div>
                                                )}
                                                <CardHeader className="pb-4">
                                                    <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2">
                                                        <CalendarIcon className="w-3 h-3" />
                                                        {format(new Date(announcement.date), 'MMMM d, yyyy')}
                                                    </div>
                                                    <CardTitle className="text-lg font-headline font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                        {announcement.title}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-muted-foreground text-xs leading-relaxed font-light line-clamp-3">
                                                        {announcement.excerpt || announcement.content.substring(0, 100) + '...'}
                                                    </p>
                                                    <Button variant="link" className="px-0 mt-4 text-primary font-bold h-auto py-0 text-xs">
                                                        Read More <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                        
                        {/* Sticky Calendar Sidebar */}
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-4 lg:sticky lg:top-32"
                        >
                            <Card className="border-primary/10 bg-white/70 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden">
                                <CardHeader className="bg-primary/5 border-b border-primary/10 pb-8 pt-8 px-8">
                                    <div className="flex items-center gap-3 text-primary mb-2">
                                        <CalendarIcon className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Interactive Calendar</span>
                                    </div>
                                    <CardTitle className="font-headline text-2xl">Plan Your Season</CardTitle>
                                    <CardDescription>Click any day to see detailed events.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {month ? (
                                        <Calendar
                                            mode="single"
                                            month={month}
                                            onMonthChange={setMonth}
                                            selected={selectedDay}
                                            onSelect={handleDayClick}
                                            className="p-3 w-full"
                                            classNames={{
                                                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                                month: "space-y-6 w-full",
                                                caption: "flex justify-center pt-1 relative items-center mb-4",
                                                caption_label: "text-lg font-bold font-headline",
                                                nav: "space-x-1 flex items-center",
                                                nav_button: "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                                                nav_button_previous: "absolute left-1",
                                                nav_button_next: "absolute right-1",
                                                table: "w-full border-collapse space-y-1",
                                                head_row: "flex",
                                                head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] uppercase tracking-tighter mb-2",
                                                row: "flex w-full mt-2",
                                                cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20 w-full",
                                                day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-primary/10 rounded-full transition-all flex items-center justify-center mx-auto cursor-pointer",
                                                day_today: "bg-accent text-accent-foreground font-bold",
                                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                                day_outside: "text-muted-foreground opacity-50",
                                                day_disabled: "text-muted-foreground opacity-50",
                                                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                                day_hidden: "invisible",
                                            }}
                                            modifiers={{
                                                event: eventDays,
                                                special: specialEventDays,
                                            }}
                                            modifiersClassNames={{
                                                event: "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full",
                                                special: "after:bg-rose-500 font-bold text-primary",
                                            }}
                                        />
                                    ) : (
                                        <Skeleton className="w-full h-[350px] rounded-2xl" />
                                    )}

                                    <div className="mt-8 px-4 pb-4 space-y-3 border-t border-primary/5 pt-6">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                            <span className="text-muted-foreground">Standard Rehearsal</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                            <span className="text-muted-foreground font-bold">Special Events & Concerts</span>
                                        </div>
                                        <div className="pt-4 flex gap-2">
                                            <div className="flex-grow">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            variant="outline" 
                                                            className="w-full rounded-2xl border-primary/20 hover:bg-primary hover:text-white transition-all py-6"
                                                        >
                                                            <Share2 className="mr-2 h-4 w-4" />
                                                            Sync to Personal Calendar
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-[300px] rounded-2xl p-2 shadow-2xl border-primary/10">
                                                        <DropdownMenuLabel className="font-headline text-sm font-bold px-3 py-2">Select Your Calendar Service</DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-primary/5" />
                                                        <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer">
                                                            <Link href={syncLinks.google} target="_blank" className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 15l-5-5h3V9h4v4h3l-5 5z"/></svg>
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-sm">Google Calendar</p>
                                                                    <p className="text-[10px] text-muted-foreground">Sync with Android/Gmail</p>
                                                                </div>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer">
                                                            <Link href={syncLinks.apple} className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#000" d="M17.05 20.28c-.98.95-2.05 1.61-3.14 1.61-1.04 0-1.42-.64-2.73-.64-1.32 0-1.78.63-2.73.63-1.05 0-2.22-.72-3.23-1.72-2.03-2.03-3.13-5.74-3.13-8.6 0-4.63 2.92-7.1 5.71-7.1.92 0 1.77.29 2.53.29.68 0 1.7-.35 2.76-.35 1.09 0 2.15.22 3.02.83-2.31 1.79-1.92 5.34.42 6.51-.9 2.13-2.06 4.31-3.25 5.54zM12.03 7.25c-.15-2.23 1.66-4.07 3.65-4.25.26 2.37-2.11 4.14-3.65 4.25z"/></svg>
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-sm">iCloud / Apple Calendar</p>
                                                                    <p className="text-[10px] text-muted-foreground">Sync with iPhone/Mac</p>
                                                                </div>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer">
                                                            <Link href={syncLinks.outlook} target="_blank" className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#0078d4" d="M16 1h-2v2h2V1zm-4 0h-2v2h2V1zM7 1H5v2h2V1zm13 4v14c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h1V1h2v2h2V1h2v2h2V1h2v2h1c1.1 0 2 .9 2 2zm-2 2H4v12h14V7zM6 9h2v2H6V9zm4 0h2v2h-2V9zm4 0h2v2h-2V9zm-8 4h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/></svg>
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-sm">Outlook / Office 365</p>
                                                                    <p className="text-[10px] text-muted-foreground">Sync with Microsoft Outlook</p>
                                                                </div>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-primary/5" />
                                                        <DropdownMenuItem 
                                                            className="rounded-xl py-3 cursor-pointer text-primary font-bold justify-center"
                                                            onClick={() => downloadCalendar(allEvents)}
                                                        >
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Download Offline Copy (.ics)
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button 
                                                            variant="outline" 
                                                            size="icon"
                                                            className="rounded-2xl w-12 h-12 border-primary/20 text-primary hover:bg-primary/5"
                                                            onClick={() => setIsHelpDialogOpen(true)}
                                                        >
                                                            <HelpCircle className="w-5 h-5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white rounded-xl py-2 px-3 border-none">
                                                        How does sync work?
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-widest leading-relaxed">
                                            Subscribing keeps your calendar<br/>updated automatically
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Event Feed */}
                        <div className="lg:col-span-8 space-y-12">
                            <div className="flex items-end justify-between border-b border-primary/10 pb-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Sparkles className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Schedule</span>
                                    </div>
                                    <h2 className="text-4xl font-headline font-bold">
                                        {month ? format(month, 'MMMM yyyy') : 'Upcoming Events'}
                                    </h2>
                                </div>
                                <div className="hidden md:block">
                                    <Badge variant="outline" className="px-4 py-1.5 text-sm rounded-full border-primary/20 text-primary bg-primary/5">
                                        {eventsForMonth.length} {eventsForMonth.length === 1 ? 'Event' : 'Events'} Scheduled
                                    </Badge>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={month?.toISOString()}
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-1 gap-6"
                                >
                                    {isLoading ? (
                                        [1, 2, 3].map(i => <Skeleton key={i} className="w-full h-32 rounded-3xl" />)
                                    ) : eventsForMonth.length > 0 ? (
                                        eventsForMonth.map(event => (
                                            <motion.div key={event.id} variants={itemVariants}>
                                                <Card className="group relative overflow-hidden border-primary/5 bg-white transition-all duration-500 hover:shadow-2xl hover:border-primary/20 rounded-[2rem] cursor-pointer" onClick={() => handleDayClick(parseDate(event.date))}>
                                                    <div className={cn(
                                                        "absolute top-0 left-0 w-1.5 h-full transition-colors",
                                                        event.type === 'special' ? "bg-rose-500" : "bg-primary/20 group-hover:bg-primary"
                                                    )} />
                                                    
                                                    <CardContent className="p-8">
                                                        <div className="flex flex-col md:flex-row gap-8 items-center">
                                                            {/* Date Badge */}
                                                            <div className={cn(
                                                                "flex flex-col items-center justify-center w-24 h-24 rounded-3xl border transition-all duration-500 flex-shrink-0 shadow-sm",
                                                                event.type === 'special' 
                                                                    ? "bg-rose-500 text-white border-rose-600" 
                                                                    : "bg-primary/5 text-primary border-primary/10 group-hover:bg-primary group-hover:text-white"
                                                            )}>
                                                                <span className="text-3xl font-bold font-headline">{format(parseDate(event.date), 'dd')}</span>
                                                                <span className="text-xs font-bold uppercase tracking-widest">{format(parseDate(event.date), 'EEE')}</span>
                                                            </div>

                                                            {/* Event Details */}
                                                            <div className="flex-grow space-y-4 text-center md:text-left">
                                                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                                                    <Badge variant={event.type === 'special' ? 'default' : 'secondary'} className={cn(
                                                                        "px-3 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest",
                                                                        event.type === 'special' && "bg-rose-500 hover:bg-rose-600 text-white"
                                                                    )}>
                                                                        {event.type}
                                                                    </Badge>
                                                                </div>
                                                                <h3 className="text-2xl font-headline font-bold group-hover:text-primary transition-colors leading-tight">{event.name}</h3>
                                                                
                                                                <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2 text-muted-foreground text-sm font-light">
                                                                    {event.time && (
                                                                        <div className="flex items-center gap-2">
                                                                            <Clock className="w-4 h-4 text-primary/60" />
                                                                            <span>{event.time}</span>
                                                                        </div>
                                                                    )}
                                                                    {event.location && (
                                                                        <div className="flex items-center gap-2">
                                                                            <MapPin className="w-4 h-4 text-primary/60" />
                                                                            <span>{event.location}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Action Button */}
                                                            <div className="flex-shrink-0">
                                                                <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary hover:text-white">
                                                                    <ArrowRight className="w-5 h-5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <motion.div 
                                            variants={itemVariants}
                                            className="text-center py-20 px-8 rounded-[3rem] border-2 border-dashed border-primary/10 bg-primary/[0.02]"
                                        >
                                            <CalendarIcon className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                                            <p className="text-muted-foreground text-lg font-light">No special events scheduled for {month ? format(month, 'MMMM yyyy') : 'this month'}.</p>
                                            <Button variant="link" onClick={() => setMonth(new Date())} className="mt-4 text-primary font-bold">
                                                View Current Month
                                            </Button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* Announcement Detail Dialog */}
            <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                <DialogContent className="max-w-4xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    {selectedAnnouncement && (
                        <>
                            <div className="bg-primary p-10 text-white relative">
                                <div className="absolute top-0 right-0 p-10 opacity-10">
                                    <Bell className="w-32 h-32" />
                                </div>
                                <DialogHeader>
                                    <div className="flex items-center gap-3 text-white/60 mb-3">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-widest">{format(new Date(selectedAnnouncement.date), 'MMMM d, yyyy')}</span>
                                        </div>
                                        {selectedAnnouncement.pinned && (
                                            <Badge variant="secondary" className="bg-white/20 text-white border-none rounded-full px-3">
                                                <Pin className="w-3 h-3 mr-2" /> Pinned Bulletin
                                            </Badge>
                                        )}
                                    </div>
                                    <DialogTitle className="text-4xl font-headline font-bold leading-tight">
                                        {selectedAnnouncement.title}
                                    </DialogTitle>
                                </DialogHeader>
                            </div>

                            <div className="p-10 bg-white max-h-[70vh] overflow-y-auto">
                                <div className="grid lg:grid-cols-12 gap-10">
                                    <div className="lg:col-span-8 space-y-8">
                                        {selectedAnnouncement.imageUrl && (
                                            <div className="rounded-[2rem] overflow-hidden shadow-lg mb-8">
                                                <img src={selectedAnnouncement.imageUrl} alt={selectedAnnouncement.title} className="w-full h-auto object-cover" />
                                            </div>
                                        )}
                                        
                                        <div className="prose prose-slate max-w-none prose-headings:font-headline prose-headings:font-bold prose-p:font-light prose-p:leading-relaxed prose-a:text-primary prose-a:font-bold">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {selectedAnnouncement.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-4 space-y-6">
                                        {selectedAnnouncement.location && (
                                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
                                                <div className="flex items-center gap-2 text-primary">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Location</span>
                                                </div>
                                                <p className="font-bold text-slate-900">{selectedAnnouncement.location}</p>
                                            </div>
                                        )}

                                        {selectedAnnouncement.link && (
                                            <Button asChild className="w-full rounded-2xl py-6 bg-primary hover:bg-primary/90 text-white shadow-lg">
                                                <Link href={selectedAnnouncement.link} target="_blank">
                                                    Visit Related Link
                                                    <ExternalLink className="ml-2 w-4 h-4" />
                                                </Link>
                                            </Button>
                                        )}

                                        {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <FileText className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Documents</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {selectedAnnouncement.attachments.map((file, fIdx) => (
                                                        <Button key={fIdx} asChild variant="outline" className="w-full justify-between rounded-xl bg-white hover:bg-primary/5 hover:text-primary transition-all">
                                                            <Link href={file.url} target="_blank">
                                                                <span className="truncate max-w-[150px]">{file.name}</span>
                                                                <Download className="w-4 h-4" />
                                                            </Link>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Sync Help Dialog */}
            <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
                <DialogContent className="max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-primary p-6 text-white relative">
                        <DialogHeader>
                            <div className="flex items-center gap-2 text-white/60 mb-1">
                                <HelpCircle className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Sync Guide</span>
                            </div>
                            <DialogTitle className="text-2xl font-headline font-bold">How Synchronization Works</DialogTitle>
                        </DialogHeader>
                    </div>

                    <div className="p-6 bg-white space-y-6">
                        <div className="grid grid-cols-3 gap-3">
                             <Link href={syncLinks.google} target="_blank" className="flex flex-col items-center p-3 rounded-2xl border border-primary/5 bg-slate-50 hover:bg-primary/5 transition-all">
                                <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 15l-5-5h3V9h4v4h3l-5 5z"/></svg>
                                <span className="text-[10px] font-bold">Google</span>
                             </Link>
                             <Link href={syncLinks.apple} className="flex flex-col items-center p-3 rounded-2xl border border-primary/5 bg-slate-50 hover:bg-primary/5 transition-all">
                                <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24"><path fill="#000" d="M17.05 20.28c-.98.95-2.05 1.61-3.14 1.61-1.04 0-1.42-.64-2.73-.64-1.32 0-1.78.63-2.73.63-1.05 0-2.22-.72-3.23-1.72-2.03-2.03-3.13-5.74-3.13-8.6 0-4.63 2.92-7.1 5.71-7.1.92 0 1.77.29 2.53.29.68 0 1.7-.35 2.76-.35 1.09 0 2.15.22 3.02.83-2.31 1.79-1.92 5.34.42 6.51-.9 2.13-2.06 4.31-3.25 5.54zM12.03 7.25c-.15-2.23 1.66-4.07 3.65-4.25.26 2.37-2.11 4.14-3.65 4.25z"/></svg>
                                <span className="text-[10px] font-bold">Apple</span>
                             </Link>
                             <Link href={syncLinks.outlook} target="_blank" className="flex flex-col items-center p-3 rounded-2xl border border-primary/5 bg-slate-50 hover:bg-primary/5 transition-all">
                                <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24"><path fill="#0078d4" d="M16 1h-2v2h2V1zm-4 0h-2v2h2V1zM7 1H5v2h2V1zm13 4v14c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h1V1h2v2h2V1h2v2h2V1h2v2h1c1.1 0 2 .9 2 2zm-2 2H4v12h14V7zM6 9h2v2H6V9zm4 0h2v2h-2V9zm4 0h2v2h-2V9zm-8 4h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/></svg>
                                <span className="text-[10px] font-bold">Outlook</span>
                             </Link>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                                <div className="space-y-1">
                                    <h5 className="font-bold text-sm">Pick & Subscribe</h5>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Choose your service above. Your app will open and ask you to "Subscribe" or "Add" the live feed.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                                <div className="space-y-1">
                                    <h5 className="font-bold text-sm">Automatic Updates</h5>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Once added, you're done! Your calendar will now periodically check for changes and update itself automatically.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                             <div className="p-3 rounded-xl bg-primary/5 flex items-center gap-2">
                                <Smartphone className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-medium text-primary/80 tracking-tight">Works on all Mobile Devices</span>
                             </div>
                             <div className="p-3 rounded-xl bg-primary/5 flex items-center gap-2">
                                <RefreshCw className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-medium text-primary/80 tracking-tight">Auto-refreshes daily</span>
                             </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Event Details Dialog */}
            <Dialog 
                open={isDialogOpen} 
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setSelectedDay(undefined);
                }}
            >
                <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl [&>button]:hidden">
                    <div className="bg-primary p-8 text-white relative">
                         <div className="absolute top-0 right-0 p-8 opacity-10">
                            <CalendarIcon className="w-32 h-32" />
                        </div>
                        <DialogHeader>
                            <div className="flex items-center gap-2 text-white/60 mb-2">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Event Details</span>
                            </div>
                            <DialogTitle className="text-3xl font-headline font-bold">
                                {selectedDay ? format(selectedDay, 'EEEE, MMMM do') : ''}
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    
                    <div className="p-8 max-h-[60vh] overflow-y-auto space-y-8 bg-white">
                        {eventsForSelectedDay.length > 0 ? (
                            <div className="space-y-8">
                                {eventsForSelectedDay.map((event, idx) => (
                                    <div key={event.id} className={cn(
                                        "space-y-6 pb-8",
                                        idx !== eventsForSelectedDay.length - 1 && "border-b border-primary/5"
                                    )}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <Badge variant={event.type === 'special' ? 'default' : 'secondary'} className={cn(
                                                    "mb-2",
                                                    event.type === 'special' && "bg-rose-500 hover:bg-rose-600"
                                                )}>
                                                    {event.type}
                                                </Badge>
                                                <h4 className="text-2xl font-headline font-bold text-slate-900">{event.name}</h4>
                                            </div>
                                            {event.link && (
                                                <Button asChild size="sm" variant="outline" className="rounded-full">
                                                    <Link href={event.link}>
                                                        View Page
                                                        <ExternalLink className="ml-2 w-3 h-3" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Time</p>
                                                    <p className="font-bold text-slate-700">
                                                        {event.time || 'TBD'} 
                                                        {event.endTime && ` — ${event.endTime}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Location</p>
                                                    <p className="font-bold text-slate-700">{event.location || 'TBD'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {event.notes && (
                                            <div className="p-6 rounded-2xl bg-primary/[0.03] border border-primary/10 space-y-3">
                                                <div className="flex items-center gap-2 text-primary">
                                                    <Info className="w-4 h-4" />
                                                    <span className="text-xs font-bold uppercase tracking-widest">Notes & Details</span>
                                                </div>
                                                <p className="text-slate-600 leading-relaxed font-light italic font-serif">
                                                    "{event.notes}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 space-y-4">
                                <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto" />
                                <p className="text-slate-500 font-light">No events scheduled for this day.</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
