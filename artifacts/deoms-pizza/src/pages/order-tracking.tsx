import { useGetOrder } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useRoute } from "wouter";
import { CheckCircle2, Clock, Truck, ChefHat, XCircle } from "lucide-react";

export default function OrderTracking() {
  const [, params] = useRoute("/orders/:id");
  const id = parseInt(params?.id || "0");
  const { data: order, isLoading } = useGetOrder(id, { query: { enabled: !!id } });

  if (isLoading) return <MainLayout><div className="container py-16">Loading...</div></MainLayout>;
  if (!order) return <MainLayout><div className="container py-16">Order not found</div></MainLayout>;

  const steps = [
    { id: 'received', label: 'Received', icon: Clock },
    { id: 'preparing', label: 'Preparing', icon: ChefHat },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status);

  return (
    <MainLayout>
      <div className="container py-12 max-w-3xl">
        <h1 className="text-4xl font-black italic tracking-tighter mb-2 uppercase text-primary">Track Order #{order.id}</h1>
        <p className="text-muted-foreground mb-8">Estimated delivery in 30-45 minutes</p>

        <Card className="mb-8 overflow-hidden">
          <div className="bg-primary/5 p-6">
            {order.status === 'rejected' ? (
              <div className="flex flex-col items-center justify-center text-destructive py-8">
                <XCircle className="w-16 h-16 mb-4" />
                <h2 className="text-2xl font-bold">Order Cancelled</h2>
                <p>Sorry, we could not process your order.</p>
              </div>
            ) : (
              <div className="relative flex justify-between items-center py-8 px-4">
                <div className="absolute top-1/2 left-10 right-10 h-1 bg-muted -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-10 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500" 
                     style={{ width: `calc(${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}% - 20px)` }}></div>
                
                {steps.map((step, idx) => {
                  const isCompleted = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors ${
                        isCompleted ? 'bg-primary border-primary/20 text-primary-foreground' : 'bg-background border-muted text-muted-foreground'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-sm font-medium ${isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <h3 className="font-bold text-xl mb-4">Order Details</h3>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.quantity}x {item.productName}</span>
                  <span className="font-bold">₹{item.totalPrice}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between font-bold text-xl text-primary">
              <span>Total Paid</span>
              <span>₹{order.total}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}