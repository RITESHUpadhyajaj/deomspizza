import { Router } from "express";
import { db } from "@workspace/db";
import { couponsTable, cartItemsTable, ordersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /coupons — list all active coupons
router.get("/coupons", async (req, res) => {
  try {
    const coupons = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.isActive, true));
    return res.json(
      coupons.map(c => ({
        ...c,
        discountValue: parseFloat(String(c.discountValue)),
      }))
    );
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /admin/coupons — create a new coupon (admin only)
router.post("/admin/coupons", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });

  const { code, discountType, discountValue, usageRestriction, isActive } = req.body;
  if (!code || !discountType || discountValue == null || !usageRestriction) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [coupon] = await db
      .insert(couponsTable)
      .values({
        code: String(code).toUpperCase().trim(),
        discountType: discountType as "percent" | "flat",
        discountValue: String(discountValue),
        usageRestriction: usageRestriction as "none" | "first_order" | "second_order",
        isActive: isActive !== false,
      })
      .returning();
    return res.status(201).json({
      ...coupon,
      discountValue: parseFloat(String(coupon.discountValue)),
    });
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(400).json({ error: "Coupon code already exists" });
    }
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
