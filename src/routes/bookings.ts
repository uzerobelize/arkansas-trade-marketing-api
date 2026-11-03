import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createBookingSchema } from "../db/booking.schema";
import { createCalendarEvent, getAvailableSlots } from "../services/calendar";
import { db } from "../db/index";
import { bookings } from "../db/schema";
import { sendNewLeadNotification } from "../services/email";
import { sendWhatsAppBookingAlert } from '../services/whatsapp';

const bookingsApi = new Hono();

bookingsApi.post("/", zValidator("json", createBookingSchema), async (c) => {
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

    const combinedNotes =
      [
        data.company ? `Company: ${data.company}` : null,
        data.notes ? `Notes: ${data.notes}` : null,
      ]
        .filter(Boolean)
        .join(" | ") || null;

    // 4. Attempt DB Insert with Duplicate Catch
    let bookingId: number | null = null;
    let isDuplicate = false;

    try {
      const [newBooking] = await db
        .insert(bookings)
        .values([
          {
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            notes: combinedNotes,
            startTime: new Date(data.startTime),
            endTime: data.endTime ? new Date(data.endTime) : null,
            timezone: data.timezone || 'America/Chicago',
            notes: data.notes || null,
            status: 'booked',
          },
        ])
        .returning();

      bookingId = newBooking.id;
    } catch (insertError: any) {
      const isDup =
        insertError?.code === "ER_DUP_ENTRY" ||
        insertError?.cause?.code === "ER_DUP_ENTRY";

      if (isDup) {
        console.warn(
          `[Booking] Duplicate lead detected for email: ${data.email}. Skipping DB insert.`,
        );
        isDuplicate = true;
      } else {
        throw insertError; // Throw non-duplicate DB errors to the outer catch
      }
    }

    // 5. Trigger Notifications Asynchronously
    // Using Promise.allSettled ensures one failing notification doesn't kill the others
    const [firstName, ...lastNameParts] = data.name.trim().split(" ");
    const lastName = lastNameParts.join(" ");

    Promise.allSettled([
      sendNewLeadNotification({
        firstName,
        lastName: lastName || "",
        email: data.email,
        phone: data.phone,
        status: isDuplicate ? "returning_lead_booked" : "booked",
        notes: `Company: ${data.company || "N/A"} | Time: ${data.startTime} | Meet Link: ${calendarEvent.meetLink}${data.notes ? ` | Notes: ${data.notes}` : ""}`,
      }),
      sendWhatsAppBookingAlert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        startTime: data.startTime,
      }),
    ]);

    // 6. Return response to API user
    return c.json(
      {
        message: isDuplicate
          ? "Booking confirmed for returning lead"
          : "Booking confirmed",
        bookingId, // Will be null if duplicate
        meetLink: calendarEvent.meetLink,
        isDuplicate,
      },
      201,
    );
  } catch (error: any) {
    console.error("[Booking Error]", error);
    if (error?.cause) {
      console.error("[Booking Cause Details]", error.cause);
    }
    return c.json({ error: "Failed to process booking" }, 500);
  }
});

export default bookingsApi;
