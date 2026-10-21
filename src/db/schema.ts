import { mysqlTable, int, varchar, text, timestamp } from 'drizzle-orm/mysql-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// 1. MySQL Drizzle Table Schema
export const leads = mysqlTable('leads', {
  id: int('id').autoincrement().primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  status: varchar('status', { length: 50 }).default('new').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// 2. TypeScript Types
export type Lead = InferSelectModel<typeof leads>;
export type NewLead = InferInsertModel<typeof leads>;

// 3. Zod Schemas
export const selectLeadSchema = createSelectSchema(leads);

export const insertLeadSchema = createInsertSchema(leads, {
  email: z.string().email('Invalid email address format'),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
