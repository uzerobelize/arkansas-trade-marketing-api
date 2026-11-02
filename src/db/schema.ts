// import { mysqlTable, int, varchar, text, timestamp } from 'drizzle-orm/mysql-core';
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// 1. MySQL Drizzle Table Schema
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  startTime: timestamp('start_time').notNull(),
  status: varchar('status', { length: 50 }).default('booked').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. TypeScript Types
export type Booking = InferSelectModel<typeof bookings>;
export type NewBooking = InferInsertModel<typeof bookings>;

// 3. Zod Schemas
export const selectBookingSchema = createSelectSchema(bookings);

export const insertBookingSchema = createInsertSchema(bookings, {
  email: z.string().email('Invalid email address format'),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
