import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getAvailableSlots } from "../services/calendar";

export const availabilityEndpoint = new Hono();

const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  timezone: z.string().default("America/Chicago"),
});

availabilityEndpoint.get(
  "/",
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

export default availabilityEndpoint;
