import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, cartItemsTable, productsTable, usersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

async function getOrderWithItems(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) return null;
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
  return {
    ...order,
    subtotal: parseFloat(String(order.subtotal)),
    deliveryFee: parseFloat(String(order.deliveryFee)),
    discount: parseFloat(String(order.discount)),
    total: parseFloat(String(order.total)),
    items: items.map(i => ({
      ...i,
      unitPrice: parseFloat(String(i.unitPrice)),
      totalPrice: parseFloat(String(i.totalPrice)),
    })),
  };
}

// GET /orders (my orders)
router.get("/orders", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  try {
    const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, userId)).orderBy(desc(ordersTable.createdAt));
    const result = await Promise.all(orders.map(o => getOrderWithItems(o.id)));
    return res.json(result.filter(Boolean));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /orders
router.post("/orders", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  const { customerName, customerPhone, deliveryAddress, landmark, pincode, specialInstructions, paymentMethod, couponCode } = req.body;
  try {
    // Get cart items
    const cartItems = await db
      .select({
        id: cartItemsTable.id,
        productId: cartItemsTable.productId,
        productName: productsTable.name,
        quantity: cartItemsTable.quantity,
        size: cartItemsTable.size,
        unitPrice: cartItemsTable.unitPrice,
      })
      .from(cartItemsTable)
      .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
      .where(eq(cartItemsTable.userId, userId));

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const DELIVERY_FEE = 40;
    const subtotal = cartItems.reduce((sum, i) => sum + parseFloat(String(i.unitPrice)) * i.quantity, 0);
    let discount = 0;
    if (couponCode) {
      const coupons: Record<string, number> = { "WELCOME10": 10, "PIZZA20": 20, "DEOMS50": 50 };
      discount = coupons[couponCode.toUpperCase()] ?? 0;
    }
    const total = subtotal + DELIVERY_FEE - discount;

    const [order] = await db.insert(ordersTable).values({
      userId,
      customerName,
      customerPhone,
      deliveryAddress,
      landmark: landmark ?? null,
      pincode,
      specialInstructions: specialInstructions ?? null,
      paymentMethod: paymentMethod ?? "cod",
      status: "received",
      subtotal: String(subtotal),
      deliveryFee: String(DELIVERY_FEE),
      discount: String(discount),
      total: String(total),
      couponCode: couponCode ?? null,
    }).returning();

    // Insert order items
    await db.insert(orderItemsTable).values(
      cartItems.map(i => ({
        orderId: order.id,
        productId: i.productId,
        productName: i.productName ?? "",
        quantity: i.quantity,
        size: i.size ?? null,
        unitPrice: String(i.unitPrice),
        totalPrice: String(parseFloat(String(i.unitPrice)) * i.quantity),
      }))
    );

    // Clear cart
    await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

    const result = await getOrderWithItems(order.id);
    return res.status(201).json(result);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /orders/:id
router.get("/orders/:id", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  const id = parseInt(req.params.id);
  try {
    const order = await getOrderWithItems(id);
    if (!order) return res.status(404).json({ error: "Not found" });
    if (order.userId !== userId) {
      // Allow admin to see any order
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
      if (user?.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    }
    return res.json(order);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /admin/orders
router.get("/admin/orders", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  try {
    const { status } = req.query;
    const orders = status && typeof status === "string"
      ? await db.select().from(ordersTable).where(eq(ordersTable.status, status)).orderBy(desc(ordersTable.createdAt))
      : await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    const result = await Promise.all(orders.map(o => getOrderWithItems(o.id)));
    return res.json(result.filter(Boolean));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// PATCH /admin/orders/:id/status
router.patch("/admin/orders/:id/status", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  const id = parseInt(req.params.id);
  const { status } = req.body;
  try {
    await db.update(ordersTable).set({ status, updatedAt: new Date() }).where(eq(ordersTable.id, id));
    const order = await getOrderWithItems(id);
    if (!order) return res.status(404).json({ error: "Not found" });
    return res.json(order);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /admin/dashboard
router.get("/admin/dashboard", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  try {
    const allOrders = await db.select().from(ordersTable);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= today);
    const pendingOrders = allOrders.filter(o => ["received", "preparing"].includes(o.status));

    const totalCustomers = await db.select({ count: sql<number>`count(*)` }).from(usersTable);

    // Popular products from order items
    const popularRaw = await db
      .select({
        productId: orderItemsTable.productId,
        productName: orderItemsTable.productName,
        orderCount: sql<number>`sum(${orderItemsTable.quantity})`,
      })
      .from(orderItemsTable)
      .groupBy(orderItemsTable.productId, orderItemsTable.productName)
      .orderBy(sql`sum(${orderItemsTable.quantity}) desc`)
      .limit(5);

    return res.json({
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((sum, o) => sum + parseFloat(String(o.total)), 0),
      pendingOrders: pendingOrders.length,
      todayOrders: todayOrders.length,
      todayRevenue: todayOrders.reduce((sum, o) => sum + parseFloat(String(o.total)), 0),
      totalCustomers: Number(totalCustomers[0]?.count ?? 0),
      popularProducts: popularRaw.map(p => ({
        productId: p.productId,
        productName: p.productName,
        orderCount: Number(p.orderCount),
      })),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
