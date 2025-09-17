import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AdminSidebar from './_components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex flex-1">
        <Sidebar>
          <AdminSidebar />
        </Sidebar>
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
