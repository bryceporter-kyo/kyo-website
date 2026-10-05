
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil, Trash2, User as UserIcon, Download, Upload, Loader2, Camera, Link as LinkIcon, Unlink, UserCheck, Shield } from "lucide-react";
import Link from "next/link";
import { fetchUsersFromFirebase, addUserToFirebase, deleteUserFromFirebase, updateUserInFirebase } from "@/lib/users";
import type { User as UserType, UserRole, LinkedProfile } from "@/lib/users";
import { fetchStaffFromFirebase, fetchBoardFromFirebase, StaffMember, BoardMember } from "@/lib/staff";
import { uploadImage } from "@/lib/image-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CsvManagerDialog } from "@/components/shared/CsvManagerDialog";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const roles: { id: UserRole; label: string }[] = [
    { id: 'Website Editor', label: 'Website Editor' },
    { id: 'Internal Editor', label: 'Internal Editor' },
    { id: 'Internal Viewer', label: 'Internal Viewer' },
];

const userSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Please enter a valid email address."),
  roles: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one role.",
  }),
  linkedProfileKey: z.string().optional(),
  photo: z.any().optional(),
});

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U';
}

export default function UsersAdminPage() {
    const { toast } = useToast();
    const [users, setUsers] = React.useState<UserType[]>([]);
    const [staff, setStaff] = React.useState<StaffMember[]>([]);
    const [board, setBoard] = React.useState<BoardMember[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);

    // Edit state
    const [editingUser, setEditingUser] = React.useState<UserType | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            roles: [],
            linkedProfileKey: "none",
            photo: undefined,
        },
    });

    const editForm = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            roles: [],
            linkedProfileKey: "none",
            photo: undefined,
        },
    });

    const photoField = form.register("photo");
    const editPhotoField = editForm.register("photo");

    React.useEffect(() => {
        loadData();
    }, []);

    // Reset edit form when editingUser changes
    React.useEffect(() => {
        if (editingUser) {
            let key = "none";
            if (editingUser.linkedProfile) {
                key = `${editingUser.linkedProfile.type}:${editingUser.linkedProfile.id}`;
            }
            editForm.reset({
                name: editingUser.name,
                email: editingUser.email,
                roles: editingUser.roles,
                linkedProfileKey: key,
                photo: undefined,
            });
        }
    }, [editingUser, editForm]);

    async function loadData() {
        setIsLoading(true);
        try {
            const [usersData, staffData, boardData] = await Promise.all([
                fetchUsersFromFirebase(),
                fetchStaffFromFirebase(),
                fetchBoardFromFirebase()
            ]);
            setUsers(usersData);
            setStaff(staffData);
            setBoard(boardData);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load users and team profiles.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Helper to resolve linked profile details from key "type:id"
    function resolveLinkedProfile(key?: string): LinkedProfile | undefined {
        if (!key || key === "none") return undefined;
        const [type, id] = key.split(":");
        if (type === "staff") {
            const member = staff.find(s => s.id === id);
            if (member) return { type: 'staff', id: member.id, name: member.name, title: member.title };
        } else if (type === "board") {
            const member = board.find(b => b.id === id);
            if (member) return { type: 'board', id: member.id, name: member.name, title: member.title };
        }
        return undefined;
    }

    // Helper to get image from linked profile or direct photo
    function getUserAvatarUrl(user: UserType): string | undefined {
        if (user.photoUrl) return user.photoUrl;
        if (user.linkedProfile) {
            if (user.linkedProfile.type === 'staff') {
                const s = staff.find(m => m.id === user.linkedProfile?.id || m.name === user.linkedProfile?.name);
                if (s?.image) return s.image;
            } else if (user.linkedProfile.type === 'board') {
                const b = board.find(m => m.id === user.linkedProfile?.id || m.name === user.linkedProfile?.name);
                if (b?.image) return b.image;
            }
        }
        return undefined;
    }

    // When linked profile is changed in the Create form, auto-fill name/email if empty
    const handleCreateProfileSelect = (key: string) => {
        form.setValue("linkedProfileKey", key);
        if (key && key !== "none") {
            const profile = resolveLinkedProfile(key);
            if (profile) {
                if (!form.getValues("name")) {
                    form.setValue("name", profile.name || "");
                }
                const member = profile.type === 'staff' 
                    ? staff.find(s => s.id === profile.id)
                    : board.find(b => b.id === profile.id);
                if (member?.email && !form.getValues("email")) {
                    form.setValue("email", member.email);
                }
            }
        }
    };

    const handleEditProfileSelect = (key: string) => {
        editForm.setValue("linkedProfileKey", key);
    };

    const handleCsvUpload = async (data: any[]) => {
        let successCount = 0;
        let errorCount = 0;
        const newUsers: UserType[] = [];

        for (const row of data) {
            try {
                const name = row.Name || row.name;
                const email = row.Email || row.email;
                const rolesRaw = row.Roles || row.roles || row.Permissions || row.permissions;
                const profileTypeRaw = (row.ProfileType || row.profileType || row["Profile Type"] || "").toLowerCase().trim();
                const profileNameRaw = row.ProfileName || row.profileName || row["Profile Name"] || "";

                if (!name || !email) {
                    console.error("Missing name or email for row:", row);
                    errorCount++;
                    continue;
                }

                const rolesArray = rolesRaw 
                    ? rolesRaw.split(',').map((r: string) => r.trim()).filter(Boolean) as UserRole[] 
                    : ['Internal Viewer' as UserRole];

                let linkedProfile: LinkedProfile | undefined = undefined;
                if (profileTypeRaw === 'staff') {
                    const match = staff.find(s => s.name.toLowerCase() === (profileNameRaw || name).toLowerCase());
                    if (match) {
                        linkedProfile = { type: 'staff', id: match.id, name: match.name, title: match.title };
                    }
                } else if (profileTypeRaw === 'board') {
                    const match = board.find(b => b.name.toLowerCase() === (profileNameRaw || name).toLowerCase());
                    if (match) {
                        linkedProfile = { type: 'board', id: match.id, name: match.name, title: match.title };
                    }
                }

                const userData = {
                    name,
                    email,
                    roles: rolesArray.length > 0 ? rolesArray : ['Internal Viewer' as UserRole],
                    linkedProfile,
                };

                const createdUser = await addUserToFirebase(userData);
                newUsers.push(createdUser);
                successCount++;
            } catch (error) {
                console.error("Error importing user from CSV:", error);
                errorCount++;
            }
        }

        setUsers(prev => [...prev, ...newUsers]);
        toast({
            title: "Import Complete",
            description: `Successfully imported ${successCount} users.${errorCount > 0 ? ` Failed to import ${errorCount} users.` : ""}`,
            variant: errorCount > 0 ? "destructive" : "default",
        });
    };

    async function onSubmit(values: z.infer<typeof userSchema>) {
        setIsSaving(true);
        try {
            let photoUrl = "";
            if (values.photo && values.photo.length > 0 && values.photo[0] instanceof File) {
                const file = values.photo[0];
                const imageId = `user_${Date.now()}`;
                photoUrl = await uploadImage(file, imageId);
            }

            const linkedProfile = resolveLinkedProfile(values.linkedProfileKey);

            const newUser = await addUserToFirebase({
                name: values.name,
                email: values.email,
                roles: values.roles as UserRole[],
                photoUrl: photoUrl || undefined,
                linkedProfile: linkedProfile || undefined,
            });

            setUsers([...users, newUser]);
            toast({
                title: "User Created!",
                description: `"${values.name}" has been added with their permissions.`,
            });
            form.reset({
                name: "",
                email: "",
                roles: [],
                linkedProfileKey: "none",
                photo: undefined,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to create user.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    async function onEditSubmit(values: z.infer<typeof userSchema>) {
        if (!editingUser) return;
        setIsSaving(true);
        
        try {
            let photoUrl = editingUser.photoUrl;
            if (values.photo && values.photo.length > 0 && values.photo[0] instanceof File) {
                const file = values.photo[0];
                const imageId = `user_${Date.now()}`;
                photoUrl = await uploadImage(file, imageId);
            }

            const linkedProfile = resolveLinkedProfile(values.linkedProfileKey);

            const updateData: Partial<UserType> = {
                name: values.name,
                email: values.email,
                roles: values.roles as UserRole[],
                photoUrl: photoUrl || undefined,
                linkedProfile: linkedProfile || undefined,
            };

            await updateUserInFirebase(editingUser.id, updateData);
            
            // Update local state
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...updateData } : u));
            
            setIsEditDialogOpen(false);
            setEditingUser(null);
            toast({
                title: "User Updated",
                description: `Profile and permissions for "${values.name}" have been saved.`,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to update user.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(userToDelete: UserType) {
        try {
            await deleteUserFromFirebase(userToDelete.id);
            setUsers(users.filter(user => user.id !== userToDelete.id));
            toast({
                title: "User Deleted",
                description: `"${userToDelete.name}" has been deleted.`,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to delete user.",
                variant: "destructive",
            });
        }
    }

    function openEditDialog(user: UserType) {
        setEditingUser(user);
        setIsEditDialogOpen(true);
    }

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
                        title="Import Users"
                        description="Upload a CSV file to add or update user accounts with their assigned permissions."
                        triggerButtonText="Import Users CSV"
                        templateHeaders={["Name", "Email", "Roles", "ProfileType", "ProfileName"]}
                        templateSampleRow={["Jane Doe", "jane.doe@thekyo.ca", "Website Editor, Internal Editor", "staff", "Jane Doe"]}
                        instructionText="Roles can be comma-separated: 'Website Editor', 'Internal Editor', 'Internal Viewer'. ProfileType can be 'staff' or 'board'. Photos can be added or updated separately via the Edit button."
                        onUpload={handleCsvUpload}
                    />
                </div>
            </div>

            <Card className="mb-12">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Existing Users</CardTitle>
                    <CardDescription>Manage user accounts, admin permissions, and staff/board profile linkage.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Linked Profile</TableHead>
                                    <TableHead>Roles & Permissions</TableHead>
                                    <TableHead className="text-right w-[150px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No users found. Create one below or import via CSV.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => {
                                        const avatarSrc = getUserAvatarUrl(user);
                                        return (
                                            <TableRow key={user.id} className="group/row">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 bg-primary/10 border border-primary/20">
                                                            {avatarSrc ? <AvatarImage src={avatarSrc} alt={user.name} /> : null}
                                                            <AvatarFallback className="text-primary text-xs font-semibold">
                                                                {getInitials(user.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold text-sm leading-tight">{user.name}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                                                <TableCell>
                                                    {user.linkedProfile ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <Badge variant="outline" className={`text-[10px] font-semibold ${
                                                                user.linkedProfile.type === 'staff' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                                                            }`}>
                                                                <LinkIcon className="w-2.5 h-2.5 mr-1" />
                                                                {user.linkedProfile.type === 'staff' ? 'Staff' : 'Board'}
                                                                {user.linkedProfile.title ? `: ${user.linkedProfile.title}` : ''}
                                                            </Badge>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">Unlinked</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles?.map(role => (
                                                            <Badge key={role} variant="secondary" className="text-[10px] font-semibold">{role}</Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} title="Edit User">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete User">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the user account for
                                                                "{user.name}".
                                                            </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(user)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Create New User</CardTitle>
                    <CardDescription>Add a new portal user, assign permissions, optionally upload a photo or link to a staff/board member profile.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Profile Link Option */}
                            <div className="p-4 rounded-xl border border-primary/15 bg-primary/[0.02] space-y-3">
                                <div className="flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-primary" />
                                    <h4 className="text-sm font-bold text-foreground">Link to Staff / Board Member (Optional)</h4>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Link this user account to an existing staff or board profile to merge their identity.
                                </p>
                                <Select onValueChange={handleCreateProfileSelect} value={form.watch("linkedProfileKey") || "none"}>
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="Choose a staff or board member..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- No profile link (Stand-alone User) --</SelectItem>
                                        {staff.length > 0 && (
                                            <>
                                                <SelectItem disabled value="header-staff" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                                    -- Staff Members --
                                                </SelectItem>
                                                {staff.map(s => (
                                                    <SelectItem key={`staff:${s.id}`} value={`staff:${s.id}`}>
                                                        [Staff] {s.name} ({s.title})
                                                    </SelectItem>
                                                ))}
                                            </>
                                        )}
                                        {board.length > 0 && (
                                            <>
                                                <SelectItem disabled value="header-board" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                                    -- Board Members --
                                                </SelectItem>
                                                {board.map(b => (
                                                    <SelectItem key={`board:${b.id}`} value={`board:${b.id}`}>
                                                        [Board] {b.name} ({b.title})
                                                    </SelectItem>
                                                ))}
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

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
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="e.g., 'jane.doe@example.com'" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormItem>
                                <FormLabel>User Photo (Optional)</FormLabel>
                                <FormDescription className="text-xs">
                                    Upload a custom profile photo for this user (or uses their linked profile photo if available).
                                </FormDescription>
                                <FormControl>
                                    <Input type="file" accept="image/*" {...photoField} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                            <FormField
                                control={form.control}
                                name="roles"
                                render={() => (
                                    <FormItem>
                                        <div className="mb-4">
                                            <FormLabel className="text-base font-semibold">User Roles & Access Permissions</FormLabel>
                                            <FormDescription>
                                                Select the roles and management sections this user is authorized to access.
                                            </FormDescription>
                                        </div>
                                        <div className="space-y-3">
                                            {roles.map((item) => (
                                                <FormField
                                                    key={item.id}
                                                    control={form.control}
                                                    name="roles"
                                                    render={({ field }) => {
                                                        return (
                                                        <FormItem
                                                            key={item.id}
                                                            className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3.5 bg-slate-50/50"
                                                        >
                                                            <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(item.id)}
                                                                onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...(field.value || []), item.id])
                                                                    : field.onChange(
                                                                        (field.value || []).filter(
                                                                            (value) => value !== item.id
                                                                        )
                                                                        )
                                                                }}
                                                            />
                                                            </FormControl>
                                                            <FormLabel className="font-medium cursor-pointer text-sm">
                                                                {item.label}
                                                            </FormLabel>
                                                        </FormItem>
                                                        )
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={isSaving} className="mt-4">
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserIcon className="mr-2 h-4 w-4"/>}
                                Create User
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-2xl">Edit User</DialogTitle>
                        <DialogDescription>
                            Update user permissions, profile photo, and staff/board profile linkage.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-5">
                            {/* Profile Link Option */}
                            <div className="p-3.5 rounded-xl border border-primary/15 bg-primary/[0.02] space-y-2">
                                <FormLabel className="text-xs font-bold text-foreground">Linked Staff / Board Profile</FormLabel>
                                <Select onValueChange={handleEditProfileSelect} value={editForm.watch("linkedProfileKey") || "none"}>
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="Link to a staff or board profile..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- No profile link (Stand-alone User) --</SelectItem>
                                        {staff.length > 0 && (
                                            <>
                                                <SelectItem disabled value="header-staff" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                                    -- Staff Members --
                                                </SelectItem>
                                                {staff.map(s => (
                                                    <SelectItem key={`staff:${s.id}`} value={`staff:${s.id}`}>
                                                        [Staff] {s.name} ({s.title})
                                                    </SelectItem>
                                                ))}
                                            </>
                                        )}
                                        {board.length > 0 && (
                                            <>
                                                <SelectItem disabled value="header-board" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                                    -- Board Members --
                                                </SelectItem>
                                                {board.map(b => (
                                                    <SelectItem key={`board:${b.id}`} value={`board:${b.id}`}>
                                                        [Board] {b.name} ({b.title})
                                                    </SelectItem>
                                                ))}
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <FormField
                                control={editForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormItem>
                                <FormLabel>Update User Photo (Optional)</FormLabel>
                                <FormControl>
                                    <Input type="file" accept="image/*" {...editPhotoField} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                            <FormField
                                control={editForm.control}
                                name="roles"
                                render={() => (
                                    <FormItem>
                                        <div className="mb-2">
                                            <FormLabel className="text-sm font-semibold">Assigned Roles & Permissions</FormLabel>
                                        </div>
                                        <div className="space-y-2">
                                            {roles.map((item) => (
                                                <FormField
                                                    key={item.id}
                                                    control={editForm.control}
                                                    name="roles"
                                                    render={({ field }) => (
                                                        <FormItem
                                                            key={item.id}
                                                            className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 bg-slate-50/50"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(item.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...(field.value || []), item.id])
                                                                            : field.onChange(
                                                                                (field.value || []).filter(
                                                                                    (value) => value !== item.id
                                                                                )
                                                                            )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer text-sm">
                                                                {item.label}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
