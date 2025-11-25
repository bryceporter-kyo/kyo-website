
"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Folder, ExternalLink, Pencil, ToggleLeft, ToggleRight, Users, DollarSign, Handshake, Cpu, Settings, Briefcase, FileText } from "lucide-react";
import { getBoard, getStaff } from "@/lib/staff";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getLinkById } from "@/lib/links";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import internalSectionsData from "@/lib/internal-sections.json";
import type { InternalSection } from "@/lib/internal-sections";

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
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-internal');
  const staff = getStaff();
  const board = getBoard();
  const internalSections: InternalSection[] = internalSectionsData.sections;
  // Simulate admin state. Replace with actual authentication check.
  const [isSiteAdmin, setIsSiteAdmin] = useState(true);

  return (
    <div>
      <PageHeader
        title="KYO Internal Resources"
        subtitle="This section is for internal staff, board, and volunteer use."
        image={headerImage}
      />
      <div className="container mx-auto py-4">
        <div className="flex items-center space-x-2 bg-secondary p-4 rounded-lg my-4">
            {isSiteAdmin ? <ToggleRight className="text-primary"/> : <ToggleLeft />}
            <Label htmlFor="admin-mode" className={isSiteAdmin ? "font-bold text-primary" : ""}>
                Site Admin View {isSiteAdmin ? "On" : "Off"}
            </Label>
            <Switch
                id="admin-mode"
                checked={isSiteAdmin}
                onCheckedChange={setIsSiteAdmin}
            />
            <span className="text-sm text-muted-foreground">(This is a demo toggle. Replace with real auth.)</span>
        </div>
      </div>
      <section className="container mx-auto pt-0">
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
                                {isSiteAdmin && (
                                    <Button asChild variant="ghost" size="icon" className="absolute top-2 right-2">
                                        <Link href={`/admin/internal-sections?edit=${section.id}`}>
                                            <Pencil />
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
                                            <Folder className="mr-2"/>
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
                                        <ExternalLink className="mr-2 h-4 w-4"/>
                                        <span>{linkInfo.title}</span>
                                    </Link>
                                </Button>
                                {isSiteAdmin && (
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
      </section>
    </div>
  );
}
