import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome to the KYO Hub Admin Panel.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Manage announcements, events, and images.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This section is under construction. Future updates will allow you to edit site content directly from here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Administer user accounts and permissions.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">This section is under construction. User authentication and roles will be managed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}