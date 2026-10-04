
"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useImages } from "@/components/providers/ImageProvider";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Folder, ExternalLink as ExternalLinkIcon, Pencil, Users, DollarSign, Handshake, Cpu, Settings, Briefcase, FileText, Loader2, Lock, Search, Copy, Check, Mail, Calendar } from "lucide-react";
import { fetchStaffFromFirebase, fetchBoardFromFirebase } from "@/lib/staff";
import type { StaffMember, BoardMember } from "@/lib/staff";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fetchLinksFromFirebase } from "@/lib/links";
import type { ExternalLink as LinkType } from "@/lib/links";
import { fetchInternalSectionsFromFirebase } from "@/lib/internal-sections";
import type { InternalSection } from "@/lib/internal-sections";
import { useAuth } from "@/hooks/use-auth";
import { getUserRolesByEmail } from "@/lib/users";
import AuthForm from "@/components/auth/AuthForm";
import { fetchEventsFromFirebase, Event } from "@/lib/events";
import { fetchAnnouncementsFromFirebase, Announcement } from "@/lib/announcements";
import { format, isAfter, isBefore, addDays } from "date-fns";

const iconMap: { [key: string]: React.ElementType } = {
    Users,
    DollarSign,
    Handshake,
    Cpu,
    Settings,
    Briefcase,
    FileText,
};

const linkGroups = [
    {
        name: "Finance & Donations",
        links: [
            { title: "CEC One-time Donation", linkId: "internal-link-cec-onetime" },
            { title: "CEC Recurring Donation", linkId: "internal-link-cec-recurring" },
            { title: "2024-2025 Budget", linkId: "internal-link-budget" }
        ]
    },
    {
        name: "HR & Governance",
        links: [
            { title: "HR Policy Manual", linkId: "internal-link-hr-policy" },
            { title: "KYO By-Laws", linkId: "internal-link-bylaws" },
            { title: "New Director Form", linkId: "internal-link-new-director" },
            { title: "New Volunteer Form", linkId: "internal-link-new-volunteer" }
        ]
    },
    {
        name: "Programs",
        links: [
            { title: "Program Offerings", linkId: "internal-link-program-offerings" },
            { title: "Program Registration", linkId: "internal-link-program-registration" },
            { title: "Fees & Bursaries", linkId: "internal-link-fees-bursaries" }
        ]
    },
    {
        name: "IT & Tech",
        links: [
            { title: "KYO Tech Stack", linkId: "internal-link-tech-stack" }
        ]
    }
];

export default function InternalPage() {
    const { getImage } = useImages();
    const headerImage = getImage('page-header-internal');
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [board, setBoard] = useState<BoardMember[]>([]);
    const [internalSections, setInternalSections] = useState<InternalSection[]>([]);
    const [allLinks, setAllLinks] = useState<LinkType[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
    
    // Auth & Permissions
    const { user, loading: authLoading } = useAuth();
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [checkingRoles, setCheckingRoles] = useState(true);

    useEffect(() => {
        async function checkPermissions() {
            if (user?.email) {
                try {
                    const roles = await getUserRolesByEmail(user.email);
                    setUserRoles(roles);
                } catch (e) {
                    console.error("Failed to fetch roles", e);
                }
            }
            setCheckingRoles(false);
        }
        
        if (!authLoading) {
            checkPermissions();
        }
    }, [user, authLoading]);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [sectionsData, staffData, boardData, linksData, announcementsData] = await Promise.all([
                    fetchInternalSectionsFromFirebase(),
                    fetchStaffFromFirebase(),
                    fetchBoardFromFirebase(),
                    fetchLinksFromFirebase(),
                    fetchAnnouncementsFromFirebase()
                ]);

                let eventsData: Event[] = [];
                try {
                    const calendarRes = await fetch('/api/calendar/events');
                    if (calendarRes.ok) {
                        const calJson = await calendarRes.json();
                        eventsData = calJson.events || [];
                    } else {
                        eventsData = await fetchEventsFromFirebase();
                    }
                } catch {
                    eventsData = await fetchEventsFromFirebase();
                }
                
                // Filter events for next 30 days
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const thirtyDaysFromNow = addDays(now, 30);
                
                const upcoming = eventsData.filter(event => {
                    const eventDate = new Date(event.date); // Event dates are usually YYYY-MM-DD
                    eventDate.setHours(0, 0, 0, 0);
                    return !isBefore(eventDate, now) && !isAfter(eventDate, thirtyDaysFromNow);
                });

                setInternalSections(sectionsData);
                setStaff(staffData);
                setBoard(boardData);
                setAllLinks(linksData);
                setUpcomingEvents(upcoming);
                setAnnouncements(announcementsData);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        // Only load data if user has access
        if (!checkingRoles && (userRoles.includes('Internal Viewer') || userRoles.includes('Internal Editor') || userRoles.includes('Website Editor'))) {
             loadData();
        }
    }, [checkingRoles, userRoles]);

    const getLinkById = (linkId: string): LinkType | undefined => {
        return allLinks.find(link => link.id === linkId);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedEmail(text);
        setTimeout(() => setCopiedEmail(null), 2000);
    };

    const filteredSections = internalSections.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.manager.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredLinkGroups = linkGroups.map(group => ({
        ...group,
        links: group.links.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
    })).filter(group => group.links.length > 0);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const filteredStaff = staff.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredBoard = board.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (authLoading || checkingRoles) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto py-12 flex flex-col items-center justify-center min-h-[50vh]">
                <AuthForm 
                    title="Internal Access" 
                    description="Please sign in to view internal resources."
                    redirectUrl="" // Empty string means stay on current page (which will re-render with user logged in)
                />
            </div>
        );
    }

    const isInternalViewer = userRoles.includes('Internal Viewer') || userRoles.includes('Internal Editor') || userRoles.includes('Website Editor');
    const isInternalEditor = userRoles.includes('Internal Editor') || userRoles.includes('Website Editor');

    if (!isInternalViewer) {
        return (
            <div className="container mx-auto py-12 text-center">
                <Lock className="h-16 w-16 mx-auto text-destructive mb-4" />
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
                <p className="text-sm text-muted-foreground mt-2">Contact an administrator if you believe this is an error.</p>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="KYO Internal Resources"
                subtitle="This section is for internal staff, board, and volunteer use."
                image={headerImage}
            />
            
            <section className="bg-slate-50 border-b border-slate-100 py-6 mb-8">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* User Context & Admin Portal */}
                        <div className="flex items-center gap-4">
                            <div className="text-sm">
                                <span className="text-slate-500">Logged in as </span>
                                <span className="font-semibold text-slate-900">{user.email}</span>
                            </div>
                            {isInternalEditor && (
                                <Button asChild variant="default" size="sm" className="rounded-full shadow-sm">
                                    <Link href="/admin">
                                        <Settings className="w-4 h-4 mr-2" /> Admin Dashboard
                                    </Link>
                                </Button>
                            )}
                        </div>

                        {/* Hero Search */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Search resources, links, or directory..." 
                                className="pl-12 py-6 rounded-full bg-white border-slate-200 shadow-sm focus-visible:ring-primary/20 text-base"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 pb-16 space-y-12">

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Loading resources...</span>
                    </div>
                ) : (
                    <>
                        {/* Announcements & Key Dates Widgets */}
                        {!searchQuery && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {/* Announcements */}
                                <Card className="md:col-span-2 rounded-[1.5rem] bg-white border-slate-100 shadow-sm overflow-hidden">
                                    <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
                                        <CardTitle className="font-headline text-xl flex items-center text-primary">
                                            <FileText className="w-5 h-5 mr-2" /> Notice Board
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {announcements.length === 0 ? (
                                            <div className="p-6 text-slate-500 text-center">No current announcements.</div>
                                        ) : (
                                            <div className="divide-y divide-slate-100">
                                                {announcements.map(announcement => (
                                                    <div key={announcement.id} className="p-6 hover:bg-slate-50 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-lg text-slate-900">{announcement.title}</h4>
                                                            <span className="text-xs font-semibold text-primary/70 bg-primary/5 px-2 py-1 rounded-full uppercase tracking-wide">
                                                                {announcement.date}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-600 text-sm leading-relaxed">{announcement.excerpt || announcement.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Key Dates */}
                                <Card className="rounded-[1.5rem] bg-white border-slate-100 shadow-sm overflow-hidden">
                                    <CardHeader className="bg-slate-50 pb-4 border-b border-slate-100">
                                        <CardTitle className="font-headline text-xl flex items-center text-slate-700">
                                            <Calendar className="w-5 h-5 mr-2" /> Upcoming 30 Days
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {upcomingEvents.length === 0 ? (
                                            <div className="p-6 text-slate-500 text-center text-sm">No upcoming events in the next 30 days.</div>
                                        ) : (
                                            <div className="divide-y divide-slate-100">
                                                {upcomingEvents.map(event => (
                                                    <div key={event.id} className="p-4 flex gap-4 items-start">
                                                        <div className="text-center w-12 shrink-0">
                                                            <div className="text-[10px] uppercase font-bold text-primary tracking-widest">{format(new Date(event.date), 'MMM')}</div>
                                                            <div className="text-xl font-headline font-bold text-slate-900">{format(new Date(event.date), 'd')}</div>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900 text-sm">{event.name}</div>
                                                            {(event.time || event.location) && (
                                                                <div className="text-xs text-slate-500 mt-1">
                                                                    {event.time && <span>{event.time}</span>}
                                                                    {event.time && event.location && <span className="mx-1">•</span>}
                                                                    {event.location && <span>{event.location}</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredSections.map(section => {
                                const driveLink = getLinkById(section.linkId);
                                const Icon = iconMap[section.icon] || Folder;
                                return (
                                    <Card key={section.id} className="relative group transition-all bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 rounded-[1.5rem]">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <CardTitle className="font-headline text-lg">{section.title}</CardTitle>
                                            </div>
                                            {isInternalEditor && (
                                                <Button asChild variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link href={`/admin/internal-sections?edit=${section.id}`}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </CardHeader>
                                        <CardContent className="pb-4">
                                            <div className="flex items-center justify-between group/manager">
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Manager</p>
                                                    <p className="text-sm font-medium">{section.manager}</p>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(section.email)}>
                                                        {copiedEmail === section.email ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                        <a href={`mailto:${section.email}`}>
                                                            <Mail className="h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-0">
                                            {driveLink && (
                                                <Button asChild variant="outline" size="sm" className="w-full h-8 text-xs">
                                                    <Link href={driveLink.url} target="_blank" rel="noopener noreferrer">
                                                        <Folder className="mr-2 h-3 w-3"/>
                                                        View Folder
                                                    </Link>
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                )
                            })}
                        </div>

                        <Card className="mt-8 rounded-[1.5rem] shadow-sm border-slate-100">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="font-headline text-2xl">Internal Directory</CardTitle>
                                        <CardDescription>Contact information for staff and board.</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="h-6">
                                        {filteredStaff.length + filteredBoard.length} Members
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="staff" className="w-full">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="staff">Staff ({filteredStaff.length})</TabsTrigger>
                                        <TabsTrigger value="board">Board ({filteredBoard.length})</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="staff">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead className="text-right">Contact</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredStaff.length === 0 ? (
                                                    <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No staff members match your search.</TableCell></TableRow>
                                                ) : filteredStaff.map(person => (
                                                    <TableRow key={person.id}>
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8 bg-primary/10 border border-primary/20">
                                                                    {person.image ? <AvatarImage src={person.image} /> : null}
                                                                    <AvatarFallback className="text-primary text-xs font-semibold">{getInitials(person.name)}</AvatarFallback>
                                                                </Avatar>
                                                                {person.name}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{person.title}</TableCell>
                                                        <TableCell className="text-right space-x-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(person.email)}>
                                                                {copiedEmail === person.email ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                                <a href={`mailto:${person.email}`}>
                                                                    <Mail className="h-3 w-3" />
                                                                </a>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TabsContent>
                                    <TabsContent value="board">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead className="text-right">Contact</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredBoard.length === 0 ? (
                                                    <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No board members match your search.</TableCell></TableRow>
                                                ) : filteredBoard.map(person => (
                                                    <TableRow key={person.id}>
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8 bg-primary/10 border border-primary/20">
                                                                    {person.image ? <AvatarImage src={person.image} /> : null}
                                                                    <AvatarFallback className="text-primary text-xs font-semibold">{getInitials(person.name)}</AvatarFallback>
                                                                </Avatar>
                                                                {person.name}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{person.title}</TableCell>
                                                        <TableCell className="text-right space-x-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(person.email)}>
                                                                {copiedEmail === person.email ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                                <a href={`mailto:${person.email}`}>
                                                                    <Mail className="h-3 w-3" />
                                                                </a>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                         <Card className="mt-8 rounded-[1.5rem] shadow-sm border-slate-100">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Quick Links</CardTitle>
                                <CardDescription>Important documents and resources.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {filteredLinkGroups.length === 0 ? (
                                    <p className="text-center py-4 text-muted-foreground">No links match your search.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {filteredLinkGroups.map(group => (
                                            <div key={group.name}>
                                                <h4 className="text-sm font-bold tracking-widest uppercase text-slate-500 mb-3">{group.name}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                    {group.links.map(linkInfo => {
                                                        const link = getLinkById(linkInfo.linkId);
                                                        return link ? (
                                                            <div key={link.id} className="relative group">
                                                                <Button asChild variant="ghost" className="justify-between w-full text-left h-auto py-3 px-3 hover:bg-primary/5 border border-transparent hover:border-primary/20">
                                                                    <Link href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                                                                        <div className="flex items-center flex-1 overflow-hidden">
                                                                            <ExternalLinkIcon className="mr-3 h-4 w-4 text-primary shrink-0"/>
                                                                            <span className="truncate text-sm font-medium">{linkInfo.title}</span>
                                                                        </div>
                                                                    </Link>
                                                                </Button>
                                                                {isInternalEditor && (
                                                                     <Button asChild variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white">
                                                                        <Link href={`/admin/links?edit=${link.id}`}>
                                                                            <Pencil className="h-3 w-3 text-primary" />
                                                                        </Link>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        ) : null
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </section>
        </div>
    );
}
