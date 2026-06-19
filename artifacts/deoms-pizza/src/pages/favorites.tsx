import { useListFavorites, useRemoveFavorite, getListFavoritesQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

export default function Favorites() {
  const { data: favorites, isLoading } = useListFavorites();
  const removeFavorite = useRemoveFavorite();
  const queryClient = useQueryClient();

  const handleRemove = (productId: number) => {
    removeFavorite.mutate({ productId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() })
    });
  };

  return (
    <MainLayout>
      <div className="container py-12">
        <h1 className="text-4xl font-black italic tracking-tighter mb-8 uppercase text-primary">Your Favorites</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : !favorites || favorites.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">No favorites yet</h2>
            <p className="text-muted-foreground mb-8">Save your favorite meals to order them quickly.</p>
            <Link href="/menu">
              <Button size="lg" className="rounded-full px-8">Explore Menu</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map(product => (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 relative">
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full shadow-md"
                  onClick={() => handleRemove(product.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="relative h-48 bg-muted">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  <Badge className="absolute top-2 left-2" variant={product.isVeg ? "secondary" : "destructive"}>
                    {product.isVeg ? "Veg" : "Non-Veg"}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg line-clamp-1 pr-2">{product.name}</h3>
                    <span className="font-bold text-primary shrink-0">₹{product.basePrice}</span>
                  </div>
                  <Link href={`/menu/${product.id}`}>
                    <Button className="w-full mt-4">View & Order</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}