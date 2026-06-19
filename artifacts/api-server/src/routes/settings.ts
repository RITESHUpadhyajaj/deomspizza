import { Router } from "express";
import { db } from "@workspace/db";
import { appSettingsTable } from "@workspace/db";

const router = Router();

async function getOrCreateSettings() {
  const rows = await db.select().from(appSettingsTable);
  if (rows.length > 0) return rows[0];
  const [settings] = await db.insert(appSettingsTable).values({}).returning();
  return settings;
}

// GET /settings
router.get("/settings", async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    return res.json({
      ...settings,
      deliveryFee: parseFloat(String(settings.deliveryFee)),
      minOrderAmount: parseFloat(String(settings.minOrderAmount)),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// PATCH /settings
router.patch("/settings", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  try {
    const settings = await getOrCreateSettings();
    const updates: Record<string, unknown> = {};
    const allowed = ["shopAddress", "ownerPhone", "whatsappNumber", "deliveryFee", "minOrderAmount", "paytmUpi"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (key === "deliveryFee" || key === "minOrderAmount") {
          updates[key] = String(req.body[key]);
        } else {
          updates[key] = req.body[key];
        }
      }
    }
    const { eq } = await import("drizzle-orm");
    const [final] = await db.update(appSettingsTable).set(updates).where(eq(appSettingsTable.id, settings.id)).returning();
    return res.json({
      ...final,
      deliveryFee: parseFloat(String(final.deliveryFee)),
      minOrderAmount: parseFloat(String(final.minOrderAmount)),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
