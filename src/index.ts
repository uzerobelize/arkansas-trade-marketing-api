import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { cors } from 'hono/cors';
import type { ZodError } from "zod";
import { db } from "./db/index.js";
import { sendNewLeadNotification } from './services/email.js';
import { getAvailableSlots } from "./services/calendar.js";
import { leads, insertLeadSchema } from "./db/schema.js";
import bookings from './routes/bookings.js';
import { eq } from "drizzle-orm";

export const app = new Hono();

app.use(
  '/*',
  cors({
    origin: [
      'https://arkansastrademarketing.com',
      'http://localhost:3000',
      'http://localhost:5173',
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

const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  timezone: z.string().default("America/Chicago"),
});

app.get(
  "/api/availability",
  zValidator("query", availabilityQuerySchema),
  async (c) => {
    const { date, timezone } = c.req.valid("query");

    try {
      const slots = await getAvailableSlots(date, timezone);
      return c.json({ date, timezone, availableSlots: slots });
    } catch (error) {
      console.error("Availability Error:", error);
      return c.json({ error: "Failed to fetch availability" }, 500);
    }
  },
);

app.route('/api/bookings', bookings);

// POST /leads
app.post("/leads", validate("json", insertLeadSchema), async (c) => {
  console.log("\n--- START POST /leads ---");

  // Step 1: Log the validated body from Hono
  const body = c.req.valid("json") as z.infer<typeof insertLeadSchema>;
  console.log(
    "[Step 1] Validated request body:",
    JSON.stringify(body, null, 2),
  );

  try {
    // Step 2: Prepare the exact object being passed to Drizzle
    const now = new Date();
    const insertPayload = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      status: body.status || "new",
      notes: body.notes,
      createdAt: now,
      updatedAt: now,
    };
    console.log(
      "[Step 2] Prepared DB insert payload:",
      JSON.stringify(insertPayload, null, 2),
    );

    // Step 3: Attempt the DB insert
    console.log("[Step 3] Executing db.insert()...");
    const [result] = await db.insert(leads).values(insertPayload);

    // Step 4: Log the raw result from MySQL
    console.log("[Step 4] db.insert() successful. Raw result:", result);

    const insertId = (result as any).insertId;
    console.log("[Step 5] Extracted insertId:", insertId);

    if (!insertId) {
      console.warn(
        "[Warning] insertId is missing from the MySQL result object!",
      );
    }

    // Step 6: Attempt to fetch the newly created record
    console.log(
      `[Step 6] Fetching newly created lead from DB with ID: ${insertId}...`,
    );
    const newLead = await db.query.leads.findFirst({
      where: eq(leads.id, insertId),
    });
    console.log("[Step 7] Fetched lead from DB:", newLead);

    if (!newLead) {
      console.error(
        "[Error] Failed to retrieve created lead with ID:",
        insertId,
      );
      return c.json({ error: "Failed to retrieve created lead" }, 500);
    }

    // Step 8: Trigger notification
    console.log("[Step 8] Triggering email notification...");
    sendNewLeadNotification({
      firstName: newLead.firstName,
      lastName: newLead.lastName,
      email: newLead.email,
      phone: newLead.phone,
      notes: newLead.notes,
    });

    console.log("--- END POST /leads SUCCESS ---\n");
    return c.json(newLead, 201);
  } catch (err) {
    const error = err as any;

    // Log the underlying MySQL driver error details
    console.error("--- MYSQL DRIVER ERROR DETAILS ---");
    console.error("Code:", error?.cause?.code || error?.code);
    console.error(
      "Message:",
      error?.cause?.sqlMessage || error?.sqlMessage || error?.message,
    );
    console.error("Full Cause:", error?.cause);

    return c.json(
      {
        error: "Database operation failed",
        details: (error as Error).message,
      },
      500,
    );
  }
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
