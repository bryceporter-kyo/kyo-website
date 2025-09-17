

import PageHeader from "@/components/shared/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Folder, Users, DollarSign, Handshake, Cpu, Settings, Briefcase, FileText, ExternalLink, Mail } from "lucide-react";
import { getBoard, getStaff } from "@/lib/staff";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getLinkById } from "@/lib/links";

const internalSections = [
    {
        title: "Board of Directors",
        icon: Users,
        manager: "Bryce Porter",
        email: "bryce.porter@thekyo.ca",
        linkId: "internal-drive-board"
    },
    {
        title: "Business & Finance",
        icon: DollarSign,
        manager: "Bryce Porter",
        email: "bryce.porter@thekyo.ca",
        linkId: "internal-drive-finance"
    },
    {
        title: "Community Engagement",
        icon: Handshake,
        manager: "Joy Simmonds",
        email: "joy.simmonds@thekyo.ca",
        linkId: "internal-drive-community"
    },
    {
        title: "IT and Data",
        icon: Cpu,
        manager: "IT Admin",
        email: "it-admin@thekyo.ca",
        linkId: "internal-drive-it"
    },
    {
        title: "Operations",
        icon: Settings,
        manager: "Carolyn Hoy",
        email: "carolyn.hoy@thekyo.ca",
        linkId: "internal-drive-operations"
    },
    {
        title: "Programming",
        icon: Briefcase,
        manager: "Colin McMahon",
        email: "colin.mcmahon@thekyo.ca",
        linkId: "internal-drive-programming"
    },
    {
        title: "HR & Compliance",
        icon: Users,
        manager: "HR Committee",
        email: "hr-committee@thekyo.ca",
        linkId: "internal-drive-hr"
    },
    {
        title: "Templates",
        icon: FileText,
        manager: "IT Admin",
        email: "it-admin@thekyo.ca",
        linkId: "internal-drive-templates"
    }
];

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
  return (
    <div>
      <PageHeader
        title="KYO Internal Resources"
        subtitle="This section is for internal staff, board, and volunteer use."
        image={headerImage}
      />
      <section className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {internalSections.map(section => {
                const driveLink = getLinkById(section.linkId);
                return (
                    <Card key={section.title} className="flex flex-col">
                        <CardHeader className="h-28 flex flex-col justify-start">
                            <div className="flex items-start gap-4">
                                <section.icon className="w-8 h-8 text-primary flex-shrink-0" />
                                <CardTitle className="font-headline text-xl">{section.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground">Managed by:</p>
                                <p className="text-sm">{section.manager}</p>
                                <a href={`mailto:${section.email}`} className="text-sm text-primary hover:underline">{section.email}</a>
                            </div>
                        </CardContent>
                        <CardFooter>
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
                            <Button asChild variant="ghost" className="justify-start" key={link.id}>
                                <Link href={link.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2"/>
                                    {linkInfo.title}
                                </Link>
                            </Button>
                        ) : null
                    })}
                </div>
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
