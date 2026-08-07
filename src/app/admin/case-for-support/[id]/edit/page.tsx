"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGrant, updateGrant, GrantSchemaType } from '@/lib/case-for-support';
import { GrantEditorForm } from '@/components/admin/case-for-support/GrantEditorForm';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditCaseForSupportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [initialData, setInitialData] = useState<Partial<GrantSchemaType> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unwrappedParams, setUnwrappedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(p => setUnwrappedParams(p));
  }, [params]);

  useEffect(() => {
    const loadGrant = async () => {
      if (!unwrappedParams?.id) return;
      try {
        const data = await getGrant(unwrappedParams.id);
        if (data) {
          setInitialData(data as any);
        } else {
          toast({ title: "Grant not found", variant: "destructive" });
          router.push('/admin/case-for-support');
        }
      } catch (err) {
        console.error(err);
        toast({ title: "Error loading grant", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    loadGrant();
  }, [unwrappedParams, router, toast]);

  const handleSubmit = async (values: GrantSchemaType) => {
    if (!unwrappedParams?.id) return;
    setIsSubmitting(true);
    try {
      await updateGrant(unwrappedParams.id, values);
      toast({ title: "Grant updated successfully!" });
      router.push('/admin/case-for-support');
    } catch (err: any) {
      toast({
        title: "Error updating grant",
        description: err.message || "Something went wrong.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/case-for-support');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-5xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="rounded-full">
          <Link href="/admin/case-for-support">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-bold">Edit Grant Profile</h1>
          <p className="text-sm text-muted-foreground">Updating: {initialData?.funderName} ({initialData?.grantCycleYear})</p>
        </div>
      </div>

      {initialData && (
        <GrantEditorForm 
          initialValues={initialData}
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
