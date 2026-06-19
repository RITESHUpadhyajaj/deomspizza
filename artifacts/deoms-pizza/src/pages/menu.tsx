import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { data: categories } = useListCategories();
  const { data: products, isLoading } = useListProducts({ 
    available: true, 
    category: selectedCategory || undefined 
  });

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-4xl font-black italic text-primary uppercase mb-8">Our Menu</h1>
        
        <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
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
              <div key={i} className="h-64 bg-muted animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.map(product => (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 bg-muted">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  <Badge className="absolute top-2 right-2" variant={product.isVeg ? "secondary" : "destructive"}>
                    {product.isVeg ? "Veg" : "Non-Veg"}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <span className="font-bold text-primary">₹{product.basePrice}</span>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {product.description}
                  </p>
                  <Link href={`/menu/${product.id}`}>
                    <Button className="w-full">View Details</Button>
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