"use client";

import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { saveLegalPage } from "@/lib/legal-pages";
import LegalPageForm, { legalPageSchema } from "@/components/admin/LegalPageForm";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateLegalPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    async function onSubmit(values: z.infer<typeof legalPageSchema>) {
        setIsSaving(true);
        try {
            const pageData = {
                ...values,
                lastUpdated: new Date().toISOString(),
            };
            
            await saveLegalPage(pageData);
            toast({ title: "Page Created", description: `"${values.title}" has been saved.` });
            router.push('/admin/legal');
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to save legal page.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="container mx-auto py-12 max-w-4xl">
            <div className="mb-8">
                <Button asChild variant="outline">
                    <Link href="/admin/legal">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Legal Admin
                    </Link>
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Create New Policy</CardTitle>
                    <CardDescription>Draft a new legal policy or document.</CardDescription>
                </CardHeader>
                <CardContent>
                    <LegalPageForm onSubmit={onSubmit} isSaving={isSaving} />
                </CardContent>
            </Card>
        </div>
    );
}
