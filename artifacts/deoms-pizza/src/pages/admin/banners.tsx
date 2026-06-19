import { useListBanners, useDeleteBanner, getListBannersQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminBanners() {
  const { data: banners, isLoading } = useListBanners();
  const deleteBanner = useDeleteBanner();
  const queryClient = useQueryClient();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure?")) {
      deleteBanner.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() })
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-primary">Banners</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Banner
          </Button>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners?.map(banner => (
              <Card key={banner.id} className="overflow-hidden">
                <div className="relative h-48 bg-muted">
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{banner.title}</h3>
                    {banner.subtitle && <p className="text-sm text-muted-foreground">{banner.subtitle}</p>}
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(banner.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}