import { ShoppingCart } from "lucide-react";
import { useGetCart } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";

export function FloatingCart() {
  const { data: cart } = useGetCart();
  const [location] = useLocation();

  if (location === "/cart" || location === "/checkout" || location.startsWith("/admin")) {
    return null;
  }

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const itemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Link href="/cart" className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-110 transition-transform">
      <div className="relative">
        <ShoppingCart className="w-8 h-8" />
        <span className="absolute -top-3 -right-3 bg-secondary text-secondary-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-primary">
          {itemCount}
        </span>
      </div>
    </Link>
  );
}