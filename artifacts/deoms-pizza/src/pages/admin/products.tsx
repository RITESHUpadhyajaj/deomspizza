import {
  useListProducts,
  useDeleteProduct,
  useCreateProduct,
  useUpdateProduct,
  useListCategories,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SizeRow { size: string; price: string }

interface FormState {
  name: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  basePrice: string;
  isVeg: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  sizes: SizeRow[];
}

const empty: FormState = {
  name: "",
  description: "",
  imageUrl: "",
  categoryId: "",
  basePrice: "",
  isVeg: true,
  isAvailable: true,
  isFeatured: false,
  sizes: [],
};

export default function AdminProducts() {
  const { data: products, isLoading } = useListProducts();
  const { data: categories } = useListCategories();
  const deleteProduct = useDeleteProduct();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const openCreate = () => {
    setEditingId(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (product: NonNullable<typeof products>[number]) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      categoryId: String(product.categoryId),
      basePrice: String(product.basePrice),
      isVeg: product.isVeg,
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured ?? false,
      sizes: product.sizeOptions?.map(s => ({ size: s.size, price: String(s.price) })) ?? [],
    });
    setOpen(true);
  };

  const addSize = () => setForm(f => ({ ...f, sizes: [...f.sizes, { size: "", price: "" }] }));
  const removeSize = (i: number) => setForm(f => ({ ...f, sizes: f.sizes.filter((_, idx) => idx !== i) }));
  const updateSize = (i: number, field: keyof SizeRow, value: string) =>
    setForm(f => ({ ...f, sizes: f.sizes.map((s, idx) => idx === i ? { ...s, [field]: value } : s) }));

  const buildPayload = () => ({
    name: form.name.trim(),
    description: form.description.trim(),
    imageUrl: form.imageUrl.trim(),
    categoryId: Number(form.categoryId),
    basePrice: Number(form.basePrice),
    isVeg: form.isVeg,
    isAvailable: form.isAvailable,
    isFeatured: form.isFeatured,
    sizeOptions: form.sizes
      .filter(s => s.size.trim() && s.price.trim())
      .map(s => ({ size: s.size.trim(), price: Number(s.price) })),
  });

  const handleSave = () => {
    if (!form.name || !form.categoryId || !form.basePrice) {
      toast({ title: "Missing fields", description: "Name, category and base price are required.", variant: "destructive" });
      return;
    }
    const data = buildPayload();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });

    if (editingId) {
      updateProduct.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            toast({ title: "Product updated ✅" });
            invalidate();
            setOpen(false);
          },
          onError: () => toast({ title: "Update failed", variant: "destructive" }),
        }
      );
    } else {
      createProduct.mutate(
        { data },
        {
          onSuccess: () => {
            toast({ title: "Product created ✅" });
            invalidate();
            setOpen(false);
          },
          onError: () => toast({ title: "Create failed", variant: "destructive" }),
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this product?")) {
      deleteProduct.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Product deleted" });
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          },
        }
      );
    }
  };

  const isSaving = createProduct.isPending || updateProduct.isPending;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-primary">Products</h1>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <div key={i} className="h-56 bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.map(product => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative h-40 bg-muted">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  <Badge className="absolute top-2 right-2" variant={product.isAvailable ? "default" : "secondary"}>
                    {product.isAvailable ? "Available" : "Hidden"}
                  </Badge>
                  {product.isFeatured && (
                    <Badge className="absolute top-2 left-2" variant="secondary">Featured</Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold line-clamp-1" title={product.name}>{product.name}</h3>
                    <span className="font-bold text-primary shrink-0 ml-2">₹{product.basePrice}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{product.categoryName}</p>
                  <p className="text-xs text-muted-foreground mb-4">{product.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(product)}>
                      <Edit2 className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase">
              {editingId ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1">
              <Label>Product Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Paneer Pizza" />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" />
            </div>

            {/* Image URL */}
            <div className="space-y-1">
              <Label>Image URL</Label>
              <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
              {form.imageUrl && (
                <img src={form.imageUrl} alt="preview" className="h-20 w-full object-cover rounded-lg mt-1" onError={e => (e.currentTarget.style.display = "none")} />
              )}
            </div>

            {/* Category + Base Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Category *</Label>
                <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Base Price (₹) *</Label>
                <Input type="number" min="0" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} placeholder="149" />
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Veg</Label>
                <Switch checked={form.isVeg} onCheckedChange={v => setForm(f => ({ ...f, isVeg: v }))} />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Available</Label>
                <Switch checked={form.isAvailable} onCheckedChange={v => setForm(f => ({ ...f, isAvailable: v }))} />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Featured</Label>
                <Switch checked={form.isFeatured} onCheckedChange={v => setForm(f => ({ ...f, isFeatured: v }))} />
              </div>
            </div>

            {/* Size Options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Size Options</Label>
                <Button type="button" size="sm" variant="outline" onClick={addSize}>
                  <Plus className="w-3 h-3 mr-1" /> Add Size
                </Button>
              </div>
              {form.sizes.length === 0 && (
                <p className="text-xs text-muted-foreground">No size options — base price will be used.</p>
              )}
              {form.sizes.map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    placeholder="Size (e.g. Small)"
                    value={s.size}
                    onChange={e => updateSize(i, "size", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    min="0"
                    value={s.price}
                    onChange={e => updateSize(i, "price", e.target.value)}
                    className="w-24"
                  />
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeSize(i)}>
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : editingId ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
