
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { getBoard, getStaff } from "@/lib/staff";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const memberSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  title: z.string().min(3, "Title must be at least 3 characters."),
  email: z.string().email("Please enter a valid email address."),
  bio: z.string().optional(),
  image: z.any().optional(),
  type: z.enum(["staff", "board"]),
});

export default function StaffAdminPage() {
    const { toast } = useToast();
    const staff = getStaff();
    const board = getBoard();
    const allMembers = [...staff, ...board.map(b => ({...b, type: 'board'}))];

    const form = useForm<z.infer<typeof memberSchema>>({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            name: "",
            title: "",
            email: "",
            bio: "",
            image: "",
            type: "staff",
        },
    });

    function onSubmit(values: z.infer<typeof memberSchema>) {
        console.log(values);
        toast({
            title: "Member Saved!",
            description: "The staff/board member has been saved.",
        });
        form.reset();
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
                    <CardTitle className="font-headline text-2xl">Existing Staff & Board</CardTitle>
                    <CardDescription>Manage current staff and board members.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>{member.title}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Add/Edit Member</CardTitle>
                    <CardDescription>Fill out the form below to add or edit a staff or board member.</CardDescription>
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Image (optional)</FormLabel>
                                    <FormControl>
                                        <Input type="file" {...field} />
                                    </FormControl>
                                     <FormDescription>
                                        Upload a profile picture for the member.
                                    </FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <Button type="submit">
                                <UserPlus className="mr-2 h-4 w-4"/>
                                Save Member
                             </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
