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
import React, { useState } from "react";
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
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CsvManagerDialog } from "@/components/shared/CsvManagerDialog";

import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const memberSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  title: z.string().min(3, "Title must be at least 3 characters."),
  email: z.string().email("Please enter a valid email address."),
  order: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().optional()),
  bio: z.string().optional(),
  image: z.any().optional(),
  type: z.enum(["staff", "board"]),
  isOnLeave: z.boolean().default(false),
  leaveNote: z.string().optional(),
  links: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    youtube: z.string().optional(),
    spotify: z.string().optional(),
    website: z.string().optional(),
    twitter: z.string().optional(),
    other: z.string().optional(),
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
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
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
            isOnLeave: false,
            leaveNote: "",
            links: {
                facebook: "",
                instagram: "",
                linkedin: "",
                youtube: "",
                spotify: "",
                website: "",
                twitter: "",
                other: "",
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
                isOnLeave: Boolean(editingMember.isOnLeave),
                leaveNote: editingMember.leaveNote || "",
                links: {
                    facebook: editingMember.links?.facebook || "",
                    instagram: editingMember.links?.instagram || "",
                    linkedin: editingMember.links?.linkedin || "",
                    youtube: editingMember.links?.youtube || "",
                    spotify: editingMember.links?.spotify || "",
                    website: editingMember.links?.website || "",
                    twitter: editingMember.links?.twitter || "",
                    other: editingMember.links?.other || "",
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
                isOnLeave: false,
                leaveNote: "",
                links: {
                    facebook: "",
                    instagram: "",
                    linkedin: "",
                    youtube: "",
                    spotify: "",
                    website: "",
                    twitter: "",
                    other: "",
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
                isOnLeave: values.isOnLeave,
                leaveNote: values.leaveNote || '',
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
            setIsDialogOpen(false);
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
        setIsDialogOpen(true);
    }

    const handleAddClick = () => {
        setEditingMember(null);
        setIsDialogOpen(true);
    }

    const handleCsvUpload = async (data: any[], mode: 'append' | 'overwrite') => {
        let successCount = 0;
        let errorCount = 0;

        for (const row of data) {
            try {
                const name = row.Name || row.name;
                const type = (row.Type || row.type || "staff").toLowerCase();
                const title = row.Title || row.title;
                const email = row.Email || row.email;
                const permissions = row["Permission Settings"] || row.permissions || row.Permissions;
                const bio = row.Biography || row.biography || row.bio || row.Bio;
                const order = row.Order || row.order ? Number(row.Order || row.order) : undefined;
                
                const onLeaveRaw = String(row.OnLeave || row.onLeave || row["On Leave"] || "").toLowerCase().trim();
                const isOnLeave = onLeaveRaw === 'true' || onLeaveRaw === 'yes' || onLeaveRaw === '1' || onLeaveRaw === 'y';
                const leaveNote = row.LeaveNote || row.leaveNote || row["Leave Note"] || "";

                const links = {
                    facebook: row.Facebook || row.facebook || "",
                    instagram: row.Instagram || row.instagram || "",
                    linkedin: row.LinkedIn || row.linkedin || row.Linkedin || "",
                    youtube: row.YouTube || row.youtube || row.Youtube || "",
                    spotify: row.Spotify || row.spotify || "",
                    website: row.Website || row.website || "",
                    twitter: row.Twitter || row.twitter || "",
                    other: row.Other || row.other || "",
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
                    order,
                    bio: bio || "",
                    image: "", // Placeholder, can be updated manually
                    isOnLeave,
                    leaveNote,
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
                            roles: rolesArray,
                            linkedProfile: {
                                type: type === 'board' ? 'board' : 'staff',
                                id: name,
                                name,
                                title,
                            }
                        });
                    }
                }

                successCount++;
            } catch (error) {
                console.error("Error importing team member from CSV:", error);
                errorCount++;
            }
        }

        toast({
            title: "Import Complete",
            description: `Successfully imported ${successCount} members.${errorCount > 0 ? ` Failed to import ${errorCount} members.` : ""}`,
            variant: errorCount > 0 ? "destructive" : "default",
        });
    };

    return (
        <div className="container mx-auto py-12">
            <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <Button asChild variant="outline">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Admin
                    </Link>
                </Button>
                <div className="flex flex-wrap gap-3">
                    <CsvManagerDialog
                        title="Import Team Data"
                        description="Upload a CSV file to add staff and board members in bulk with bios, leave status, and social links."
                        triggerButtonText="Import Members"
                        templateHeaders={["Name", "Type", "Title", "Email", "Permissions", "OnLeave", "LeaveNote", "Bio", "Website", "Spotify", "LinkedIn", "Instagram", "Facebook", "YouTube", "Twitter", "Order"]}
                        templateSampleRow={["Jane Doe", "staff", "Artistic Director", "jane.doe@thekyo.ca", "Website Editor", "no", "", "Jane is a dedicated musician and educator...", "https://janedoe.com", "https://open.spotify.com/artist/...", "https://linkedin.com/in/jane", "https://instagram.com/jane", "https://facebook.com/jane", "", "", "1"]}
                        instructionText="Use the template to bulk-add members with bios, sabbatical/leave status, and social links. 'Type' should be 'staff' or 'board'. Set 'OnLeave' to 'yes' or 'no'. Adding 'Permissions' (e.g. Website Editor, Internal Editor) will automatically create an admin user linked to this profile."
                        onUpload={handleCsvUpload}
                    />
                    <Button onClick={handleAddClick}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                    </Button>
                </div>
            </div>

            <Card className="mb-12">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Existing Staff & Board</CardTitle>
                    <CardDescription>Manage current staff and board members, sabbatical statuses, and social links.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allMembers.map((member) => (
                                <TableRow key={member.id} className="group/row">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {member.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            member.type === 'staff' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                        }`}>
                                            {member.type}
                                        </span>
                                    </TableCell>
                                    <TableCell>{member.title}</TableCell>
                                    <TableCell>
                                        {member.isOnLeave ? (
                                            <Badge variant="secondary" className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-semibold">
                                                {member.leaveNote || "On Sabbatical / Leave"}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 text-[10px]">
                                                Active
                                            </Badge>
                                        )}
                                    </TableCell>
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-2xl">{editingMember ? 'Edit Member' : 'Add Member'}</DialogTitle>
                        <DialogDescription>{editingMember ? `Editing details for ${editingMember.name}` : 'Fill out the form below to add a new staff or board member.'}</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <Input placeholder="e.g., 'Artistic Director' or 'Board Chair'" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <Input type="number" placeholder="e.g., 1, 2, 3" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Sabbatical / Leave Status */}
                            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-4">
                                <FormField
                                    control={form.control}
                                    name="isOnLeave"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between">
                                            <div className="space-y-0.5">
                                                <FormLabel className="font-semibold text-sm text-amber-950">Temporarily Away / On Sabbatical</FormLabel>
                                                <FormDescription className="text-xs text-amber-800">
                                                    Toggle on if this member is currently away on sabbatical or leave.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {form.watch("isOnLeave") && (
                                    <FormField
                                        control={form.control}
                                        name="leaveNote"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold text-amber-950">Leave Status Note (optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., 'On Sabbatical 2026-2027' or 'On Leave'" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Biography (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="A short bio for the staff page. Supports markdown." className="h-32" {...field} />
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
                                <FormMessage />
                            </FormItem>

                            <div className="pt-4 border-t border-primary/10">
                                <h3 className="text-lg font-headline font-bold mb-4">Social & Web Links</h3>
                                <p className="text-xs text-muted-foreground mb-4">Links will only appear on the public card if a valid URL is provided.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="links.website" render={({ field }) => (
                                        <FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="links.spotify" render={({ field }) => (
                                        <FormItem><FormLabel>Spotify</FormLabel><FormControl><Input placeholder="https://open.spotify.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="links.linkedin" render={({ field }) => (
                                        <FormItem><FormLabel>LinkedIn</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="links.instagram" render={({ field }) => (
                                        <FormItem><FormLabel>Instagram</FormLabel><FormControl><Input placeholder="https://instagram.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="links.facebook" render={({ field }) => (
                                        <FormItem><FormLabel>Facebook</FormLabel><FormControl><Input placeholder="https://facebook.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="links.youtube" render={({ field }) => (
                                        <FormItem><FormLabel>YouTube</FormLabel><FormControl><Input placeholder="https://youtube.com/@..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="links.twitter" render={({ field }) => (
                                        <FormItem><FormLabel>Twitter / X</FormLabel><FormControl><Input placeholder="https://x.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="links.other" render={({ field }) => (
                                        <FormItem><FormLabel>Other Custom URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </div>
                            </div>
                            <div className="flex gap-4 justify-end pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {saveStatus === 'uploading' ? 'Uploading Image...' : 
                                     saveStatus === 'saving' ? 'Saving Details...' : 
                                     (editingMember ? 'Update Member' : 'Save Member')}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
