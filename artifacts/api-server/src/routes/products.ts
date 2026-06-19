import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and, type SQL } from "drizzle-orm";

const router = Router();

// GET /products
router.get("/products", async (req, res) => {
  try {
    const { category, search, available } = req.query;
    const conditions: SQL[] = [];

    if (category && typeof category === "string") {
      const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, category));
      if (cat) {
        conditions.push(eq(productsTable.categoryId, cat.id));
      }
    }
    if (search && typeof search === "string") {
      conditions.push(ilike(productsTable.name, `%${search}%`));
    }
    if (available === "true") {
      conditions.push(eq(productsTable.isAvailable, true));
    }

    const rows = conditions.length > 0
      ? await db.select({
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
        }).from(productsTable)
          .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
          .where(and(...conditions))
      : await db.select({
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
        }).from(productsTable)
          .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id));

    return res.json(rows.map(r => ({ ...r, categoryName: r.categoryName ?? "" })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /products (admin)
router.post("/products", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  try {
    const { name, description, categoryId, basePrice, imageUrl, isAvailable, isVeg, isFeatured, sizeOptions, tags } = req.body;
    const [product] = await db.insert(productsTable).values({
      name, description, categoryId, basePrice: String(basePrice), imageUrl,
      isAvailable: isAvailable ?? true, isVeg: isVeg ?? true, isFeatured: isFeatured ?? false,
      sizeOptions: sizeOptions ?? null, tags: tags ?? null,
    }).returning();
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));
    return res.status(201).json({ ...product, categoryName: cat?.name ?? "" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /products/:id
router.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [row] = await db.select({
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
    }).from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json({ ...row, categoryName: row.categoryName ?? "" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// PATCH /products/:id
router.patch("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const updates: Record<string, unknown> = {};
    const allowed = ["name", "description", "categoryId", "basePrice", "imageUrl", "isAvailable", "isVeg", "isFeatured", "sizeOptions", "tags"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key === "basePrice" ? "basePrice" : key] = key === "basePrice" ? String(req.body[key]) : req.body[key];
      }
    }
    const [product] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
    if (!product) return res.status(404).json({ error: "Not found" });
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));
    return res.json({ ...product, categoryName: cat?.name ?? "" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE /products/:id
router.delete("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await db.delete(productsTable).where(eq(productsTable.id, id));
    return res.json({ message: "Deleted" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
