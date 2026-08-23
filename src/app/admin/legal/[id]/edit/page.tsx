"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { saveLegalPage, fetchLegalPageById, type LegalPage } from "@/lib/legal-pages";
import LegalPageForm, { legalPageSchema } from "@/components/admin/LegalPageForm";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { use } from "react";

export default function EditLegalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { toast } = useToast();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [pageData, setPageData] = useState<LegalPage | null>(null);

    useEffect(() => {
        async function loadPage() {
            setIsLoading(true);
            try {
                const data = await fetchLegalPageById(id);
                if (data) {
                    setPageData(data);
                } else {
                    toast({
                        title: "Not Found",
                        description: "The legal page could not be found.",
                        variant: "destructive",
                    });
                    router.push('/admin/legal');
                }
            } catch (error) {
                console.error(error);
                toast({
                    title: "Error",
                    description: "Failed to load legal page.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }
        loadPage();
    }, [id, router, toast]);

    async function onSubmit(values: z.infer<typeof legalPageSchema>) {
        setIsSaving(true);
        try {
            const dataToSave = {
                ...values,
                lastUpdated: new Date().toISOString(),
            };
            
            await saveLegalPage(dataToSave, id);
            toast({ title: "Page Updated", description: `"${values.title}" has been updated.` });
            router.push('/admin/legal');
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to update legal page.",
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
                    <CardTitle className="font-headline text-2xl">Edit Policy</CardTitle>
                    <CardDescription>Update the legal policy or document.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        pageData && <LegalPageForm initialData={pageData} onSubmit={onSubmit} isSaving={isSaving} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
