import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db";
import { asc } from "drizzle-orm";

const router = Router();

// GET /categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await db.select().from(categoriesTable).orderBy(asc(categoriesTable.displayOrder));
    return res.json(categories);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /categories (admin)
router.post("/categories", async (req, res) => {
  const { name, slug, icon, displayOrder } = req.body;
  if (!name || !slug || !icon) {
    return res.status(400).json({ error: "name, slug, icon are required" });
  }
  try {
    const [category] = await db.insert(categoriesTable).values({ name, slug, icon, displayOrder: displayOrder ?? 0 }).returning();
    return res.status(201).json(category);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
