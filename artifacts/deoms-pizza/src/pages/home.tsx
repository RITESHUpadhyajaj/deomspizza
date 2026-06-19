import { MainLayout } from "@/components/layout/MainLayout";
import { useListProducts, useListCategories, useListBanners } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";

export default function Home() {
  const { data: products, isLoading: isLoadingProducts } = useListProducts({ available: true, isFeatured: true });
  const { data: categories } = useListCategories();
  const { data: banners } = useListBanners();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    if (emblaApi) {
      const autoplay = setInterval(() => {
        emblaApi.scrollNext();
      }, 4000);
      return () => clearInterval(autoplay);
    }
  }, [emblaApi]);

  return (
    <MainLayout>
      {banners && banners.length > 0 ? (
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {banners.map(banner => (
              <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative">
                <div className="aspect-[21/9] md:aspect-[3/1] relative bg-muted">
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center">
                    <div className="container">
                      <div className="max-w-xl text-white">
                        <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4 uppercase">{banner.title}</h2>
                        {banner.subtitle && <p className="text-xl md:text-2xl mb-8 opacity-90">{banner.subtitle}</p>}
                        {banner.linkUrl && (
                          <Link href={banner.linkUrl}>
                            <Button size="lg" className="text-lg px-8 rounded-full">Order Now</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <section className="bg-primary/5 py-20 relative overflow-hidden">
          <div className="container text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-black text-primary tracking-tight mb-4 uppercase italic">Deoms Pizza</h1>
            <p className="mt-2 text-xl md:text-2xl text-foreground font-medium mb-8">Hot, fresh, and unbelievably good.</p>
            <Link href="/menu">
              <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-xl hover:scale-105 transition-transform">
                Order Now
              </Button>
            </Link>
          </div>
        </section>
      )}

      {categories && categories.length > 0 && (
        <section className="container py-12">
          <h2 className="text-2xl font-bold mb-6 italic tracking-tight uppercase">Categories</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {categories.map(category => (
              <Link key={category.id} href={`/menu?category=${category.slug}`} className="flex-shrink-0 group">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform overflow-hidden relative">
                    <img src={category.icon} alt={category.name} className="w-12 h-12 object-contain" />
                  </div>
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      <section className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold italic tracking-tight uppercase">Featured Items</h2>
          <Link href="/menu">
            <Button variant="ghost">View All Menu</Button>
          </Link>
        </div>
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products?.slice(0, 8).map(product => (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 bg-muted">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-xl text-primary">₹{product.basePrice}</span>
                    <Link href={`/menu/${product.id}`}>
                      <Button size="sm" className="rounded-full font-bold">Add to Cart</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}