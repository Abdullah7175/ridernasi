import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - only for delivery riders and admins
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("rider"), // rider or admin
  vendorId: integer("vendor_id"),
  profileImage: text("profile_image"),
  phone: text("phone"),
});

// Vendors table - Nasi Cleaning and other partner vendors
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  isMainAdmin: boolean("is_main_admin").default(false), // true for Nasi Cleaning
});

// Orders table - assigned to riders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("assigned"), // assigned, in_progress, completed
  vendorId: integer("vendor_id").notNull(),
  riderId: integer("rider_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerAddress: text("customer_address").notNull(),
  customerPhone: text("customer_phone"),
  totalAmount: integer("total_amount").notNull(), // in smallest currency unit (cents/halala)
  itemCount: integer("item_count").notNull(),
  orderType: text("order_type").notNull(), // pickup, delivery, or both
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").default("pending"), // pending, completed
  scheduledDate: timestamp("scheduled_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  items: jsonb("items"),
  notes: text("notes"),
  latitude: text("latitude"),
  longitude: text("longitude"),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  createdAt: true, 
  completedAt: true 
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Rider ID is required"),
  password: z.string().min(1, "Password is required"),
});

// Update order status schema
export const updateOrderStatusSchema = z.object({
  status: z.enum(["assigned", "in_progress", "completed"])
});

// Update payment schema
export const updatePaymentSchema = z.object({
  paymentMethod: z.enum(["cash", "card", "online"]),
  paymentStatus: z.enum(["pending", "completed"]),
  notes: z.string().optional(),
});

// Update profile schema
export const updateProfileSchema = z.object({
  name: z.string().optional(),
  password: z.string().optional(),
  profileImage: z.string().optional(),
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type User = typeof users.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type UpdateOrderStatus = z.infer<typeof updateOrderStatusSchema>;
export type UpdatePayment = z.infer<typeof updatePaymentSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
