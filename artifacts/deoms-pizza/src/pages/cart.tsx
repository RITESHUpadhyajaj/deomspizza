import { useGetCart, useUpdateCartItem, useRemoveCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export default function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const queryClient = useQueryClient();

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItem.mutate({ id, data: { quantity: newQuantity } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
    });
  };

  const handleRemove = (id: number) => {
    removeItem.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
    });
  };

  return (
    <MainLayout>
      <div className="container py-12 max-w-4xl">
        <h1 className="text-4xl font-black italic tracking-tighter mb-8 uppercase text-primary">Your Cart</h1>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-muted rounded-xl"></div>
            <div className="h-24 bg-muted rounded-xl"></div>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything delicious yet.</p>
            <Link href="/menu">
              <Button size="lg" className="rounded-full px-8">Browse Menu</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cart.items.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <img src={item.productImage} alt={item.productName} className="w-20 h-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{item.productName}</h3>
                      {item.size && <p className="text-sm text-muted-foreground">Size: {item.size}</p>}
                      <div className="font-bold mt-1 text-primary">₹{item.unitPrice}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-full p-1 bg-background">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemove(item.id)}>
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-4">Order Summary</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{cart.subtotal}</span>
                    </div>
                    {cart.discount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount</span>
                        <span>-₹{cart.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Fee</span>
                      <span>₹{cart.deliveryFee}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span className="text-primary">₹{cart.total}</span>
                    </div>
                  </div>
                  <Link href="/checkout">
                    <Button size="lg" className="w-full rounded-full">Proceed to Checkout</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}