
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClipboardList, Music, MusicIcon, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";

const registrationForms = [
  {
    href: "/admin/registrations/orchestras",
    label: "Orchestra Program",
    description: "Manage the registration form for the KYO Orchestra program.",
    icon: Music,
  },
  {
    href: "/admin/registrations/upbeat",
    label: "UpBeat Program",
    description: "Manage the registration form for the UpBeat program.",
    icon: MusicIcon,
  },
];

export default function AdminRegistrationsPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Button asChild variant="outline" className="mb-6 mr-3">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>
          <Button asChild variant="secondary" className="mb-6">
            <Link href="/admin/registrations/setup">
              <BookOpen className="mr-2 h-4 w-4" />
              Setup Instructions
            </Link>
          </Button>
          <h1 className="text-3xl font-bold font-headline mb-2">Registration Forms</h1>
          <p className="text-muted-foreground">
            Configure and manage the integrated registration forms for each program.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {registrationForms.map((form) => (
          <Link href={form.href} key={form.href} className="group">
            <Card className="group-hover:border-primary group-hover:shadow-lg transition-all h-full flex flex-col justify-center">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-4 bg-primary text-primary-foreground rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/90 flex-shrink-0">
                  <form.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-headline font-semibold group-hover:text-primary transition-colors">
                    {form.label}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
