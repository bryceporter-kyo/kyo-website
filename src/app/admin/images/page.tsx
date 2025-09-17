
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminImagesPage() {
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
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Image Management</CardTitle>
          <CardDescription>Manage your website's images and media assets.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section is under construction. It will soon allow you to upload, view, and organize images used across the site.</p>
        </CardContent>
      </Card>
    </div>
  );
}
