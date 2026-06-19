import { useGetProduct, useAddCartItem, getGetCartQueryKey, useGetMe } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRoute, useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, ShoppingCart } from "lucide-react";

export default function ProductDetail() {
  const [, params] = useRoute("/menu/:id");
  const id = parseInt(params?.id || "0");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: product, isLoading } = useGetProduct(id, { query: { enabled: !!id } as any });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: user } = useGetMe({ query: { retry: false } as any });
  const addCartItem = useAddCartItem();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-16">
          <div className="animate-pulse h-96 bg-muted rounded-2xl" />
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">Product not found.</div>
      </MainLayout>
    );
  }

  const currentPrice = selectedSize
    ? product.sizeOptions?.find(s => s.size === selectedSize)?.price ?? product.basePrice
    : product.basePrice;

  const handleAddToCart = () => {
    if (!user) {
      setLocation(`/login?redirect=/menu/${id}`);
      return;
    }
    addCartItem.mutate(
      { data: { productId: product.id, quantity, size: selectedSize || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Added to cart! 🛒", description: `${quantity}× ${product.name} added.` });
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        },
        onError: () => {
          toast({ title: "Could not add to cart", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <MainLayout>
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden aspect-square shadow-2xl">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            <Badge
              className="absolute top-4 right-4 text-lg py-1 px-3"
              variant={product.isVeg ? "secondary" : "destructive"}
            >
              {product.isVeg ? "🟢 Vegetarian" : "🔴 Non-Veg"}
            </Badge>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-4">{product.name}</h1>
            <p className="text-muted-foreground text-lg mb-6">{product.description}</p>

            <div className="text-4xl font-bold text-primary mb-8">₹{currentPrice}</div>

            {product.sizeOptions && product.sizeOptions.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold mb-3">Choose Size</h3>
                <div className="flex gap-3 flex-wrap">
                  {product.sizeOptions.map(option => (
                    <Button
                      key={option.size}
                      variant={selectedSize === option.size ? "default" : "outline"}
                      onClick={() => setSelectedSize(option.size)}
                      className="rounded-full"
                    >
                      {option.size} — ₹{option.price}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center border rounded-full p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button
                size="lg"
                className="flex-1 text-lg rounded-full py-6 gap-2"
                onClick={handleAddToCart}
                disabled={addCartItem.isPending}
              >
                <ShoppingCart className="w-5 h-5" />
                {addCartItem.isPending ? "Adding…" : user ? "Add to Cart" : "Login to Add"}
              </Button>
            </div>

            {!user && (
              <p className="text-sm text-muted-foreground">
                You need to{" "}
                <a href={`/login?redirect=/menu/${id}`} className="text-primary font-semibold underline">
                  log in
                </a>{" "}
                to add items to your cart.
              </p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
