import { pgTable, text, serial, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  profileImage: text("profile_image"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  profileImage: true,
});

// Service schema
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(), // in minutes
  price: integer("price"), // optional, in cents
});

export const insertServiceSchema = createInsertSchema(services).pick({
  userId: true,
  name: true,
  description: true,
  duration: true,
  price: true,
});

// Availability schema
export const availabilities = pgTable("availabilities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 for Sun-Sat
  isActive: boolean("is_active").notNull().default(true),
  startTime: text("start_time").notNull(), // Format: HH:MM
  endTime: text("end_time").notNull(), // Format: HH:MM
});

export const insertAvailabilitySchema = createInsertSchema(availabilities).pick({
  userId: true,
  dayOfWeek: true,
  isActive: true,
  startTime: true,
  endTime: true,
});

// Settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  bufferBefore: integer("buffer_before").notNull().default(10), // in minutes
  bufferAfter: integer("buffer_after").notNull().default(10), // in minutes
  minNotice: integer("min_notice").notNull().default(240), // in minutes (4 hours)
  maxAdvance: integer("max_advance").notNull().default(30), // in days
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  bufferBefore: true,
  bufferAfter: true,
  minNotice: true,
  maxAdvance: true,
});

// Appointment schema
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  serviceId: integer("service_id").notNull(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone"),
  notes: text("notes"),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  startTime: text("start_time").notNull(), // Format: HH:MM
  endTime: text("end_time").notNull(), // Format: HH:MM
  status: text("status").notNull().default("confirmed"), // confirmed, cancelled, completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  userId: true,
  serviceId: true,
  clientName: true,
  clientEmail: true,
  clientPhone: true,
  notes: true,
  date: true,
  startTime: true,
  endTime: true,
  status: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Availability = typeof availabilities.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
