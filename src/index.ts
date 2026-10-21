import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { serve } from '@hono/node-server';
import { z } from "zod";
import { cors } from 'hono/cors';
import type { ZodError } from "zod";
import { db } from "./db/index.js";
import { sendNewLeadNotification } from './services/email.js';
import { leads, insertLeadSchema } from "./db/schema.js";
import { eq } from "drizzle-orm";

export const app = new Hono();

app.use(
  '/*',
  cors({
    origin: [
      'https://chocolate-dragonfly-117105.hostingersite.com',
      'http://localhost:3000',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

const validate = (target: "json" | "param", schema: z.ZodSchema) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const zodError = result.error as ZodError;
      return c.json(
        {
          error: "Validation failed",
          issues: zodError.flatten().fieldErrors,
        },
        400,
      );
    }
  });

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// POST /leads
app.post("/leads", validate("json", insertLeadSchema), async (c) => {
  const body = c.req.valid("json") as z.infer<typeof insertLeadSchema>;

  // Execute MySQL insert
  const [result] = await db.insert(leads).values({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone,
    status: body.status || 'new',
    notes: body.notes,
  });

  // Extract insertId safely from object or array
  const insertId = Array.isArray(result) ? result[0].insertId : result.insertId;

  // Query the created lead using insertId
  const newLead = await db.query.leads.findFirst({
    where: eq(leads.id, insertId),
  });

  if (!newLead) {
    return c.json({ error: 'Failed to retrieve created lead' }, 500);
  }

  sendNewLeadNotification({
    firstName: newLead.firstName,
    lastName: newLead.lastName,
    email: newLead.email,
    phone: newLead.phone,
    notes: newLead.notes,
  });

  return c.json(newLead, 201);
});

// GET /leads/:id
app.get("/leads/:id", validate("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param") as z.infer<typeof idParamSchema>;

  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, id),
  });

  if (!lead) return c.json({ error: "Lead not found" }, 404);

  return c.json(lead);
});

export default app;
