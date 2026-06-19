import { useGetMe } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, ShoppingBag, Image as ImageIcon, Settings, LogOut, Pizza } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetMe({ query: { retry: false }});
  const [location, setLocation] = useLocation();
  const logout = useLogout();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      setLocation("/login");
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!user || user.role !== 'admin') return null;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        queryClient.clear();
        setLocation("/");
      }
    });
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/banners", label: "Banners", icon: ImageIcon },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-muted/20">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary font-sans italic tracking-tighter">
            <Pizza className="w-6 h-6" />
            DEOMS Admin
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== '/admin' && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  className={`w-full justify-start ${isActive ? 'font-bold' : ''}`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}