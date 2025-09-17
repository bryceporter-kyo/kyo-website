
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil, Trash2, User, Upload, Download } from "lucide-react";
import Link from "next/link";
import { getUsers } from "@/lib/users";
import type { User as UserType, UserRole } from "@/lib/users";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { Label } from "@/components/ui/label";
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

const roles: { id: UserRole; label: string }[] = [
    { id: 'Website Editor', label: 'Website Editor' },
    { id: 'Internal Editor', label: 'Internal Editor' },
    { id: 'Internal Viewer', label: 'Internal Viewer' },
]

const userSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Please enter a valid email address."),
  roles: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one role.",
  }),
});

export default function UsersAdminPage() {
    const { toast } = useToast();
    const users = getUsers();
    const [csvFile, setCsvFile] = React.useState<File | null>(null);

    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            roles: [],
        },
    });

    function onSubmit(values: z.infer<typeof userSchema>) {
        console.log(values);
        toast({
            title: "User Created!",
            description: "The new user has been saved.",
        });
        form.reset();
    }

    const handleDownloadCsv = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "name,email,roles\n"
            + "Jane Doe,jane.doe@example.com,\"Website Editor,Internal Viewer\"";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "users_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setCsvFile(event.target.files[0]);
        }
    };

    const handleImportCsv = () => {
        if (!csvFile) {
            toast({
                title: "No file selected",
                description: "Please select a CSV file to upload.",
                variant: "destructive",
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            console.log("Parsing CSV content:", text);
            // In a real application, you would parse the CSV and send it to a server action
            toast({
                title: "CSV Uploaded",
                description: "The user data is being processed. (This is a placeholder)",
            });
        };
        reader.readAsText(csvFile);
    };
    
    function handleDelete(user: UserType) {
        console.log("Deleting user:", user.name);
        toast({
            title: "User Deleted",
            description: `"${user.name}" has been deleted. (This is a placeholder)`,
            variant: "destructive",
        });
    }

    return (
        <div className="container mx-auto py-12">
            <div className="mb-8">
                <Button asChild variant="outline">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Admin
                    </Link>
                </Button>
            </div>

             <Card className="mb-12">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Bulk User Management</CardTitle>
                    <CardDescription>Download a template or upload a CSV to manage users in bulk.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6 items-end">
                    <div>
                        <Label className="text-sm font-medium">Import from CSV</Label>
                        <p className="text-sm text-muted-foreground mb-2">Upload a CSV file to add multiple users at once.</p>
                        <div className="flex gap-2">
                            <Input type="file" accept=".csv" onChange={handleFileUpload} className="max-w-xs" />
                            <Button onClick={handleImportCsv} disabled={!csvFile} size="sm">
                                <Upload className="mr-2 h-4 w-4"/>
                                Upload
                            </Button>
                        </div>
                    </div>
                     <div className="md:text-right">
                        <p className="text-sm font-medium">Download Template</p>
                        <p className="text-sm text-muted-foreground mb-2">Get a CSV template to ensure correct formatting.</p>
                        <Button onClick={handleDownloadCsv} variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4"/>
                            Download Template
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-12">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Existing Users</CardTitle>
                    <CardDescription>Manage user accounts and permissions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead className="text-right w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map(role => (
                                                <Badge key={role} variant="secondary">{role}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
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
                                                    This action cannot be undone. This will permanently delete the user
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
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Create User</CardTitle>
                    <CardDescription>Fill out the form below to add a new user.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                             <FormField
                                control={form.control}
                                name="roles"
                                render={() => (
                                    <FormItem>
                                        <div className="mb-4">
                                            <FormLabel className="text-base">User Roles</FormLabel>
                                            <FormDescription>
                                                Select one or more roles for this user.
                                            </FormDescription>
                                        </div>
                                        {roles.map((item) => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="roles"
                                                render={({ field }) => {
                                                    return (
                                                    <FormItem
                                                        key={item.id}
                                                        className="flex flex-row items-start space-x-3 space-y-0"
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
                                                        <FormLabel className="font-normal">
                                                            {item.label}
                                                        </FormLabel>
                                                    </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                             <Button type="submit">
                                <User className="mr-2 h-4 w-4"/>
                                Create User
                             </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
