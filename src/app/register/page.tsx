"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/shared/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const registrationSchema = z.object({
  studentFirstName: z.string().min(2, "First name is too short."),
  studentLastName: z.string().min(2, "Last name is too short."),
  studentAge: z.coerce.number().min(5, "Student must be at least 5.").max(18, "Student must be 18 or younger."),
  parentFirstName: z.string().min(2, "First name is too short."),
  parentLastName: z.string().min(2, "Last name is too short."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Please enter a valid phone number."),
  program: z.string({ required_error: "Please select a program." }),
});

export default function RegisterPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      studentFirstName: "",
      studentLastName: "",
      parentFirstName: "",
      parentLastName: "",
      email: "",
      phone: "",
    },
  });

  function onSubmit(values: z.infer<typeof registrationSchema>) {
    console.log(values);
    toast({
      title: "Registration Submitted!",
      description: "Thank you for registering. We will be in touch shortly.",
    });
    form.reset();
  }
  
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-register');

  return (
    <div>
       <PageHeader
        title="Register for a Program"
        subtitle="Join the KYO Hub community and start your musical journey."
        image={headerImage}
      />
      <section className="container mx-auto">
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Enrollment Form</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium font-headline">Student Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="studentFirstName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Student&apos;s First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Jane" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="studentLastName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Student&apos;s Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="studentAge"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Student&apos;s Age</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="14" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium font-headline">Parent/Guardian Information</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="parentFirstName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Parent/Guardian&apos;s First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="parentLastName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Parent/Guardian&apos;s Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input type="tel" placeholder="(123) 456-7890" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <div className="space-y-4">
                        <h3 className="text-lg font-medium font-headline">Program Selection</h3>
                        <FormField
                            control={form.control}
                            name="program"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Program of Interest</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a program" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="orchestra-audition">Orchestra Audition</SelectItem>
                                    <SelectItem value="upbeat">Upbeat! Program</SelectItem>
                                    <SelectItem value="lessons">Lessons Program</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Select the program you wish to register for. Auditions are required for orchestras.
                                </FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <Button type="submit" size="lg">Submit Registration</Button>
                </form>
                </Form>
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
