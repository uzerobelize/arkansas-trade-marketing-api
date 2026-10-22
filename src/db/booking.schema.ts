import { z } from "zod";

export const createBookingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
  company: z.string().optional(),
  notes: z.string().optional(),
  startTime: z
    .string()
    .datetime({ message: "Must be a valid ISO 8601 UTC timestamp" }),
  endTime: z
    .string()
    .datetime({ message: "Must be a valid ISO 8601 UTC timestamp" }),
  timezone: z.string().default("America/Chicago"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
