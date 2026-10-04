"use client";

import { useState, useMemo, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useImages } from "@/components/providers/ImageProvider";
import { Event } from "@/lib/events";
import { fetchAnnouncementsFromFirebase, Announcement } from "@/lib/announcements";
import { format, isSameMonth, isSameDay, startOfDay, startOfMonth, addDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Calendar as CalendarIcon, MapPin, Clock, ExternalLink, Sparkles, Info, Download, Share2, HelpCircle, Bell, Pin, Search, ChevronDown, ChevronUp, Copy, Check, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { downloadCalendar } from "@/lib/calendar-export";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { CalendarSettings } from "@/lib/calendar-settings";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendarClientProps {
  initialEvents: Event[];
  initialSettings?: CalendarSettings;
}

export default function CalendarClient({ initialEvents, initialSettings }: CalendarClientProps) {
    const [month, setMonth] = useState<Date | undefined>(undefined);
    const [allEvents, setAllEvents] = useState<Event[]>(initialEvents || []);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(initialEvents.length === 0);
    const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
    const [isSubscribeDialogOpen, setIsSubscribeDialogOpen] = useState(false);
    const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
    const [origin, setOrigin] = useState("");
    const [copiedFeedUrl, setCopiedFeedUrl] = useState(false);
    const [showAllMonthEvents, setShowAllMonthEvents] = useState(false);
    
    // Filters and search
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'orchestras' | 'upbeat' | 'lessons' | 'special'>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFeed, setSelectedFeed] = useState<'all' | 'orchestras' | 'upbeat' | 'lessons'>('all');

    // Filter announcements: show all pinned + top 2 unpinned
    const visibleAnnouncements = useMemo(() => {
        const pinned = announcements.filter(a => a.pinned);
        const unpinned = announcements.filter(a => !a.pinned);
        return [...pinned, ...unpinned.slice(0, 2)];
    }, [announcements]);

    // Strip HTML helper for card excerpt
    const stripHtml = (html: string): string => {
        if (!html) return "";
        return html.replace(/<[^>]*>/g, '');
    };

    useEffect(() => {
        setMonth(new Date());
        setOrigin(window.location.origin);
        
        const loadData = async () => {
            try {
                // Fetch announcements from Firestore and check if events need re-sync
                const [announcementsData, calendarRes] = await Promise.all([
                    fetchAnnouncementsFromFirebase(),
                    fetch('/api/calendar/events')
                ]);
                setAnnouncements(announcementsData);

                if (calendarRes.ok) {
                    const data = await calendarRes.json();
                    if (data.events && data.events.length > 0) {
                        setAllEvents(data.events);
                    }
                }
            } catch (error) {
                console.error('Error refreshing calendar data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, []);

    const parseDate = (dateString: string) => {
        return new Date(`${dateString}T00:00:00`);
    };

    const filteredEventsForMonth = useMemo(() => {
        if (!month) return [];
        return allEvents
            .filter(event => isSameMonth(parseDate(event.date), month))
            .filter(event => {
                if (categoryFilter === 'special') return event.type === 'special';
                if (categoryFilter !== 'all' && event.type !== categoryFilter) return false;
                return true;
            })
            .filter(event => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                    event.name.toLowerCase().includes(query) ||
                    (event.location && event.location.toLowerCase().includes(query)) ||
                    (event.notes && event.notes.toLowerCase().includes(query))
                );
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [allEvents, month, categoryFilter, searchQuery]);

    // 10-Day Event Filter for Default View
    const displayedEvents = useMemo(() => {
        if (showAllMonthEvents) {
            return filteredEventsForMonth;
        }
        if (!month || filteredEventsForMonth.length === 0) {
            return [];
        }

        const today = startOfDay(new Date());
        const isCurrent = isSameMonth(month, today);

        if (isCurrent) {
            // For current month: show next 10 days of events starting from today (or from first upcoming)
            const upcoming = filteredEventsForMonth.filter(e => parseDate(e.date) >= today);
            if (upcoming.length > 0) {
                const firstDate = parseDate(upcoming[0].date);
                const cutoff = addDays(firstDate > today ? firstDate : today, 10);
                return upcoming.filter(e => parseDate(e.date) <= cutoff);
            }
            // If all events this month were in the past, show last few
            return filteredEventsForMonth.slice(-5);
        } else {
            // For future/other months: show events in the first 10 days of that month (or first 10 days of events)
            const cutoff = addDays(startOfMonth(month), 10);
            const eventsIn10Days = filteredEventsForMonth.filter(e => parseDate(e.date) <= cutoff);
            if (eventsIn10Days.length > 0) {
                return eventsIn10Days;
            }
            const firstDate = parseDate(filteredEventsForMonth[0].date);
            return filteredEventsForMonth.filter(e => parseDate(e.date) <= addDays(firstDate, 10));
        }
    }, [filteredEventsForMonth, month, showAllMonthEvents]);

    const hiddenEventsCount = Math.max(0, filteredEventsForMonth.length - displayedEvents.length);

    const handleCopyFeedUrl = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(feedUrl);
            setCopiedFeedUrl(true);
            setTimeout(() => setCopiedFeedUrl(false), 2000);
        }
    };

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

    // Calendar dot markers
    const orchestrasDays = useMemo(() => allEvents.filter(e => e.type === 'orchestras').map(e => parseDate(e.date)), [allEvents]);
    const upbeatDays = useMemo(() => allEvents.filter(e => e.type === 'upbeat').map(e => parseDate(e.date)), [allEvents]);
    const lessonsDays = useMemo(() => allEvents.filter(e => e.type === 'lessons').map(e => parseDate(e.date)), [allEvents]);
    const specialDays = useMemo(() => allEvents.filter(e => e.type === 'special').map(e => parseDate(e.date)), [allEvents]);

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

    // Subscriptions links compiled dynamically based on selectedFeed
    const feedUrl = `${origin}/api/calendar${selectedFeed !== 'all' ? `?feed=${selectedFeed}` : ''}`;
    const encodedFeedUrl = encodeURIComponent(feedUrl);

    const syncLinks = {
        google: `https://calendar.google.com/calendar/render?cid=${encodedFeedUrl}`,
        outlook: `https://outlook.live.com/calendar/0/addcalendar?url=${encodedFeedUrl}&name=KYO%20${selectedFeed === 'all' ? 'Events' : selectedFeed.toUpperCase()}`,
        apple: feedUrl.replace(/^https?:\/\//, 'webcal://')
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    } as const;

    const itemVariants = {
        hidden: { y: 15, opacity: 0 },
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
                        {visibleAnnouncements.length > 0 && (
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
                                    visibleAnnouncements.length % 2 === 0 
                                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" 
                                        : "grid-cols-1 max-w-4xl mx-auto"
                                )}>
                                    {visibleAnnouncements.map((announcement) => (
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
                                                        {announcement.excerpt || stripHtml(announcement.content).substring(0, 100) + '...'}
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
                                            onMonthChange={(newMonth) => {
                                                setMonth(newMonth);
                                                setShowAllMonthEvents(false);
                                            }}
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
                                                day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-primary/10 rounded-full transition-all flex items-center justify-center mx-auto cursor-pointer relative",
                                                day_today: "bg-accent text-accent-foreground font-bold",
                                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                                day_outside: "text-muted-foreground opacity-50",
                                                day_disabled: "text-muted-foreground opacity-50",
                                                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                                day_hidden: "invisible",
                                            }}
                                            modifiers={{
                                                orchestras: orchestrasDays,
                                                upbeat: upbeatDays,
                                                lessons: lessonsDays,
                                                special: specialDays,
                                            }}
                                            modifiersClassNames={{
                                                orchestras: "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full font-semibold text-primary",
                                                upbeat: "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-sky-500 after:rounded-full font-semibold text-sky-600",
                                                lessons: "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-violet-500 after:rounded-full font-semibold text-violet-600",
                                                special: "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-rose-500 after:rounded-full font-bold text-rose-600",
                                            }}
                                        />
                                    ) : (
                                        <Skeleton className="w-full h-[350px] rounded-2xl" />
                                    )}

                                    <div className="mt-8 px-4 pb-4 space-y-3 border-t border-primary/5 pt-6">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                            <span className="text-muted-foreground font-medium">Orchestras</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                                            <span className="text-muted-foreground font-medium">Upbeat! Program</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                                            <span className="text-muted-foreground font-medium">Lessons</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                            <span className="text-muted-foreground font-bold">Special Events & Concerts</span>
                                        </div>
                                        <div className="pt-4 flex gap-2">
                                            <div className="flex-grow">
                                                <Button 
                                                    variant="outline" 
                                                    onClick={() => setIsSubscribeDialogOpen(true)}
                                                    className="w-full rounded-2xl border-primary/20 hover:bg-primary hover:text-white transition-all py-6 font-bold text-xs sm:text-sm"
                                                >
                                                    <Share2 className="mr-2 h-4 w-4" />
                                                    Subscribe to Live Calendar
                                                </Button>
                                            </div>
                                            
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button 
                                                            variant="outline" 
                                                            size="icon"
                                                            className="rounded-2xl w-12 h-12 border-primary/20 text-primary hover:bg-primary/5 shrink-0"
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
                        <div className="lg:col-span-8 space-y-8">
                            
                            {/* Search & Filter Bar */}
                            <div className="bg-white/70 backdrop-blur-xl border border-primary/10 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                                {/* Category Tabs */}
                                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                    {(['all', 'orchestras', 'upbeat', 'lessons', 'special'] as const).map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setCategoryFilter(filter)}
                                            className={cn(
                                                "px-4 py-2 rounded-full text-xs font-bold capitalize transition-all border border-transparent",
                                                categoryFilter === filter
                                                    ? filter === 'all' ? "bg-primary text-white" :
                                                      filter === 'orchestras' ? "bg-primary text-white" :
                                                      filter === 'upbeat' ? "bg-sky-500 text-white" :
                                                      filter === 'lessons' ? "bg-violet-500 text-white" :
                                                      "bg-rose-500 text-white"
                                                    : "bg-slate-50 text-muted-foreground hover:bg-slate-100 hover:text-slate-900"
                                            )}
                                        >
                                            {filter === 'all' ? 'All events' : filter === 'upbeat' ? 'Upbeat!' : filter}
                                        </button>
                                    ))}
                                </div>

                                {/* Text Search Input */}
                                <div className="relative w-full md:w-[240px] shrink-0">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search events..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-full text-sm bg-slate-50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-primary/35 focus:bg-white transition-all font-light"
                                    />
                                </div>
                            </div>

                            <div className="flex items-end justify-between border-b border-primary/10 pb-8 pt-4">
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
                                        {!showAllMonthEvents && hiddenEventsCount > 0 
                                            ? `Showing ${displayedEvents.length} of ${filteredEventsForMonth.length} Events (Next 10 Days)` 
                                            : `${filteredEventsForMonth.length} ${filteredEventsForMonth.length === 1 ? 'Event' : 'Events'} listed`}
                                    </Badge>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={`${month?.toISOString()}-${categoryFilter}-${searchQuery}-${showAllMonthEvents}`}
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-1 gap-6"
                                >
                                    {isLoading ? (
                                        [1, 2, 3].map(i => <Skeleton key={i} className="w-full h-32 rounded-3xl" />)
                                    ) : displayedEvents.length > 0 ? (
                                        displayedEvents.map(event => (
                                            <motion.div key={event.id} variants={itemVariants}>
                                                <Card className="group relative overflow-hidden border-primary/5 bg-white transition-all duration-500 hover:shadow-2xl hover:border-primary/20 rounded-[2rem] cursor-pointer" onClick={() => handleDayClick(parseDate(event.date))}>
                                                    <div className={cn(
                                                        "absolute top-0 left-0 w-1.5 h-full transition-colors",
                                                        event.type === 'special' ? "bg-rose-500" :
                                                        event.type === 'orchestras' ? "bg-primary" :
                                                        event.type === 'upbeat' ? "bg-sky-500" :
                                                        event.type === 'lessons' ? "bg-violet-500" :
                                                        "bg-slate-300"
                                                    )} />
                                                    
                                                    <CardContent className="p-8">
                                                        <div className="flex flex-col md:flex-row gap-8 items-center">
                                                             {/* Date Circle Badge */}
                                                             <div className={cn(
                                                                "flex flex-col items-center justify-center w-24 h-24 rounded-3xl border transition-all duration-500 flex-shrink-0 shadow-sm",
                                                                event.type === 'special' ? "bg-rose-500 text-white border-rose-600" :
                                                                event.type === 'orchestras' ? "bg-primary/5 text-primary border-primary/10 group-hover:bg-primary group-hover:text-white" :
                                                                event.type === 'upbeat' ? "bg-sky-500/5 text-sky-600 border-sky-500/10 group-hover:bg-sky-500 group-hover:text-white" :
                                                                event.type === 'lessons' ? "bg-violet-500/5 text-violet-600 border-violet-500/10 group-hover:bg-violet-500 group-hover:text-white" :
                                                                "bg-slate-50 text-slate-700"
                                                            )}>
                                                                <span className="text-3xl font-bold font-headline">{format(parseDate(event.date), 'dd')}</span>
                                                                <span className="text-xs font-bold uppercase tracking-widest">{format(parseDate(event.date), 'EEE')}</span>
                                                            </div>

                                                            {/* Event Details */}
                                                            <div className="flex-grow space-y-4 text-center md:text-left">
                                                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                                                    <Badge className={cn(
                                                                        "px-3 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest border-none text-white",
                                                                        event.type === 'special' ? "bg-rose-500 hover:bg-rose-600" :
                                                                        event.type === 'orchestras' ? "bg-primary hover:bg-primary/95" :
                                                                        event.type === 'upbeat' ? "bg-sky-500 hover:bg-sky-600" :
                                                                        event.type === 'lessons' ? "bg-violet-500 hover:bg-violet-600" :
                                                                        "bg-slate-400"
                                                                    )}>
                                                                        {event.type}
                                                                    </Badge>
                                                                </div>
                                                                <h3 className="text-2xl font-headline font-bold group-hover:text-primary transition-colors leading-tight">{event.name}</h3>
                                                                
                                                                <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2 text-muted-foreground text-sm font-light">
                                                                    {event.time && (
                                                                        <div className="flex items-center gap-2">
                                                                            <Clock className="w-4 h-4 text-primary/60" />
                                                                            <span>{event.time}{event.endTime && ` — ${event.endTime}`}</span>
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
                                            <p className="text-muted-foreground text-lg font-light">No events match your criteria for {month ? format(month, 'MMMM yyyy') : 'this month'}.</p>
                                            <Button variant="link" onClick={() => { setCategoryFilter('all'); setSearchQuery(""); }} className="mt-4 text-primary font-bold">
                                                Clear Filters & Search
                                            </Button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Expand / Collapse 10-day filter controls */}
                            {!isLoading && hiddenEventsCount > 0 && !showAllMonthEvents && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="pt-4 flex flex-col items-center justify-center gap-2"
                                >
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAllMonthEvents(true)}
                                        className="rounded-full px-8 py-6 border-primary/20 bg-white hover:bg-primary hover:text-white text-primary font-bold text-sm transition-all duration-300 shadow-md hover:shadow-xl flex items-center gap-2 group"
                                    >
                                        <span>Show All {filteredEventsForMonth.length} Events for {month ? format(month, 'MMMM') : 'this month'} ({hiddenEventsCount} more)</span>
                                        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                    </Button>
                                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Showing next 10 days of scheduled events</p>
                                </motion.div>
                            )}

                            {!isLoading && showAllMonthEvents && filteredEventsForMonth.length > displayedEvents.length && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="pt-4 flex flex-col items-center justify-center"
                                >
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAllMonthEvents(false)}
                                        className="rounded-full px-8 py-6 border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-bold text-sm transition-all duration-300 shadow-sm flex items-center gap-2"
                                    >
                                        <span>Show Next 10 Days Only</span>
                                        <ChevronUp className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            )}
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
                                        
                                        <div 
                                            className="prose prose-slate max-w-none prose-headings:font-headline prose-headings:font-bold prose-p:font-light prose-p:leading-relaxed prose-a:text-primary prose-a:font-bold"
                                        >
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                                {selectedAnnouncement.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* Action items sidebar inside announcement dialog */}
                                    <div className="lg:col-span-4 space-y-6">
                                        <Card className="rounded-3xl border-primary/10 bg-slate-50 p-6">
                                            <CardHeader className="p-0 pb-4">
                                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Bulletin Details</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-0 space-y-4 text-xs">
                                                <div>
                                                    <p className="text-muted-foreground">Posted Date</p>
                                                    <p className="font-bold">{format(new Date(selectedAnnouncement.date), 'MMMM d, yyyy')}</p>
                                                </div>
                                                {selectedAnnouncement.link && (
                                                    <Button asChild className="w-full rounded-xl mt-4 font-bold">
                                                        <Link href={selectedAnnouncement.link} target={selectedAnnouncement.link.startsWith('http') ? '_blank' : undefined} rel={selectedAnnouncement.link.startsWith('http') ? 'noopener noreferrer' : undefined}>
                                                            Learn More
                                                            <ArrowRight className="ml-2 w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                                                    <div className="pt-2 border-t border-slate-200">
                                                        <p className="text-muted-foreground mb-2">Attachments</p>
                                                        <div className="space-y-1">
                                                            {selectedAnnouncement.attachments.map((att, i) => (
                                                                <a
                                                                    key={i}
                                                                    href={att.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center text-primary hover:underline truncate"
                                                                >
                                                                    <Paperclip className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                                                    <span className="truncate">{att.name}</span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Event Day Detail Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-primary p-8 text-white relative">
                        <DialogHeader>
                            <div className="flex items-center gap-2 text-white/70 mb-2">
                                <CalendarIcon className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Schedule Details</span>
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
                                                <Badge className={cn(
                                                    "mb-2 text-white border-none",
                                                    event.type === 'special' ? "bg-rose-500 hover:bg-rose-600" :
                                                    event.type === 'orchestras' ? "bg-primary hover:bg-primary/95" :
                                                    event.type === 'upbeat' ? "bg-sky-500 hover:bg-sky-600" :
                                                    event.type === 'lessons' ? "bg-violet-500 hover:bg-violet-600" :
                                                    "bg-slate-400"
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

            {/* Subscribe to Live Calendar Dialog */}
            <Dialog open={isSubscribeDialogOpen} onOpenChange={setIsSubscribeDialogOpen}>
                <DialogContent className="max-w-lg rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-primary p-8 text-white relative">
                        <div className="flex items-center gap-2 text-white/70 mb-2">
                            <Share2 className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Calendar Sync</span>
                        </div>
                        <DialogTitle className="text-3xl font-headline font-bold">Subscribe to Live Calendar</DialogTitle>
                        <p className="text-white/80 text-xs mt-1">Automatic real-time schedule updates directly in your preferred calendar app.</p>
                    </div>

                    <div className="p-6 bg-white space-y-6 max-h-[75vh] overflow-y-auto">
                        {/* Feed Selector */}
                        <div className="space-y-2">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Select Feed Channel:</p>
                            <div className="grid grid-cols-2 gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
                                {(['all', 'orchestras', 'upbeat', 'lessons'] as const).map((feedType) => (
                                    <button
                                        key={feedType}
                                        onClick={() => setSelectedFeed(feedType)}
                                        className={cn(
                                            "text-xs font-bold py-2 px-3 rounded-xl capitalize transition-all",
                                            selectedFeed === feedType 
                                                ? "bg-primary text-white shadow-sm" 
                                                : "text-muted-foreground hover:bg-white hover:text-slate-900"
                                        )}
                                    >
                                        {feedType === 'all' ? 'All Events' : feedType === 'upbeat' ? 'Upbeat!' : feedType}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sync Options */}
                        <div className="space-y-3">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">1-Click Subscriptions:</p>
                            
                            <Link 
                                href={syncLinks.google} 
                                target="_blank" 
                                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-primary/5 hover:border-primary/20 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 15l-5-5h3V9h4v4h3l-5 5z"/></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800 group-hover:text-primary transition-colors">Google Calendar</p>
                                        <p className="text-[11px] text-muted-foreground">Android, Gmail, Web</p>
                                    </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                            </Link>

                            <Link 
                                href={syncLinks.apple} 
                                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-primary/5 hover:border-primary/20 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#000" d="M17.05 20.28c-.98.95-2.05 1.61-3.14 1.61-1.04 0-1.42-.64-2.73-.64-1.32 0-1.78.63-2.73.63-1.05 0-2.22-.72-3.23-1.72-2.03-2.03-3.13-5.74-3.13-8.6 0-4.63 2.92-7.1 5.71-7.1.92 0 1.77.29 2.53.29.68 0 1.7-.35 2.76-.35 1.09 0 2.15.22 3.02.83-2.31 1.79-1.92 5.34.42 6.51-.9 2.13-2.06 4.31-3.25 5.54zM12.03 7.25c-.15-2.23 1.66-4.07 3.65-4.25.26 2.37-2.11 4.14-3.65 4.25z"/></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800 group-hover:text-primary transition-colors">Apple Calendar / iCloud</p>
                                        <p className="text-[11px] text-muted-foreground">iPhone, iPad, Mac Calendar</p>
                                    </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                            </Link>

                            <Link 
                                href={syncLinks.outlook} 
                                target="_blank" 
                                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-primary/5 hover:border-primary/20 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#0078d4" d="M16 1h-2v2h2V1zm-4 0h-2v2h2V1zM7 1H5v2h2V1zm13 4v14c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h1V1h2v2h2V1h2v2h2V1h2v2h1c1.1 0 2 .9 2 2zm-2 2H4v12h14V7zM6 9h2v2H6V9zm4 0h2v2h-2V9zm4 0h2v2h-2V9zm-8 4h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800 group-hover:text-primary transition-colors">Outlook / Office 365</p>
                                        <p className="text-[11px] text-muted-foreground">Windows, Outlook Web & Mobile</p>
                                    </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                            </Link>
                        </div>

                        {/* Manual Feed URL Copy & ICS Download */}
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={handleCopyFeedUrl}
                                    className="w-full sm:flex-1 rounded-xl text-xs font-bold py-5 border-slate-200 hover:border-primary/30"
                                >
                                    {copiedFeedUrl ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-500" />}
                                    {copiedFeedUrl ? 'Subscription Link Copied!' : 'Copy Feed URL (webcal)'}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => downloadCalendar(filteredEventsForMonth)}
                                    className="w-full sm:flex-1 rounded-xl text-xs font-bold py-5 border-slate-200 hover:border-primary/30 text-primary"
                                >
                                    <Download className="w-3.5 h-3.5 mr-1.5" />
                                    Download (.ics)
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Help / Guide Dialog */}
            <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
                <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-primary p-8 text-white relative">
                        <div className="flex items-center gap-2 text-white/70 mb-2">
                            <HelpCircle className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Guide</span>
                        </div>
                        <DialogTitle className="text-3xl font-headline font-bold">How Live Calendar Sync Works</DialogTitle>
                    </div>

                    <div className="p-8 bg-white space-y-6 max-h-[70vh] overflow-y-auto text-sm leading-relaxed text-slate-600 font-light">
                        <div className="space-y-3">
                            <h4 className="font-headline font-bold text-slate-900 text-base">Automatic Real-Time Updates</h4>
                            <p>
                                When you subscribe to an iCalendar (webcal) feed, your phone, computer, or calendar client automatically checks our schedule for new concerts, rehearsals, and changes.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-headline font-bold text-slate-900 text-base">Google Calendar Refresh Timing</h4>
                            <p>
                                Google Calendar caches webcal subscriptions and typically syncs updates every few hours. Apple Calendar and Outlook on desktop let you configure your refresh rate to every 15 minutes or hourly.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-headline font-bold text-slate-900 text-base">Feed Channels</h4>
                            <p>
                                You can choose to subscribe to <strong>All Events</strong>, or choose a specific feed tailored for <strong>Orchestras</strong>, <strong>Upbeat!</strong>, or <strong>Lessons</strong>.
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
