
"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useImages } from "@/components/providers/ImageProvider";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Folder, ExternalLink as ExternalLinkIcon, Pencil, Users, DollarSign, Handshake, Cpu, Settings, Briefcase, FileText, Loader2, Lock, Search, Copy, Check, Mail } from "lucide-react";
import { fetchStaffFromFirebase, fetchBoardFromFirebase } from "@/lib/staff";
import type { StaffMember, BoardMember } from "@/lib/staff";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fetchLinksFromFirebase } from "@/lib/links";
import type { ExternalLink as LinkType } from "@/lib/links";
import { fetchInternalSectionsFromFirebase } from "@/lib/internal-sections";
import type { InternalSection } from "@/lib/internal-sections";
import { useAuth } from "@/hooks/use-auth";
import { getUserRolesByEmail } from "@/lib/users";
import AuthForm from "@/components/auth/AuthForm";

const iconMap: { [key: string]: React.ElementType } = {
    Users,
    DollarSign,
    Handshake,
    Cpu,
    Settings,
    Briefcase,
    FileText,
};

const externalLinks = [
    { title: "CEC One-time Donation", linkId: "internal-link-cec-onetime" },
    { title: "CEC Recurring Donation", linkId: "internal-link-cec-recurring" },
    { title: "New Director Form", linkId: "internal-link-new-director" },
    { title: "KYO By-Laws", linkId: "internal-link-bylaws" },
    { title: "HR Policy Manual", linkId: "internal-link-hr-policy" },
    { title: "New Volunteer Form", linkId: "internal-link-new-volunteer" },
    { title: "KYO Tech Stack", linkId: "internal-link-tech-stack" },
    { title: "Fees & Bursaries", linkId: "internal-link-fees-bursaries" },
    { title: "Program Registration", linkId: "internal-link-program-registration" },
    { title: "Program Offerings", linkId: "internal-link-program-offerings" },
    { title: "2024-2025 Budget", linkId: "internal-link-budget" }
]

export default function InternalPage() {
    const { getImage } = useImages();
    const headerImage = getImage('page-header-internal');
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [board, setBoard] = useState<BoardMember[]>([]);
    const [internalSections, setInternalSections] = useState<InternalSection[]>([]);
    const [allLinks, setAllLinks] = useState<LinkType[]>([]);
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
                const [sectionsData, staffData, boardData, linksData] = await Promise.all([
                    fetchInternalSectionsFromFirebase(),
                    fetchStaffFromFirebase(),
                    fetchBoardFromFirebase(),
                    fetchLinksFromFirebase()
                ]);
                setInternalSections(sectionsData);
                setStaff(staffData);
                setBoard(boardData);
                setAllLinks(linksData);
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

    const filteredLinks = externalLinks.filter(l => 
        l.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            
            <section className="container mx-auto py-8">
                <div className="mb-8 flex items-center gap-4 max-w-xl mx-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search resources, links, or directory..." 
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Loading resources...</span>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredSections.map(section => {
                                const driveLink = getLinkById(section.linkId);
                                const Icon = iconMap[section.icon] || Folder;
                                return (
                                    <Card key={section.id} className="relative group transition-all hover:border-primary/50">
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

                        <Card className="mt-8">
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
                                                        <TableCell className="font-medium">{person.name}</TableCell>
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
                                                        <TableCell className="font-medium">{person.name}</TableCell>
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

                         <Card className="mt-8">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Quick Links</CardTitle>
                                <CardDescription>Important documents and resources.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {filteredLinks.length === 0 ? (
                                        <p className="col-span-full text-center py-4 text-muted-foreground">No links match your search.</p>
                                    ) : filteredLinks.map(linkInfo => {
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
                                                     <Button asChild variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link href={`/admin/links?edit=${link.id}`}>
                                                            <Pencil className="h-3 w-3" />
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        ) : null
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </section>
        </div>
    );
}
