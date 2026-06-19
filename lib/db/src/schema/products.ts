import { pgTable, serial, text, integer, boolean, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  isVeg: boolean("is_veg").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  sizeOptions: jsonb("size_options").$type<Array<{ size: string; price: number }>>(),
  tags: text("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
