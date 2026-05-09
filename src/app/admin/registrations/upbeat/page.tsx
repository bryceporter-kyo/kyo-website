
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { FormEditor } from "@/components/admin/FormEditor/FormEditor";
import { getRegistrationForm, saveRegistrationForm } from "@/lib/registration-form-service";
import { RegistrationFormConfig } from "@/lib/registration-form";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";

export default function AdminUpbeatRegistrationPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [config, setConfig] = useState<RegistrationFormConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getRegistrationForm("upbeat")
      .then(setConfig)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (updated: RegistrationFormConfig) => {
    await saveRegistrationForm(updated, user?.email ?? undefined);
    setConfig(updated);
    toast({ title: "Form saved", description: "UpBeat registration form updated successfully." });
  };

  return (
    <div className="container mx-auto py-12 max-w-3xl">
      <Button asChild variant="outline" className="mb-8">
        <Link href="/admin/registrations">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Registration Forms
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline mb-2">UpBeat Program — Form Editor</h1>
        <p className="text-muted-foreground">
          Build the registration form for the UpBeat program. Changes are saved to Firestore and
          immediately reflected on the public registration page when the form is set to Open.
        </p>
      </div>

      {isLoading || !config ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <FormEditor
          initialConfig={config}
          onSave={handleSave}
          publicUrl="/programs/upbeat/registration"
        />
      )}
    </div>
  );
}
