import { useGetAdminDashboard } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, DollarSign, Users, PackageOpen, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminDashboard();

  if (isLoading) return <AdminLayout><div className="p-8">Loading dashboard...</div></AdminLayout>;
  if (!stats) return <AdminLayout><div className="p-8">Failed to load stats.</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-black italic tracking-tighter mb-8 uppercase text-primary">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.todayRevenue}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Orders</CardTitle>
              <ShoppingBag className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
              <PackageOpen className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mb-4">Popular Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.popularProducts.map((p, idx) => (
            <Card key={p.productId} className="flex items-center p-4 gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                #{idx + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{p.productName}</h3>
                <p className="text-sm text-muted-foreground">{p.orderCount} orders</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}