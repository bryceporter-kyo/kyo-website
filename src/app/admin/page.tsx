
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Users, Image as ImageIcon, Calendar, UsersRound, Link2, Pointer } from "lucide-react";
import Link from "next/link";

const adminTiles = [
    { href: "/admin/announcements", label: "Announcements", icon: Newspaper },
    { href: "/admin/images", label: "Images", icon: ImageIcon },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/staff", label: "Staff & Board", icon: UsersRound },
    { href: "/admin/links", label: "External Links", icon: Link2 },
    { href: "/admin/buttons", label: "Buttons", icon: Pointer },
]

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold font-headline mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Manage your site content and users.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminTiles.map((tile) => (
          <Link href={tile.href} key={tile.href} className="group">
            <Card className="group-hover:border-primary group-hover:shadow-lg transition-all h-full flex flex-col justify-center items-center text-center">
              <CardHeader className="items-center">
                <div className="p-4 bg-primary text-primary-foreground rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/90">
                  <tile.icon className="w-8 h-8" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-xl font-headline">{tile.label}</CardTitle>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
