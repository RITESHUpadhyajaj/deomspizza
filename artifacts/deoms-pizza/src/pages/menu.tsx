import {
  useListProducts,
  useListCategories,
  useAddCartItem,
  getGetCartQueryKey,
  useGetMe,
} from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Menu() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [selectedCategory, setSelectedCategory] = useState<string>(params.get("category") || "");
  const { data: categories } = useListCategories();
  const { data: products, isLoading } = useListProducts({
    available: true,
    category: selectedCategory || undefined,
  });
  const { data: user } = useGetMe({ query: { retry: false } });
  const addCartItem = useAddCartItem();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    const cat = new URLSearchParams(search).get("category") || "";
    setSelectedCategory(cat);
  }, [search]);

  const handleAddToCart = (productId: number, productName: string, hasOptions: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setLocation(`/login?redirect=/menu`);
      return;
    }
    if (hasOptions) {
      setLocation(`/menu/${productId}`);
      return;
    }
    setAddingId(productId);
    addCartItem.mutate(
      { data: { productId, quantity: 1 } },
      {
        onSuccess: () => {
          toast({ title: "Added to cart! 🛒", description: `${productName} added.` });
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        },
        onError: () => {
          toast({ title: "Could not add to cart", description: "Please try again.", variant: "destructive" });
        },
        onSettled: () => setAddingId(null),
      }
    );
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-4xl font-black italic text-primary uppercase mb-8">Our Menu</h1>

        {/* Category filter */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 hide-scrollbar">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            onClick={() => setSelectedCategory("")}
            className="rounded-full shrink-0"
          >
            All Items
          </Button>
          {categories?.map(c => (
            <Button
              key={c.id}
              variant={selectedCategory === c.slug ? "default" : "outline"}
              onClick={() => setSelectedCategory(c.slug)}
              className="rounded-full shrink-0"
            >
              {c.name}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.map(product => {
              const hasOptions = !!(product.sizeOptions && product.sizeOptions.length > 0);
              const isAdding = addingId === product.id;

              return (
                <Link key={product.id} href={`/menu/${product.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                    <div className="relative h-48 bg-muted overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge
                        className="absolute top-2 right-2"
                        variant={product.isVeg ? "secondary" : "destructive"}
                      >
                        {product.isVeg ? "Veg" : "Non-Veg"}
                      </Badge>
                    </div>
                    <CardContent className="p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
                        <span className="font-bold text-primary shrink-0 ml-2">₹{product.basePrice}</span>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2 flex-1">{product.description}</p>
                      <Button
                        className="w-full mt-2 gap-2"
                        size="sm"
                        disabled={isAdding}
                        onClick={e => handleAddToCart(product.id, product.name, hasOptions, e)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {isAdding ? "Adding…" : hasOptions ? "Choose Size" : "Add to Cart"}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
