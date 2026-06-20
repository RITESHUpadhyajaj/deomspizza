import { useGetCart, useCreateOrder, getGetCartQueryKey, getListMyOrdersQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const { data: cart } = useGetCart();
  const createOrder = useCreateOrder();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    landmark: "",
    pincode: "",
    specialInstructions: "",
    paymentMethod: "cod" as "cod" | "paytm" | "online"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;

    createOrder.mutate({ data: formData }, {
      onSuccess: (order) => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListMyOrdersQueryKey() });
        toast({ title: "Order placed successfully!" });
        setLocation(`/orders/${order.id}`);
      },
      onError: (err: any) => {
        toast({ title: "Failed to place order", description: err.message, variant: "destructive" });
      }
    });
  };

  if (!cart || cart.items.length === 0) {
    return <MainLayout><div className="container py-16 text-center">Your cart is empty.</div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="container py-12 max-w-5xl">
        <h1 className="text-4xl font-black italic tracking-tighter mb-8 uppercase text-primary">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-bold text-xl mb-4">Delivery Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name</Label>
                    <Input id="customerName" name="customerName" required value={formData.customerName} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Mobile Number</Label>
                    <Input id="customerPhone" name="customerPhone" required value={formData.customerPhone} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">Complete Address</Label>
                    <Textarea id="deliveryAddress" name="deliveryAddress" required value={formData.deliveryAddress} onChange={handleChange} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="landmark">Landmark (Optional)</Label>
                      <Input id="landmark" name="landmark" value={formData.landmark} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" name="pincode" required value={formData.pincode} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialInstructions">Special Instructions</Label>
                    <Textarea id="specialInstructions" name="specialInstructions" placeholder="Any specific requests?" value={formData.specialInstructions} onChange={handleChange} />
                  </div>

                  <h3 className="font-bold text-xl mt-6 mb-4">Payment Method</h3>
                  <RadioGroup value={formData.paymentMethod} onValueChange={v => setFormData(prev => ({ ...prev, paymentMethod: v as any }))}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod">Cash on Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paytm" id="paytm" />
                      <Label htmlFor="paytm">Paytm / UPI on Delivery</Label>
                    </div>
                  </RadioGroup>

                  <Button type="submit" size="lg" className="w-full mt-6 rounded-full" disabled={createOrder.isPending}>
                    {createOrder.isPending ? "Processing..." : `Place Order (₹${cart.total})`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6 bg-muted/30">
                <h3 className="font-bold text-xl mb-4">Order Summary</h3>
                <div className="space-y-4 mb-6">
                  {cart.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.quantity}x {item.productName}</span>
                        {item.size && <div className="text-muted-foreground text-xs">{item.size}</div>}
                      </div>
                      <span className="font-medium text-primary">₹{item.totalPrice}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Subtotal</span>
                    <span>₹{cart.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Delivery Fee</span>
                    {cart.deliveryFee === 0 ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      <span>₹{cart.deliveryFee}</span>
                    )}
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-xl mt-2">
                    <span>Total</span>
                    <span className="text-primary">₹{cart.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}