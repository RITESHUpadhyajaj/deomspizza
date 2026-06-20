import { useGetCart, useUpdateCartItem, useRemoveCartItem, getGetCartQueryKey, useApplyCoupon, useListCoupons } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, Tag, ChevronDown, ChevronUp, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const RESTRICTION_LABELS: Record<string, string> = {
  none: "For everyone",
  first_order: "New customers — first order",
  second_order: "Returning customers — 2nd order",
};

export default function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const queryClient = useQueryClient();
  const applyCoupon = useApplyCoupon();
  const { data: allCoupons } = useListCoupons({ query: {} as any });
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [showCouponPanel, setShowCouponPanel] = useState(false);

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItem.mutate({ id, data: { quantity: newQuantity } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        if (appliedCoupon) setAppliedCoupon(null);
      }
    });
  };

  const handleRemove = (id: number) => {
    removeItem.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        if (appliedCoupon) setAppliedCoupon(null);
      }
    });
  };

  const handleApplyCoupon = (code: string) => {
    if (!code.trim()) return;
    applyCoupon.mutate({ data: { code: code.trim().toUpperCase() } }, {
      onSuccess: (result) => {
        if (result.valid) {
          setAppliedCoupon({ code: code.trim().toUpperCase(), discount: result.discount });
          setCouponInput("");
          toast({ title: result.message });
        } else {
          toast({ title: result.message, variant: "destructive" });
        }
      }
    });
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const subtotal = cart?.subtotal ?? 0;
  const deliveryFee = cart?.deliveryFee ?? 0;
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const finalTotal = Math.max(0, subtotal + deliveryFee - couponDiscount);

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
            {/* Cart items */}
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

              {/* Coupon section */}
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <button
                    className="w-full flex items-center justify-between text-sm font-semibold"
                    onClick={() => setShowCouponPanel(v => !v)}
                    type="button"
                  >
                    <span className="flex items-center gap-2 text-primary">
                      <Tag className="w-4 h-4" />
                      {appliedCoupon ? `Coupon Applied: ${appliedCoupon.code}` : "Have a coupon code?"}
                    </span>
                    {showCouponPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showCouponPanel && (
                    <div className="mt-4 space-y-4">
                      {/* Applied coupon */}
                      {appliedCoupon && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                          <div>
                            <span className="font-bold text-green-700 dark:text-green-400 tracking-widest">{appliedCoupon.code}</span>
                            <span className="text-green-600 dark:text-green-400 text-sm ml-2">— saving ₹{appliedCoupon.discount}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={removeCoupon}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {/* Manual input */}
                      {!appliedCoupon && (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter coupon code"
                            value={couponInput}
                            onChange={e => setCouponInput(e.target.value.toUpperCase())}
                            className="flex-1"
                            onKeyDown={e => e.key === "Enter" && handleApplyCoupon(couponInput)}
                          />
                          <Button
                            variant="outline"
                            onClick={() => handleApplyCoupon(couponInput)}
                            disabled={applyCoupon.isPending || !couponInput}
                          >
                            Apply
                          </Button>
                        </div>
                      )}

                      {/* Available coupons list */}
                      {!appliedCoupon && allCoupons && allCoupons.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Available Codes</p>
                          <div className="space-y-2">
                            {allCoupons.map(coupon => (
                              <div
                                key={coupon.id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-black tracking-widest text-primary text-sm">{coupon.code}</span>
                                    <span className="text-xs font-semibold text-foreground">
                                      {coupon.discountType === "percent"
                                        ? `${coupon.discountValue}% off`
                                        : `₹${coupon.discountValue} off`}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {RESTRICTION_LABELS[coupon.usageRestriction] ?? ""}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7"
                                  onClick={() => handleApplyCoupon(coupon.code)}
                                  disabled={applyCoupon.isPending}
                                >
                                  Apply
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order summary */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-4">Order Summary</h3>

                  {/* Free delivery progress */}
                  {subtotal < 250 ? (
                    <div className="mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2">
                        Add ₹{250 - subtotal} more for <span className="text-green-600 dark:text-green-400">FREE delivery!</span>
                      </p>
                      <div className="h-2 rounded-full bg-amber-200 dark:bg-amber-900 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-green-500 transition-all duration-500"
                          style={{ width: `${Math.min((subtotal / 250) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-5 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-center">
                      <p className="text-xs font-bold text-green-700 dark:text-green-400">🎉 You've unlocked FREE delivery!</p>
                    </div>
                  )}

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Coupon ({appliedCoupon?.code})</span>
                        <span>-₹{couponDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Fee</span>
                      {deliveryFee === 0 ? (
                        <span className="text-green-600 font-semibold">FREE</span>
                      ) : (
                        <span>₹{deliveryFee}</span>
                      )}
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span className="text-primary">₹{finalTotal}</span>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="w-full rounded-full"
                    onClick={() => {
                      const qs = appliedCoupon ? `?coupon=${appliedCoupon.code}` : "";
                      setLocation(`/checkout${qs}`);
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
