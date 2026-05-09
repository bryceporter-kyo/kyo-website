
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil, Trash2, UserPlus, X, Loader2, Download, Upload } from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import { 
    fetchStaffFromFirebase, 
    fetchBoardFromFirebase,
    addStaffToFirebase,
    addBoardToFirebase,
    updateStaffInFirebase,
    updateBoardInFirebase,
    deleteStaffFromFirebase,
    deleteBoardFromFirebase,
    sortTeamMembers
} from "@/lib/staff";
import type { StaffMember, BoardMember } from "@/lib/staff";
import { addUserToFirebase, UserRole } from "@/lib/users";
import { uploadImage } from "@/lib/image-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const memberSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  title: z.string().min(3, "Title must be at least 3 characters."),
  email: z.string().email("Please enter a valid email address."),
  order: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().optional()),
  bio: z.string().optional(),
  image: z.any().optional(),
  type: z.enum(["staff", "board"]),
  links: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    youtube: z.string().optional(),
    spotify: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
});

type MemberWithId = (StaffMember | BoardMember) & { type: 'staff' | 'board' };

export default function TeamAdminPage() {
    const { toast } = useToast();
    const [staff, setStaff] = React.useState<StaffMember[]>([]);
    const [board, setBoard] = React.useState<BoardMember[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [editingMember, setEditingMember] = React.useState<MemberWithId | null>(null);
    const [saveStatus, setSaveStatus] = React.useState<"idle" | "uploading" | "saving">("idle");

    // Load data from Firebase
    React.useEffect(() => {
        const loadData = async () => {
            try {
                const [staffData, boardData] = await Promise.all([
                    fetchStaffFromFirebase(),
                    fetchBoardFromFirebase()
                ]);
                setStaff(staffData);
                setBoard(boardData);
            } catch (error) {
                console.error('Error loading team data:', error);
                toast({
                    title: "Error",
                    description: "Failed to load team data from database.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [toast]);

    const sortedStaff = sortTeamMembers(staff);
    const sortedBoard = sortTeamMembers(board);

    const allMembers: MemberWithId[] = [
        ...sortedStaff.map(s => ({...s, type: 'staff' as const})), 
        ...sortedBoard.map(b => ({...b, type: 'board' as const}))
    ];

    const form = useForm<z.infer<typeof memberSchema>>({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            name: "",
            title: "",
            email: "",
            order: undefined,
            bio: "",
            image: "",
            type: "staff",
            links: {
                facebook: "",
                instagram: "",
                linkedin: "",
                youtube: "",
                spotify: "",
                website: "",
            }
        },
    });

    const imageField = form.register("image");
    
    React.useEffect(() => {
        if (editingMember) {
            form.reset({
                name: editingMember.name,
                title: editingMember.title,
                email: editingMember.email,
                type: editingMember.type,
                order: editingMember.order,
                bio: 'bio' in editingMember ? editingMember.bio : '',
                image: undefined,
                links: {
                    facebook: editingMember.links?.facebook || "",
                    instagram: editingMember.links?.instagram || "",
                    linkedin: editingMember.links?.linkedin || "",
                    youtube: editingMember.links?.youtube || "",
                    spotify: editingMember.links?.spotify || "",
                    website: editingMember.links?.website || "",
                }
            });
        } else {
            form.reset({
                name: "",
                title: "",
                email: "",
                bio: "",
                image: undefined,
                type: "staff",
                links: {
                    facebook: "",
                    instagram: "",
                    linkedin: "",
                    youtube: "",
                    spotify: "",
                    website: "",
                }
            });
        }
    }, [editingMember, form]);

    async function onSubmit(values: z.infer<typeof memberSchema>) {
        setIsSaving(true);
        setSaveStatus("uploading");
        try {
            let imageUrl = editingMember && 'image' in editingMember ? editingMember.image : '';

            if (values.image && values.image.length > 0 && values.image[0] instanceof File) {
                const file = values.image[0];
                const imageId = `team_${Date.now()}`;
                imageUrl = await uploadImage(file, imageId);
            }

            setSaveStatus("saving");
            const memberData = {
                name: values.name,
                title: values.title,
                email: values.email,
                order: values.order,
                bio: values.bio || '',
                image: imageUrl || '',
                links: values.links,
            };

            if (editingMember) {
                // Update existing member
                if (editingMember.type === 'staff') {
                    await updateStaffInFirebase(editingMember.id, memberData);
                    setStaff(staff.map(s => s.id === editingMember.id ? { ...s, ...memberData } : s));
                } else {
                    await updateBoardInFirebase(editingMember.id, memberData);
                    setBoard(board.map(b => b.id === editingMember.id ? { ...b, ...memberData } : b));
                }
                toast({
                    title: "Member Updated!",
                    description: `"${values.name}" has been updated in the database.`,
                });
            } else {
                // Create new member
                if (values.type === 'staff') {
                    const newStaff = await addStaffToFirebase(memberData);
                    setStaff([...staff, newStaff]);
                } else {
                    const newBoard = await addBoardToFirebase(memberData);
                    setBoard([...board, newBoard]);
                }
                toast({
                    title: "Member Created!",
                    description: `"${values.name}" has been added to the database.`,
                });
            }
            setEditingMember(null);
            form.reset();
        } catch (error: any) {
            console.error('Error saving member:', error);
            
            let errorMessage = "Failed to save member. Please try again.";
            
            if (error?.code === 'storage/unauthorized') {
                errorMessage = "You don't have permission to upload images. Please contact an administrator.";
            } else if (error?.code === 'storage/quota-exceeded') {
                errorMessage = "Storage quota exceeded. Cannot upload more images.";
            } else if (error?.code === 'permission-denied') {
                errorMessage = "You don't have permission to modify this data.";
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
            setSaveStatus("idle");
        }
    }
    
    async function handleDelete(member: MemberWithId) {
        try {
            if (member.type === 'staff') {
                await deleteStaffFromFirebase(member.id);
                setStaff(staff.filter(s => s.id !== member.id));
            } else {
                await deleteBoardFromFirebase(member.id);
                setBoard(board.filter(b => b.id !== member.id));
            }
            toast({
                title: "Member Deleted",
                description: `"${member.name}" has been deleted from the database.`,
                variant: "destructive",
            });
        } catch (error) {
            console.error('Error deleting member:', error);
            toast({
                title: "Error",
                description: "Failed to delete member. Please try again.",
                variant: "destructive",
            });
        }
    }

    const handleEditClick = (member: MemberWithId) => {
        setEditingMember(member);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    const handleDownloadCsvTemplate = () => {
        const headers = ["Name", "Type", "Title", "Email", "Permission Settings", "Biography", "Facebook", "Instagram", "LinkedIn", "YouTube", "Spotify", "Website"];
        const exampleRow = ["Jane Doe", "staff", "Artistic Director", "jane.doe@thekyo.ca", "Website Editor", "Jane is a dedicated musician...", "https://facebook.com/jane", "", "https://linkedin.com/in/jane", "", "", "https://janedoe.com"];
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + exampleRow.map(val => `"${val}"`).join(",");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "team_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUploadCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                let successCount = 0;
                let errorCount = 0;

                for (const row of results.data as any[]) {
                    try {
                        const name = row.Name || row.name;
                        const type = (row.Type || row.type || "staff").toLowerCase();
                        const title = row.Title || row.title;
                        const email = row.Email || row.email;
                        const permissions = row["Permission Settings"] || row.permissions;
                        const bio = row.Biography || row.biography || row.bio;
                        
                        const links = {
                            facebook: row.Facebook || row.facebook || "",
                            instagram: row.Instagram || row.instagram || "",
                            linkedin: row.LinkedIn || row.linkedin || "",
                            youtube: row.YouTube || row.youtube || "",
                            spotify: row.Spotify || row.spotify || "",
                            website: row.Website || row.website || "",
                        };

                        if (!name || !title || !email) {
                            console.error("Missing required fields for row:", row);
                            errorCount++;
                            continue;
                        }

                        const memberData = {
                            name,
                            title,
                            email,
                            bio: bio || "",
                            image: "", // Placeholder, can be updated manually
                            links,
                        };

                        // 1. Add to Staff or Board
                        if (type === 'board') {
                            const newBoard = await addBoardToFirebase(memberData);
                            setBoard(prev => [...prev, newBoard]);
                        } else {
                            const newStaff = await addStaffToFirebase(memberData);
                            setStaff(prev => [...prev, newStaff]);
                        }

                        // 2. Add to Users if permissions provided
                        if (permissions) {
                            const rolesArray = permissions.split(',').map((r: string) => r.trim()) as UserRole[];
                            if (rolesArray.length > 0) {
                                await addUserToFirebase({
                                    name,
                                    email,
                                    roles: rolesArray
                                });
                            }
                        }

                        successCount++;
                    } catch (error) {
                        console.error("Error importing team member from CSV:", error);
                        errorCount++;
                    }
                }

                setIsLoading(false);
                toast({
                    title: "Import Complete",
                    description: `Successfully imported ${successCount} members.${errorCount > 0 ? ` Failed to import ${errorCount} members.` : ""}`,
                    variant: errorCount > 0 ? "destructive" : "default",
                });
                event.target.value = "";
            },
            error: (error) => {
                console.error("CSV Parse Error:", error);
                setIsLoading(false);
                toast({
                    title: "Import Failed",
                    description: "Failed to parse CSV file.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <div className="container mx-auto py-12">
            <div className="mb-8 flex justify-between items-center">
                <Button asChild variant="outline">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Admin
                    </Link>
                </Button>
            </div>

            <Card className="mb-12">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Bulk Team Management</CardTitle>
                    <CardDescription>Upload or download a CSV to manage staff and board members in bulk.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Use the template to bulk-add members with bios and social links.</p>
                        <p className="text-xs text-primary font-medium">Adding "Permission Settings" will also create an admin user account for the member.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleDownloadCsvTemplate} variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4"/>
                            CSV Template
                        </Button>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleUploadCsv}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="Upload CSV"
                            />
                            <Button variant="outline" size="sm">
                                <Upload className="mr-2 h-4 w-4"/>
                                Upload CSV
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-12">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Existing Staff & Board</CardTitle>
                    <CardDescription>Manage current staff and board members.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allMembers.map((member) => (
                                <TableRow key={member.id} className="group/row">
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            member.type === 'staff' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                        }`}>
                                            {member.type}
                                        </span>
                                    </TableCell>
                                    <TableCell>{member.title}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(member)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the member
                                                    "{member.name}".
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(member)}>
                                                    Delete
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">{editingMember ? 'Edit Member' : 'Add Member'}</CardTitle>
                    <CardDescription>{editingMember ? `Editing details for ${editingMember.name}` : 'Fill out the form below to add a new staff or board member.'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                             <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Member Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a type" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="board">Board Member</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., 'Jane Doe'" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Title / Role</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., 'Artistic Director'" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="e.g., 'jane.doe@thekyo.ca'" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="order"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Display Order (optional)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Lower numbers show first (e.g., 1, 2, 3)" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Use this to manually reorder members. If empty, they will be sorted alphabetically.
                                    </FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Biography (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="A short bio for the staff page..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormItem>
                                <FormLabel>Profile Photo (optional)</FormLabel>
                                <FormControl>
                                    <Input type="file" {...imageField} />
                                </FormControl>
                                <FormDescription>
                                    Upload a profile picture for the member.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>

                            <div className="pt-4 border-t border-primary/10">
                                <h3 className="text-lg font-headline font-bold mb-4">Social & Web Links</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="links.website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Custom Website</FormLabel>
                                                <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="links.linkedin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>LinkedIn URL</FormLabel>
                                                <FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="links.facebook"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Facebook URL</FormLabel>
                                                <FormControl><Input placeholder="https://facebook.com/..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="links.instagram"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Instagram URL</FormLabel>
                                                <FormControl><Input placeholder="https://instagram.com/..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="links.youtube"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>YouTube Channel</FormLabel>
                                                <FormControl><Input placeholder="https://youtube.com/@..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="links.spotify"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Spotify Artist URL</FormLabel>
                                                <FormControl><Input placeholder="https://open.spotify.com/artist/..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                             <div className="flex gap-4">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <UserPlus className="mr-2 h-4 w-4"/>
                                    )}
                                    {saveStatus === 'uploading' ? 'Uploading Image...' : 
                                     saveStatus === 'saving' ? 'Saving Details...' : 
                                     (editingMember ? 'Update Member' : 'Save Member')}
                                </Button>
                                {editingMember && (
                                    <Button variant="outline" onClick={() => setEditingMember(null)} disabled={isSaving}>
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel Edit
                                    </Button>
                                )}
                             </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
