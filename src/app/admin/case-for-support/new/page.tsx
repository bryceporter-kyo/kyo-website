"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addGrant, GrantSchemaType } from '@/lib/case-for-support';
import { GrantEditorForm } from '@/components/admin/case-for-support/GrantEditorForm';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewCaseForSupportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: GrantSchemaType) => {
    setIsSubmitting(true);
    try {
      await addGrant(values);
      toast({ title: "Grant created successfully!" });
      router.push('/admin/case-for-support');
    } catch (err: any) {
      toast({
        title: "Error creating grant",
        description: err.message || "Something went wrong.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/case-for-support');
  };

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-5xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="rounded-full">
          <Link href="/admin/case-for-support">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-bold">New Grant Profile</h1>
          <p className="text-sm text-muted-foreground">Configure dynamic fields and narrative content.</p>
        </div>
      </div>

      <GrantEditorForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
