import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable, couponsTable, ordersTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";

const BASE_DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 250;

const router = Router();

async function buildCart(userId: number) {
  const items = await db
    .select({
      id: cartItemsTable.id,
      productId: cartItemsTable.productId,
      productName: productsTable.name,
      productImage: productsTable.imageUrl,
      quantity: cartItemsTable.quantity,
      size: cartItemsTable.size,
      unitPrice: cartItemsTable.unitPrice,
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  const cartItems = items.map((item) => ({
    ...item,
    productName: item.productName ?? "",
    productImage: item.productImage ?? "",
    unitPrice: parseFloat(String(item.unitPrice)),
    totalPrice: parseFloat(String(item.unitPrice)) * item.quantity,
  }));

  const subtotal = cartItems.reduce((sum, i) => sum + i.totalPrice, 0);
  const deliveryFee = subtotal > 0 ? (subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : BASE_DELIVERY_FEE) : 0;
  const total = subtotal + deliveryFee;

  return {
    items: cartItems,
    subtotal,
    discount: 0,
    deliveryFee,
    total,
    couponCode: null,
  };
}

// GET /cart
router.get("/cart", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  try {
    return res.json(await buildCart(userId));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE /cart
router.delete("/cart", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  try {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
    return res.json({ message: "Cart cleared" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /cart/items
router.post("/cart/items", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  const { productId, quantity, size } = req.body;
  try {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
    if (!product) return res.status(404).json({ error: "Product not found" });

    let unitPrice = parseFloat(String(product.basePrice));
    if (size && product.sizeOptions) {
      const sizeOpt = (product.sizeOptions as Array<{ size: string; price: number }>).find(s => s.size === size);
      if (sizeOpt) unitPrice = sizeOpt.price;
    }

    // Check if same product+size already in cart — increment quantity
    const [existing] = await db
      .select()
      .from(cartItemsTable)
      .where(and(
        eq(cartItemsTable.userId, userId),
        eq(cartItemsTable.productId, productId),
      ));

    if (existing && existing.size === (size ?? null)) {
      await db.update(cartItemsTable)
        .set({ quantity: existing.quantity + (quantity ?? 1) })
        .where(eq(cartItemsTable.id, existing.id));
    } else {
      await db.insert(cartItemsTable).values({
        userId,
        productId,
        quantity: quantity ?? 1,
        size: size ?? null,
        unitPrice: String(unitPrice),
      });
    }

    return res.status(201).json(await buildCart(userId));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// PATCH /cart/items/:id
router.patch("/cart/items/:id", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  const id = parseInt(req.params.id);
  const { quantity } = req.body;
  try {
    if (quantity <= 0) {
      await db.delete(cartItemsTable).where(and(eq(cartItemsTable.id, id), eq(cartItemsTable.userId, userId)));
    } else {
      await db.update(cartItemsTable).set({ quantity }).where(and(eq(cartItemsTable.id, id), eq(cartItemsTable.userId, userId)));
    }
    return res.json(await buildCart(userId));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE /cart/items/:id
router.delete("/cart/items/:id", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  const id = parseInt(req.params.id);
  try {
    await db.delete(cartItemsTable).where(and(eq(cartItemsTable.id, id), eq(cartItemsTable.userId, userId)));
    return res.json(await buildCart(userId));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /cart/coupon
router.post("/cart/coupon", async (req, res) => {
  const userId = (req.session as any)?.userId;
  const { code } = req.body;
  if (!code) return res.json({ valid: false, discount: 0, message: "Please enter a coupon code" });

  try {
    const [coupon] = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.code, String(code).toUpperCase().trim()));

    if (!coupon || !coupon.isActive) {
      return res.json({ valid: false, discount: 0, message: "Invalid or expired coupon code" });
    }

    // Check usage restriction
    if (userId && coupon.usageRestriction !== "none") {
      const [{ orderCount }] = await db
        .select({ orderCount: count() })
        .from(ordersTable)
        .where(eq(ordersTable.userId, userId));

      const numOrders = Number(orderCount);
      if (coupon.usageRestriction === "first_order" && numOrders > 0) {
        return res.json({ valid: false, discount: 0, message: "This code is only for first-time orders" });
      }
      if (coupon.usageRestriction === "second_order" && numOrders !== 1) {
        return res.json({ valid: false, discount: 0, message: "This code is only for your second order" });
      }
    } else if (!userId && coupon.usageRestriction !== "none") {
      return res.json({ valid: false, discount: 0, message: "Please log in to use this coupon" });
    }

    // Calculate discount amount from cart subtotal
    const cart = userId ? await buildCart(userId) : null;
    const subtotal = cart?.subtotal ?? 0;
    const discountValue = parseFloat(String(coupon.discountValue));
    const discountAmount = coupon.discountType === "percent"
      ? parseFloat(((subtotal * discountValue) / 100).toFixed(2))
      : discountValue;

    const label = coupon.discountType === "percent" ? `${discountValue}%` : `₹${discountValue}`;
    return res.json({
      valid: true,
      discount: discountAmount,
      message: `Coupon applied! You save ${label}`,
      discountType: coupon.discountType,
      discountValue,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
