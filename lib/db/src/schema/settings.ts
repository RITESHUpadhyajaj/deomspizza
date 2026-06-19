import { pgTable, serial, text, numeric } from "drizzle-orm/pg-core";

export const appSettingsTable = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  shopAddress: text("shop_address").notNull().default("Surajpur, Greater Noida, Gautam Buddha Nagar, Uttar Pradesh, India"),
  ownerPhone: text("owner_phone").notNull().default(""),
  whatsappNumber: text("whatsapp_number").notNull().default(""),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).notNull().default("40"),
  minOrderAmount: numeric("min_order_amount", { precision: 10, scale: 2 }).notNull().default("150"),
  paytmUpi: text("paytm_upi"),
});

export type AppSettings = typeof appSettingsTable.$inferSelect;
