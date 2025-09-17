import PageHeader from "@/components/shared/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InternalPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-internal');
  return (
    <div>
      <PageHeader
        title="KYO Internal Resources"
        subtitle="This section is for internal staff, board, and volunteer use."
        image={headerImage}
      />
      <section className="container mx-auto">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Internal Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This page is under construction. It will soon house resources for KYO's internal teams.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
