import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useListCoupons, useCreateCoupon, getListCouponsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tag, Plus, CheckCircle2, XCircle } from "lucide-react";

const RESTRICTION_LABELS: Record<string, string> = {
  none: "Anyone",
  first_order: "First order only",
  second_order: "Second order only",
};

const RESTRICTION_COLORS: Record<string, string> = {
  none: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  first_order: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  second_order: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

export default function AdminCoupons() {
  const { data: coupons, isLoading } = useListCoupons({ query: {} as any });
  const createCoupon = useCreateCoupon();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    code: "",
    discountType: "percent" as "percent" | "flat",
    discountValue: "",
    usageRestriction: "none" as "none" | "first_order" | "second_order",
    isActive: true,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) return;
    createCoupon.mutate(
      {
        data: {
          code: form.code.toUpperCase().trim(),
          discountType: form.discountType,
          discountValue: parseFloat(form.discountValue),
          usageRestriction: form.usageRestriction,
          isActive: form.isActive,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCouponsQueryKey() });
          toast({ title: "Coupon created!" });
          setForm({ code: "", discountType: "percent", discountValue: "", usageRestriction: "none", isActive: true });
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.message ?? "Could not create coupon", variant: "destructive" });
        },
      }
    );
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-black italic tracking-tighter mb-6 text-primary uppercase">Coupon Codes</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Coupon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1">
                  <Label>Code</Label>
                  <Input
                    placeholder="e.g. SAVE20"
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Discount Type</Label>
                    <select
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={form.discountType}
                      onChange={e => setForm(f => ({ ...f, discountType: e.target.value as any }))}
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Discount Value</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        {form.discountType === "percent" ? "%" : "₹"}
                      </span>
                      <Input
                        type="number"
                        min={1}
                        max={form.discountType === "percent" ? 100 : undefined}
                        placeholder="10"
                        className="pl-7"
                        value={form.discountValue}
                        onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Who can use it?</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={form.usageRestriction}
                    onChange={e => setForm(f => ({ ...f, usageRestriction: e.target.value as any }))}
                  >
                    <option value="none">Anyone</option>
                    <option value="first_order">First order only (new customers)</option>
                    <option value="second_order">Second order only (returning customers)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <Label htmlFor="isActive">Active (visible to customers)</Label>
                </div>
                <Button type="submit" className="w-full" disabled={createCoupon.isPending}>
                  {createCoupon.isPending ? "Creating..." : "Create Coupon"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Coupon list */}
          <div className="space-y-3">
            <h2 className="font-bold text-lg">All Coupons</h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !coupons || coupons.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No coupons yet. Create one!</p>
              </div>
            ) : (
              coupons.map(coupon => (
                <Card key={coupon.id} className="border">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black tracking-widest text-primary text-lg">{coupon.code}</span>
                        {coupon.isActive ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">
                          {coupon.discountType === "percent"
                            ? `${coupon.discountValue}% off`
                            : `₹${coupon.discountValue} off`}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RESTRICTION_COLORS[coupon.usageRestriction]}`}>
                          {RESTRICTION_LABELS[coupon.usageRestriction]}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
