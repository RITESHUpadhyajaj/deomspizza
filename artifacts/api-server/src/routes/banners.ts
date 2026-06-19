import { Router } from "express";
import { db } from "@workspace/db";
import { bannersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

// GET /banners
router.get("/banners", async (req, res) => {
  try {
    const banners = await db.select().from(bannersTable).orderBy(asc(bannersTable.displayOrder));
    return res.json(banners);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /banners
router.post("/banners", async (req, res) => {
  try {
    const { title, subtitle, imageUrl, linkUrl, isActive, displayOrder } = req.body;
    const [banner] = await db.insert(bannersTable).values({
      title, subtitle: subtitle ?? null, imageUrl, linkUrl: linkUrl ?? null,
      isActive: isActive ?? true, displayOrder: displayOrder ?? 0,
    }).returning();
    return res.status(201).json(banner);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// PATCH /banners/:id
router.patch("/banners/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const updates: Record<string, unknown> = {};
    const allowed = ["title", "subtitle", "imageUrl", "linkUrl", "isActive", "displayOrder"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const [banner] = await db.update(bannersTable).set(updates).where(eq(bannersTable.id, id)).returning();
    if (!banner) return res.status(404).json({ error: "Not found" });
    return res.json(banner);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE /banners/:id
router.delete("/banners/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await db.delete(bannersTable).where(eq(bannersTable.id, id));
    return res.json({ message: "Deleted" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
