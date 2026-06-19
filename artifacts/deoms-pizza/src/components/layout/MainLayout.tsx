import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FloatingCart } from "../FloatingCart";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingCart />
    </div>
  );
}