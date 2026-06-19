import { useListProducts } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";
import { SearchIcon } from "lucide-react";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: products, isLoading } = useListProducts({ 
    search: searchTerm || undefined 
  }, { query: { enabled: searchTerm.length > 0 } });

  return (
    <MainLayout>
      <div className="container py-12 max-w-5xl">
        <h1 className="text-4xl font-black italic tracking-tighter mb-8 uppercase text-primary">Find Your Craving</h1>
        
        <div className="relative mb-12">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          <Input 
            className="pl-14 h-14 text-lg rounded-full bg-card shadow-sm border-2 border-transparent focus-visible:border-primary focus-visible:ring-0" 
            placeholder="Search for pizza, burger, pasta..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {searchTerm.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            Type something to start searching.
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">No results found</h2>
            <p className="text-muted-foreground">We couldn't find anything matching "{searchTerm}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map(product => (
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
                  <Link href={`/menu/${product.id}`}>
                    <Button className="w-full mt-4">Order Now</Button>
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