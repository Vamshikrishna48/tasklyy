import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { AdminSidebar } from "@/pages/admin/AdminSidebar";

const AdminLayout = () => {
  const { isAdmin } = useApp();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full shadow-card">
          <CardContent className="p-6 space-y-3 text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">Admin Access Only</h1>
            <p className="text-sm text-muted-foreground">
              This panel is restricted. Ask the platform owner to grant your email admin access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b bg-card/80 backdrop-blur-lg px-4 gap-3">
            <span className="font-display font-semibold text-foreground">Taskly Admin Panel</span>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;

