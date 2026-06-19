import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    shopAddress: "",
    ownerPhone: "",
    whatsappNumber: "",
    deliveryFee: 0,
    minOrderAmount: 0,
    paytmUpi: ""
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        shopAddress: settings.shopAddress,
        ownerPhone: settings.ownerPhone,
        whatsappNumber: settings.whatsappNumber,
        deliveryFee: settings.deliveryFee,
        minOrderAmount: settings.minOrderAmount,
        paytmUpi: settings.paytmUpi || ""
      });
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "deliveryFee" || name === "minOrderAmount" ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: "Settings updated successfully" });
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Failed to update", description: err.message, variant: "destructive" });
      }
    });
  };

  if (isLoading) return <AdminLayout><div className="p-8">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-8 max-w-2xl">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-primary mb-8">Store Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shopAddress">Shop Address</Label>
                <Textarea id="shopAddress" name="shopAddress" value={formData.shopAddress} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerPhone">Contact Phone</Label>
                  <Input id="ownerPhone" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <Input id="whatsappNumber" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryFee">Delivery Fee (₹)</Label>
                  <Input id="deliveryFee" name="deliveryFee" type="number" value={formData.deliveryFee} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minOrderAmount">Min Order Amount (₹)</Label>
                  <Input id="minOrderAmount" name="minOrderAmount" type="number" value={formData.minOrderAmount} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paytmUpi">Paytm / UPI ID</Label>
                <Input id="paytmUpi" name="paytmUpi" value={formData.paytmUpi} onChange={handleChange} />
              </div>
              <Button type="submit" disabled={updateSettings.isPending}>
                {updateSettings.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}