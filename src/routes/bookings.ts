import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createBookingSchema } from "../db/booking.schema.js";
import { createCalendarEvent, getAvailableSlots } from "../services/calendar.js";
import { db } from "../db/index.js";
import { leads } from "../db/schema.js";
import { sendNewLeadNotification } from "../services/email.js";

const bookings = new Hono();

bookings.post("/", zValidator("json", createBookingSchema), async (c) => {
  const data = c.req.valid("json");

  try {
    // 1. Re-verify availability
    const bookingDate = data.startTime.split("T")[0];
    const availableSlots = await getAvailableSlots(bookingDate, data.timezone);

    if (!availableSlots.includes(data.startTime)) {
      return c.json(
        {
          error:
            "This time slot is no longer available. Please select another.",
        },
        409,
      );
    }

    // 2. Create Google Calendar Event & Meet Link
    const calendarEvent = await createCalendarEvent({
      name: data.name,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
      startTime: data.startTime,
      endTime: data.endTime,
      timezone: data.timezone,
    });

    // 3. Split full name into firstName / lastName for DB insertion
    const [firstName, ...lastNameParts] = data.name.trim().split(" ");
    const lastName = lastNameParts.join(" ");

    // Combine optional company and notes into notes column if present
    const combinedNotes =
      [
        data.company ? `Company: ${data.company}` : null,
        data.notes ? `Notes: ${data.notes}` : null,
      ]
        .filter(Boolean)
        .join(" | ") || null;

    const now = new Date();
    const [result] = await db
      .insert(leads)
      .values([
        {
          firstName: firstName,
          lastName: lastName || "",
          email: data.email,
          phone: data.phone || "",
          status: "new",
          notes: combinedNotes,
          createdAt: now,
          updatedAt: now,
        },
      ])

    const bookingId = (result as any).insertId;

    // 4. Trigger Email Alert using LeadAlertPayload structure
    await sendNewLeadNotification({
      firstName,
      lastName: lastName || "",
      email: data.email,
      phone: data.phone,
      status: "booked",
      notes: `Company: ${data.company || "N/A"} | Time: ${data.startTime} | Meet Link: ${calendarEvent.meetLink}${data.notes ? ` | Notes: ${data.notes}` : ""}`,
    });

    return c.json({
      message: 'Booking confirmed',
      bookingId,
      meetLink: calendarEvent.meetLink
    }, 201);
  } catch (error) {
    console.error("[Booking Error]", error);
    return c.json({ error: "Failed to process booking" }, 500);
  }
});

export default bookings;
