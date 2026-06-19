import { Router } from "express";
import { db } from "@workspace/db";
import { favoritesTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /favorites
router.get("/favorites", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  try {
    const rows = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        basePrice: productsTable.basePrice,
        imageUrl: productsTable.imageUrl,
        isAvailable: productsTable.isAvailable,
        isVeg: productsTable.isVeg,
        isFeatured: productsTable.isFeatured,
        sizeOptions: productsTable.sizeOptions,
        tags: productsTable.tags,
        createdAt: productsTable.createdAt,
      })
      .from(favoritesTable)
      .leftJoin(productsTable, eq(favoritesTable.productId, productsTable.id))
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(favoritesTable.userId, userId));
    return res.json(rows.map(r => ({ ...r, categoryName: r.categoryName ?? "" })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /favorites
router.post("/favorites", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  const { productId } = req.body;
  try {
    const existing = await db.select().from(favoritesTable).where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.productId, productId)));
    if (existing.length === 0) {
      await db.insert(favoritesTable).values({ userId, productId });
    }
    return res.status(201).json({ message: "Added to favorites" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE /favorites/:productId
router.delete("/favorites/:productId", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  const productId = parseInt(req.params.productId);
  try {
    await db.delete(favoritesTable).where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.productId, productId)));
    return res.json({ message: "Removed from favorites" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
