import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const veille = pgTable("veille", {
  id: serial("id").primaryKey(),
  title: text("title"),
  link: text("link").notNull(),
  content: text("content").notNull(),
  priority_score: integer("priority_score").notNull(),
  keywords: text("keywords"), // JSON string array
  status: text("status").notNull(),
  sentiment: text("sentiment").notNull(),
  date: text("date"), // nullable date field
});

export const insertVeilleSchema = createInsertSchema(veille).omit({
  id: true,
});

export type InsertVeille = z.infer<typeof insertVeilleSchema>;
export type Veille = typeof veille.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
