import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from './db';
import { leads, insertLeadSchema } from './db/schema';
import { eq } from 'drizzle-orm';

export const app = new Hono();

// Custom Zod validation hook for predictable error payloads
const validate = (target: 'json' | 'param', schema: z.ZodSchema) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: 'Validation failed',
          issues: result.error.flatten().fieldErrors,
        },
        400
      );
    }
  });

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// POST /leads
app.post('/leads', validate('json', insertLeadSchema), async (c) => {
  const body = c.req.valid('json');
  const result = await db.insert(leads).values(body).returning();
  return c.json(result[0], 201);
});

// GET /leads/:id
app.get('/leads/:id', validate('param', idParamSchema), async (c) => {
  const { id } = c.req.valid('param');

  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, id),
  });

  if (!lead) return c.json({ error: 'Lead not found' }, 404);

  return c.json(lead);
});

export default app;
