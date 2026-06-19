import { useListAllOrders, useUpdateOrderStatus, getListAllOrdersQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { OrderStatusUpdateStatus } from "@workspace/api-client-react";

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: orders, isLoading } = useListAllOrders(statusFilter !== 'all' ? { status: statusFilter } : undefined);
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();

  const handleStatusChange = (id: number, status: OrderStatusUpdateStatus) => {
    updateStatus.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAllOrdersQueryKey() });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-primary">Manage Orders</h1>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div>Loading orders...</div>
        ) : (
          <div className="space-y-4">
            {orders?.map(order => (
              <Card key={order.id}>
                <CardHeader className="flex flex-row items-start justify-between bg-muted/30 pb-4 border-b">
                  <div>
                    <CardTitle className="text-lg mb-1">Order #{order.id}</CardTitle>
                    <p className="text-sm text-muted-foreground">{format(new Date(order.createdAt), "PPP p")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={order.status} 
                      onValueChange={(v) => handleStatusChange(order.id, v as OrderStatusUpdateStatus)}
                      disabled={updateStatus.isPending}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold mb-2">Customer Details</h4>
                    <p className="text-sm">{order.customerName}</p>
                    <p className="text-sm">{order.customerPhone}</p>
                    <p className="text-sm text-muted-foreground mt-2">{order.deliveryAddress}</p>
                    {order.landmark && <p className="text-sm text-muted-foreground">Landmark: {order.landmark}</p>}
                    <p className="text-sm text-muted-foreground">Pincode: {order.pincode}</p>
                    <Badge variant="outline" className="mt-2">{order.paymentMethod.toUpperCase()}</Badge>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Order Items</h4>
                    <ul className="space-y-1 text-sm mb-4">
                      {order.items.map(item => (
                        <li key={item.id} className="flex justify-between">
                          <span>{item.quantity}x {item.productName} {item.size ? `(${item.size})` : ''}</span>
                          <span>₹{item.totalPrice}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t pt-2 flex justify-between font-bold text-primary">
                      <span>Total</span>
                      <span>₹{order.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}