import { useListMyOrders } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Orders() {
  const { data: orders, isLoading } = useListMyOrders();

  return (
    <MainLayout>
      <div className="container py-12 max-w-4xl">
        <h1 className="text-4xl font-black italic tracking-tighter mb-8 uppercase text-primary">Your Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>)}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
            <Link href="/menu">
              <Button size="lg" className="rounded-full">Order Now</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                    <p className="text-sm text-muted-foreground">{format(new Date(order.createdAt), "PPP p")}</p>
                  </div>
                  <Badge variant={
                    order.status === 'delivered' ? 'default' : 
                    order.status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {order.status.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-sm mb-4">
                    {order.items.map(item => `${item.quantity}x ${item.productName}`).join(", ")}
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="font-bold text-lg text-primary">₹{order.total}</span>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline">Track Order</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}