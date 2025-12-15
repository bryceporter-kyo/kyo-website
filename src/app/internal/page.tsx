
"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useImages } from "@/components/providers/ImageProvider";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Folder, ExternalLink as ExternalLinkIcon, Pencil, Users, DollarSign, Handshake, Cpu, Settings, Briefcase, FileText, Loader2, Lock } from "lucide-react";
import { fetchStaffFromFirebase, fetchBoardFromFirebase } from "@/lib/staff";
import type { StaffMember, BoardMember } from "@/lib/staff";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

    // Helper function to get link by ID
    const getLinkById = (linkId: string): LinkType | undefined => {
        return allLinks.find(link => link.id === linkId);
    };

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
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Loading resources...</span>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {internalSections.map(section => {
                                const driveLink = getLinkById(section.linkId);
                                const Icon = iconMap[section.icon] || Folder;
                                return (
                                    <div key={section.id} className="relative">
                                        <Card className="flex flex-col h-full">
                                            <CardHeader className="h-28 flex flex-col justify-start">
                                                <div className="flex items-start gap-4">
                                                    <Icon className="w-8 h-8 text-primary flex-shrink-0" />
                                                    <CardTitle className="font-headline text-xl">{section.title}</CardTitle>
                                                </div>
                                                {isInternalEditor && (
                                                    <Button asChild variant="ghost" size="icon" className="absolute top-2 right-2">
                                                        <Link href={`/admin/internal-sections?edit=${section.id}`}>
                                                            <Pencil className="h-4 w-4" />
                                                            <span className="sr-only">Edit Section</span>
                                                        </Link>
                                                    </Button>
                                                )}
                                            </CardHeader>
                                            <CardContent className="flex-grow space-y-2">
                                                <div>
                                                    <p className="text-sm font-semibold text-muted-foreground">Managed by:</p>
                                                    <p className="text-sm">{section.manager}</p>
                                                    <a href={`mailto:${section.email}`} className="text-sm text-primary hover:underline">{section.email}</a>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex gap-2">
                                                {driveLink && (
                                                    <Button asChild variant="outline" className="w-full">
                                                        <Link href={driveLink.url} target="_blank" rel="noopener noreferrer">
                                                            <Folder className="mr-2 h-4 w-4"/>
                                                            View Drive Folder
                                                        </Link>
                                                    </Button>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    </div>
                                )
                            })}
                        </div>

                        <Card className="mt-12">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Staff & Board Directory</CardTitle>
                                <CardDescription>Contact information for internal personnel.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Email</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {staff.map(person => (
                                            <TableRow key={person.id}>
                                                <TableCell className="font-medium">{person.name}</TableCell>
                                                <TableCell>{person.title}</TableCell>
                                                <TableCell>
                                                    <a href={`mailto:${person.email}`} className="text-primary hover:underline">{person.email}</a>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {board.map(person => (
                                            <TableRow key={person.id}>
                                                <TableCell className="font-medium">{person.name}</TableCell>
                                                <TableCell>{person.title}</TableCell>
                                                <TableCell>
                                                     <a href={`mailto:${person.email}`} className="text-primary hover:underline">{person.email}</a>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                         <Card className="mt-12">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Quick Links</CardTitle>
                                <CardDescription>Important documents and resources.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {externalLinks.map(linkInfo => {
                                        const link = getLinkById(linkInfo.linkId);
                                        return link ? (
                                            <div key={link.id} className="relative group">
                                                <Button asChild variant="ghost" className="justify-start w-full text-left">
                                                    <Link href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                                        <ExternalLinkIcon className="mr-2 h-4 w-4"/>
                                                        <span>{linkInfo.title}</span>
                                                    </Link>
                                                </Button>
                                                {isInternalEditor && (
                                                     <Button asChild variant="ghost" size="icon" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link href={`/admin/links?edit=${link.id}`}>
                                                            <Pencil className="h-4 w-4" />
                                                            <span className="sr-only">Edit Link</span>
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
