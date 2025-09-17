"use client"

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/icons/Logo"
import { LayoutDashboard, Newspaper, Image as ImageIcon, Calendar, Users, Home } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/announcements", label: "Announcements", icon: Newspaper },
    { href: "/admin/images", label: "Images", icon: ImageIcon },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: "/admin/users", label: "Users", icon: Users },
]

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <>
            <SidebarHeader>
                <div className="flex items-center justify-between">
                    <Logo />
                    <SidebarTrigger />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {links.map(link => (
                         <SidebarMenuItem key={link.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === link.href}
                                tooltip={link.label}
                            >
                                <Link href={link.href}>
                                    <link.icon />
                                    <span>{link.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    <SidebarSeparator />
                     <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Back to Site"
                        >
                            <Link href="/">
                                <Home />
                                <span>Back to Site</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </>
    )
}