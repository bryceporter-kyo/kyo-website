"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil, Trash2, UserPlus, X, Loader2, Download, Upload, ShieldCheck, Mail, Send, CheckCircle2, Unlink } from "lucide-react";
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
import { fetchUsersFromFirebase, addUserToFirebase, unlinkProfileFromUser, UserRole, User as UserType } from "@/lib/users";
import { uploadImage } from "@/lib/image-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CsvManagerDialog } from "@/components/shared/CsvManagerDialog";

import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
  tenure: z.string().optional(),
  professionPosition: z.string().optional(),
  professionCompany: z.string().optional(),
  bioUrl: z.string().optional(),
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
    const [users, setUsers] = React.useState<UserType[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [editingMember, setEditingMember] = React.useState<MemberWithId | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [saveStatus, setSaveStatus] = React.useState<"idle" | "uploading" | "saving">("idle");

    // Create User from Team Member modal state
    const [createUserMember, setCreateUserMember] = React.useState<MemberWithId | null>(null);
    const [createUserEmail, setCreateUserEmail] = React.useState<string>("");
    const [selectedUserRoles, setSelectedUserRoles] = React.useState<UserRole[]>(["Website Editor"]);
    const [isCreatingUser, setIsCreatingUser] = React.useState(false);

    // Bulk selection state
    const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([]);
    const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = React.useState(false);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = React.useState(false);
    const [bulkStatusAction, setBulkStatusAction] = React.useState<"active" | "leave">("active");
    const [bulkLeaveNote, setBulkLeaveNote] = React.useState("");
    const [isProcessingBulk, setIsProcessingBulk] = React.useState(false);

    // Unlink User state
    const [pendingUnlinkUser, setPendingUnlinkUser] = React.useState<{ user: UserType; member: MemberWithId } | null>(null);
    const [isUnlinking, setIsUnlinking] = React.useState(false);

    // Load data from Firebase
    React.useEffect(() => {
        const loadData = async () => {
            try {
                const [staffData, boardData, usersData] = await Promise.all([
                    fetchStaffFromFirebase(),
                    fetchBoardFromFirebase(),
                    fetchUsersFromFirebase()
                ]);
                setStaff(staffData);
                setBoard(boardData);
                setUsers(usersData);
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

    // Check if team member is already linked or has a matching user account
    function getLinkedUserForMember(member: MemberWithId): UserType | undefined {
        // Direct link ONLY: matched by explicit type + id, or by explicit type + exact name
        if (!member.id && !member.name) return undefined;
        return users.find(u => {
            if (!u.linkedProfile) return false;
            if (u.linkedProfile.type !== member.type) return false;
            // Match by unique ID if available
            if (u.linkedProfile.id && member.id && u.linkedProfile.id === member.id) {
                return true;
            }
            // Strict name match only if name is populated and non-empty
            if (u.linkedProfile.name && member.name && u.linkedProfile.name.trim().toLowerCase() === member.name.trim().toLowerCase()) {
                return true;
            }
            return false;
        });
    }

    // Bulk actions helpers
    const toggleSelectAllMembers = () => {
        if (selectedMemberIds.length === allMembers.length) {
            setSelectedMemberIds([]);
        } else {
            setSelectedMemberIds(allMembers.map(m => `${m.type}:${m.id}`));
        }
    };

    const toggleSelectMember = (memberKey: string) => {
        setSelectedMemberIds(prev =>
            prev.includes(memberKey) ? prev.filter(k => k !== memberKey) : [...prev, memberKey]
        );
    };

    const handleBulkDeleteMembers = async () => {
        if (selectedMemberIds.length === 0) return;
        setIsProcessingBulk(true);
        try {
            for (const key of selectedMemberIds) {
                const [type, id] = key.split(":");
                if (type === "staff") {
                    await deleteStaffFromFirebase(id);
                } else if (type === "board") {
                    await deleteBoardFromFirebase(id);
                }
            }

            setStaff(prev => prev.filter(s => !selectedMemberIds.includes(`staff:${s.id}`)));
            setBoard(prev => prev.filter(b => !selectedMemberIds.includes(`board:${b.id}`)));

            toast({
                title: "Members Deleted",
                description: `Successfully deleted ${selectedMemberIds.length} team members.`,
                variant: "destructive",
            });
            setSelectedMemberIds([]);
            setIsBulkDeleteDialogOpen(false);
        } catch (error) {
            console.error("Bulk delete failed:", error);
            toast({
                title: "Bulk Delete Error",
                description: "Failed to delete some members.",
                variant: "destructive",
            });
        } finally {
            setIsProcessingBulk(false);
        }
    };

    const handleBulkEditStatus = async () => {
        if (selectedMemberIds.length === 0) return;
        setIsProcessingBulk(true);
        try {
            const isOnLeave = bulkStatusAction === "leave";
            const leaveNote = isOnLeave ? bulkLeaveNote : "";

            for (const key of selectedMemberIds) {
                const [type, id] = key.split(":");
                if (type === "staff") {
                    await updateStaffInFirebase(id, { isOnLeave, leaveNote });
                } else if (type === "board") {
                    await updateBoardInFirebase(id, { isOnLeave, leaveNote });
                }
            }

            setStaff(prev => prev.map(s => {
                if (selectedMemberIds.includes(`staff:${s.id}`)) {
                    return { ...s, isOnLeave, leaveNote };
                }
                return s;
            }));

            setBoard(prev => prev.map(b => {
                if (selectedMemberIds.includes(`board:${b.id}`)) {
                    return { ...b, isOnLeave, leaveNote };
                }
                return b;
            }));

            toast({
                title: "Status Updated",
                description: `Updated status for ${selectedMemberIds.length} members to ${isOnLeave ? "On Leave" : "Active"}.`,
            });
            setSelectedMemberIds([]);
            setIsBulkEditDialogOpen(false);
        } catch (error) {
            console.error("Bulk status update failed:", error);
            toast({
                title: "Bulk Edit Error",
                description: "Failed to update member statuses.",
                variant: "destructive",
            });
        } finally {
            setIsProcessingBulk(false);
        }
    };

    // Handle creating a user account and emailing credentials from team screen
    async function handleCreateUserFromTeam() {
        if (!createUserMember) return;
        const targetEmail = createUserEmail.trim() || createUserMember.email.trim();
        if (!targetEmail || !targetEmail.includes("@")) {
            toast({
                title: "Invalid Email",
                description: "Please enter a valid email address for the user account.",
                variant: "destructive",
            });
            return;
        }
        if (selectedUserRoles.length === 0) {
            toast({
                title: "Role Required",
                description: "Please select at least one role for the user account.",
                variant: "destructive",
            });
            return;
        }

        setIsCreatingUser(true);
        try {
            const newUser = await addUserToFirebase({
                name: createUserMember.name,
                email: targetEmail,
                roles: selectedUserRoles,
                photoUrl: createUserMember.image || undefined,
                linkedProfile: {
                    type: createUserMember.type,
                    id: createUserMember.id,
                    name: createUserMember.name,
                    title: createUserMember.title,
                },
            });

            setUsers(prev => [...prev, newUser]);
            toast({
                title: "User Account Created!",
                description: `Created portal user for ${createUserMember.name} and sent onboarding email to ${targetEmail}.`,
            });
            setCreateUserMember(null);
            setCreateUserEmail("");
            setSelectedUserRoles(["Website Editor"]);
        } catch (error: any) {
            console.error("Failed to create user from team member:", error);
            toast({
                title: "Error Creating User",
                description: error?.message || "Failed to create portal user account.",
                variant: "destructive",
            });
        } finally {
            setIsCreatingUser(false);
        }
    }

    // Handle unlinking a user from a team profile
    async function handleConfirmUnlink() {
        if (!pendingUnlinkUser) return;
        const { user, member } = pendingUnlinkUser;
        setIsUnlinking(true);
        try {
            await unlinkProfileFromUser(user.id);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, linkedProfile: undefined } : u));
            toast({
                title: "Profile Unlinked",
                description: `Successfully unlinked user "${user.name}" from ${member.type === 'staff' ? 'staff' : 'board'} member "${member.name}".`,
            });
            setPendingUnlinkUser(null);
        } catch (error) {
            console.error("Failed to unlink user:", error);
            toast({
                title: "Unlink Failed",
                description: "Failed to unlink user account. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUnlinking(false);
        }
    }
    const sortedStaff = sortTeamMembers(staff);
    const sortedBoard = sortTeamMembers(board);

    const allMembers: MemberWithId[] = [
        ...sortedStaff.map(s => ({...s, type: 'staff' as const})), 
        ...sortedBoard.map(b => ({...b, type: 'board' as const}))
    ];

    // Prepare full CSV export data including tenure, professional expertise, order, links, bio, and linked user info
    const teamExportData = React.useMemo(() => {
        return allMembers.map(member => {
            const linkedUser = getLinkedUserForMember(member);
            const tenure = 'tenure' in member ? (member as any).tenure || '' : '';
            const professionPosition = 'professionPosition' in member ? (member as any).professionPosition || '' : '';
            const professionCompany = 'professionCompany' in member ? (member as any).professionCompany || '' : '';
            const bioUrl = 'bioUrl' in member ? (member as any).bioUrl || '' : '';

            return {
                Name: member.name || '',
                Type: member.type || '',
                Title: member.title || '',
                Email: member.email || '',
                Tenure: tenure,
                "Professional Position": professionPosition,
                "Professional Company / Expertise": professionCompany,
                "Bio URL": bioUrl,
                Biography: member.bio || '',
                "On Leave": member.isOnLeave ? 'yes' : 'no',
                "Leave Note": member.leaveNote || '',
                Order: member.order !== undefined ? member.order : '',
                "Linked User Account": linkedUser ? `${linkedUser.name} (${linkedUser.email})` : 'Unlinked',
                "User Roles": linkedUser ? linkedUser.roles.join(', ') : '',
                Website: member.links?.website || '',
                LinkedIn: member.links?.linkedin || '',
                Spotify: member.links?.spotify || '',
                Instagram: member.links?.instagram || '',
                Facebook: member.links?.facebook || '',
                YouTube: member.links?.youtube || '',
                Twitter: member.links?.twitter || '',
                Other: member.links?.other || '',
            };
        });
    }, [allMembers, users]);

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
                tenure: 'tenure' in editingMember ? (editingMember as any).tenure || "" : "",
                professionPosition: 'professionPosition' in editingMember ? (editingMember as any).professionPosition || "" : "",
                professionCompany: 'professionCompany' in editingMember ? (editingMember as any).professionCompany || "" : "",
                bioUrl: 'bioUrl' in editingMember ? (editingMember as any).bioUrl || "" : "",
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
                tenure: "",
                professionPosition: "",
                professionCompany: "",
                bioUrl: "",
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
                tenure: values.tenure || '',
                professionPosition: values.professionPosition || '',
                professionCompany: values.professionCompany || '',
                bioUrl: values.bioUrl || '',
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

            // Revalidate case-for-support and team pages so board order changes appear immediately
            fetch('/api/revalidate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secret: 'kyo-revalidate-secret-token-2026',
                    paths: ['/support-us/case-for-support', '/team'],
                }),
            }).catch(() => {});
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
                let createdMemberId = "";
                if (type === 'board') {
                    const newBoard = await addBoardToFirebase(memberData);
                    createdMemberId = newBoard.id;
                    setBoard(prev => [...prev, newBoard]);
                } else {
                    const newStaff = await addStaffToFirebase(memberData);
                    createdMemberId = newStaff.id;
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
                                id: createdMemberId,
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
                        description="Upload a CSV file to add staff and board members in bulk with bios, leave status, and social links. You can also export existing data including tenure and professional expertise."
                        triggerButtonText="Manage CSV / Export"
                        existingData={teamExportData}
                        templateHeaders={["Name", "Type", "Title", "Email", "Tenure", "Professional Position", "Professional Company / Expertise", "Bio URL", "Permissions", "OnLeave", "LeaveNote", "Bio", "Website", "Spotify", "LinkedIn", "Instagram", "Facebook", "YouTube", "Twitter", "Order"]}
                        templateSampleRow={["Jane Doe", "staff", "Artistic Director", "jane.doe@thekyo.ca", "2018 - Present", "Principal Cellist", "Peterborough Symphony", "https://janedoe.com/bio", "Website Editor", "no", "", "Jane is a dedicated musician and educator...", "https://janedoe.com", "https://open.spotify.com/artist/...", "https://linkedin.com/in/jane", "https://instagram.com/jane", "https://facebook.com/jane", "", "", "1"]}
                        instructionText="Use the template to bulk-add or export members with bios, sabbatical/leave status, tenure, professional expertise, and social links. 'Type' should be 'staff' or 'board'. Set 'OnLeave' to 'yes' or 'no'. Adding 'Permissions' (e.g. Website Editor, Internal Editor) will automatically create an admin user linked to this profile. Click 'Export Current Data' inside this dialog to download all existing members including blank and filled fields."
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
                    {/* Bulk Actions Toolbar */}
                    {selectedMemberIds.length > 0 && (
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="font-semibold">
                                    {selectedMemberIds.length} selected
                                </Badge>
                                <span className="text-xs text-muted-foreground">of {allMembers.length} members</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setBulkStatusAction("active");
                                        setBulkLeaveNote("");
                                        setIsBulkEditDialogOpen(true);
                                    }}
                                    className="h-8 text-xs gap-1.5"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Bulk Edit Status / Leave
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setIsBulkDeleteDialogOpen(true)}
                                    className="h-8 text-xs gap-1.5"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete Selected ({selectedMemberIds.length})
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedMemberIds([])}
                                    className="h-8 text-xs"
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    )}

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]">
                                    <Checkbox
                                        checked={allMembers.length > 0 && selectedMemberIds.length === allMembers.length}
                                        onCheckedChange={toggleSelectAllMembers}
                                        aria-label="Select all members"
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>User Account</TableHead>
                                <TableHead className="text-right w-[180px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allMembers.map((member) => {
                                const linkedUser = getLinkedUserForMember(member);
                                return (
                                <TableRow key={member.id} className="group/row">
                                    <TableCell className="w-[40px]">
                                        <Checkbox
                                            checked={selectedMemberIds.includes(`${member.type}:${member.id}`)}
                                            onCheckedChange={() => toggleSelectMember(`${member.type}:${member.id}`)}
                                            aria-label={`Select ${member.name}`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 bg-primary/10 border border-primary/20 shrink-0">
                                                {member.image ? <AvatarImage src={member.image} alt={member.name} className="object-cover" /> : null}
                                                <AvatarFallback className="text-primary text-xs font-semibold">
                                                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{member.name}</span>
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
                                    <TableCell>
                                        {linkedUser ? (
                                            <div className="flex items-center gap-1.5">
                                                <Badge variant="outline" className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200" title={`Linked to ${linkedUser.name} (${linkedUser.email})`}>
                                                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                                                    Active User
                                                </Badge>
                                                {linkedUser.linkedProfile && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => setPendingUnlinkUser({ user: linkedUser, member })}
                                                        title={`Unlink user account (${linkedUser.email})`}
                                                    >
                                                        <Unlink className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setCreateUserMember(member);
                                                    setCreateUserEmail(member.email || "");
                                                    setSelectedUserRoles(["Website Editor"]);
                                                }}
                                                className="h-6 px-2 text-[10px] border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold gap-1"
                                                title="Create a portal user account for this member and email login credentials"
                                            >
                                                <UserPlus className="w-2.5 h-2.5" />
                                                Create User
                                            </Button>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {!linkedUser ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setCreateUserMember(member);
                                                        setCreateUserEmail(member.email || "");
                                                        setSelectedUserRoles(["Website Editor"]);
                                                    }}
                                                    title="Create User & Email Credentials"
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <UserPlus className="h-4 w-4" />
                                                </Button>
                                            ) : linkedUser.linkedProfile ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setPendingUnlinkUser({ user: linkedUser, member })}
                                                    title={`Unlink from user account (${linkedUser.email})`}
                                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Unlink className="h-4 w-4" />
                                                </Button>
                                            ) : null}
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
                                        </div>
                                    </TableCell>
                                </TableRow>
                                );
                            })}
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

                            {/* Board Specific Governance Details */}
                            {form.watch("type") === "board" && (
                                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
                                    <div className="space-y-0.5">
                                        <h4 className="font-semibold text-sm text-slate-900">Board Governance & Fiduciary Details</h4>
                                        <p className="text-xs text-muted-foreground">Used on the Case for Support and Funder pages to showcase fiduciary oversight.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="tenure"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Tenure / Service</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., 'Board Member since 2019'" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="bioUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Bio / Profile Link (optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., '/team#bryce-porter' or LinkedIn" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="professionPosition"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Professional Title / Career</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., 'Vice President' or 'Senior Counsel'" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="professionCompany"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Company / Organization</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., 'RBC Royal Bank' or 'Trent University'" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

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
                                {editingMember && editingMember.image && (
                                    <div className="flex items-center gap-4 mb-3 p-3 bg-muted/50 rounded-lg border">
                                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0 border">
                                            <Image 
                                                src={editingMember.image} 
                                                alt={editingMember.name} 
                                                fill 
                                                className="object-cover" 
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">Current photo attached</p>
                                            <p className="text-xs text-muted-foreground">Upload a new file below to replace it</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                setEditingMember({ ...editingMember, image: '' });
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Remove
                                        </Button>
                                    </div>
                                )}
                                <FormControl>
                                    <Input type="file" accept="image/*" {...imageField} />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    JPG, PNG, or WebP. Images are automatically optimized and uploaded to cloud storage.
                                </FormDescription>
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

            {/* Create User & Send Credentials Modal */}
            <Dialog open={!!createUserMember} onOpenChange={(open) => !open && setCreateUserMember(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-xl flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            Create User Account
                        </DialogTitle>
                        <DialogDescription>
                            Create an authorized portal account for <strong>{createUserMember?.name}</strong> and email them login credentials.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="p-3 bg-slate-50 border rounded-lg text-xs space-y-1">
                            <p><strong>Name:</strong> {createUserMember?.name}</p>
                            <p><strong>Team Role:</strong> {createUserMember?.title} ({createUserMember?.type === 'staff' ? 'Staff' : 'Board'})</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground">User Login Email</label>
                            <Input
                                type="email"
                                value={createUserEmail}
                                onChange={(e) => setCreateUserEmail(e.target.value)}
                                placeholder="name@thekyo.ca"
                                className="h-9 text-xs"
                            />
                            <p className="text-[11px] text-muted-foreground">Credentials and login instructions will be sent to this email address.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-foreground">Select User Permissions</label>
                            <div className="space-y-2">
                                {(["Website Editor", "Internal Editor", "Internal Viewer", "Grants Portal"] as UserRole[]).map((role) => (
                                    <div
                                        key={role}
                                        onClick={() => {
                                            setSelectedUserRoles(prev => 
                                                prev.includes(role) 
                                                    ? prev.filter(r => r !== role)
                                                    : [...prev, role]
                                            );
                                        }}
                                        className="flex items-center space-x-2 p-2.5 rounded-lg border bg-white hover:bg-slate-50 cursor-pointer text-xs"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedUserRoles.includes(role)}
                                            onChange={() => {}} // handled by parent div
                                            className="h-4 w-4 rounded border-gray-300 text-primary"
                                        />
                                        <span className="font-medium text-slate-800">{role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-800 space-y-1.5">
                            <p className="font-semibold flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-blue-600" />
                                Onboarding Email Notice
                            </p>
                            <p>
                                An email will immediately be sent to <strong>{createUserEmail || createUserMember?.email}</strong> informing them of their new profile and access to:
                            </p>
                            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-blue-900 font-medium">
                                {selectedUserRoles.includes("Website Editor") && (
                                    <li>KYO Admin Panel (https://thekyo.ca/admin)</li>
                                )}
                                {(selectedUserRoles.includes("Internal Editor") || selectedUserRoles.includes("Internal Viewer")) && (
                                    <li>KYO Internal Portal (https://thekyo.ca/internal)</li>
                                )}
                                {selectedUserRoles.includes("Grants Portal") && (
                                    <li>KYO Grants Portal (https://thekyo.ca/grants)</li>
                                )}
                            </ul>
                            <p className="text-[11px] text-blue-900 pt-0.5">
                                They will be asked to choose their password via <em>First Time Login</em> when first accessing the page.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCreateUserMember(null)}
                            disabled={isCreatingUser}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateUserFromTeam}
                            disabled={isCreatingUser || selectedUserRoles.length === 0}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isCreatingUser ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating &amp; Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Create User &amp; Send Email
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bulk Edit Status / Sabbatical Dialog */}
            <Dialog open={isBulkEditDialogOpen} onOpenChange={setIsBulkEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Bulk Edit Member Status</DialogTitle>
                        <DialogDescription>
                            Update active status or sabbatical/leave notes for <strong>{selectedMemberIds.length}</strong> selected members.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={bulkStatusAction} onValueChange={(val: any) => setBulkStatusAction(val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active (Not on Leave)</SelectItem>
                                    <SelectItem value="leave">On Sabbatical / Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {bulkStatusAction === "leave" && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Sabbatical / Leave Note</label>
                                <Input
                                    placeholder="e.g. On Leave - Fall 2026"
                                    value={bulkLeaveNote}
                                    onChange={(e) => setBulkLeaveNote(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBulkEditDialogOpen(false)} disabled={isProcessingBulk}>
                            Cancel
                        </Button>
                        <Button onClick={handleBulkEditStatus} disabled={isProcessingBulk}>
                            {isProcessingBulk ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Apply to {selectedMemberIds.length} Members
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedMemberIds.length} Team Members?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete <strong>{selectedMemberIds.length}</strong> selected staff and board profiles from the database? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessingBulk}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleBulkDeleteMembers();
                            }}
                            disabled={isProcessingBulk}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isProcessingBulk ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting {selectedMemberIds.length} Members...
                                </>
                            ) : (
                                `Delete ${selectedMemberIds.length} Members`
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Unlink Confirmation Dialog */}
            <AlertDialog open={!!pendingUnlinkUser} onOpenChange={(open) => !open && setPendingUnlinkUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unlink User Account?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to unlink user account <strong>{pendingUnlinkUser?.user.name}</strong> ({pendingUnlinkUser?.user.email}) from {pendingUnlinkUser?.member.type === "staff" ? "staff" : "board"} member <strong>{pendingUnlinkUser?.member.name}</strong>? Both the user and team records will remain, but will no longer be connected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUnlinking}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirmUnlink();
                            }}
                            disabled={isUnlinking}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isUnlinking ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Unlinking...
                                </>
                            ) : (
                                "Unlink User"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
