import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Heart, LogOut, Pizza, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useLogout } from "@workspace/api-client-react";
import { useTheme } from "../ThemeProvider";

export function Navbar() {
  const { data: user } = useGetMe({ query: { retry: false }});
  const logout = useLogout();
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        queryClient.clear();
        setLocation("/");
      }
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary font-sans italic tracking-tighter">
          <Pizza className="w-8 h-8" />
          DEOMS
        </Link>
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/menu" className="text-sm font-medium hover:text-primary transition-colors">Menu</Link>
          <Link href="/search" className="text-sm font-medium hover:text-primary transition-colors">Search</Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">Contact</Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>

          {user ? (
            <>
              <Link href="/favorites" className="hidden md:flex">
                <Button variant="ghost" size="icon">
                  <Heart className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/orders">
                <Button variant="ghost" size="sm">Orders</Button>
              </Link>
              {user.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">Admin</Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout} disabled={logout.isPending}>
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}