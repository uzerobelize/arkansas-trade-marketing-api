import { google } from "googleapis";
import crypto from 'crypto';

const WORKING_HOURS = { start: 8, end: 17 };
const SLOT_DURATION_MIN = 30;
const BUFFER_MIN = 15;
const MIN_NOTICE_HOURS = 4;

export async function getAvailableSlots(
  dateStr: string,
  timezone: string = "UTC",
) {
  const slots: Date[] = [];
  const [year, month, day] = dateStr.split("-").map(Number);

  const tzOffsetHours =
    timezone === "CST" || timezone === "America/Chicago" ? -6 : 0;

  for (let hour = WORKING_HOURS.start; hour < WORKING_HOURS.end; hour++) {
    for (const min of [0, 30]) {
      const utcTimestamp = Date.UTC(
        year,
        month - 1,
        day,
        hour - tzOffsetHours,
        min,
        0,
        0,
      );
      slots.push(new Date(utcTimestamp));
    }
  }

  const timeMin = slots[0].toISOString();
  const timeMax = slots[slots.length - 1].toISOString();

  let busyRanges: Array<{ start?: string | null; end?: string | null }> = [];

  // 1. Resolve Calendar ID from environment variable
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  if (process.env.USE_MOCK_CALENDAR !== "true") {
    console.log('[Calendar Debug] Fetching live Google Calendar freebusy data...');
    console.log('[Calendar Debug] Target Calendar ID:', calendarId);
    console.log('[Calendar Debug] Query Range:', { timeMin, timeMax });

    const auth = new google.auth.GoogleAuth({
      clientOptions: {
        subject: 'admin@uzerobelize.com',
      },
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });
    const calendar = google.calendar({ version: "v3", auth });

    // 2. Query freebusy for the specific calendarId
    const freebusy = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: calendarId }],
      },
    });

    // 3. Access busy ranges dynamically using the calendarId key
    console.log(
      '[Calendar Debug] Raw Busy Ranges from Google:',
      JSON.stringify(busyRanges, null, 2)
    );

    busyRanges = freebusy.data.calendars?.[calendarId]?.busy || [];
  }

  const now = new Date();
  const noticeThreshold = new Date(
    now.getTime() + MIN_NOTICE_HOURS * 60 * 60 * 1000,
  );

  const availableSlots = slots.filter((slot) => {
    if (slot < noticeThreshold) return false;

    const slotStart = slot.getTime();
    const slotEnd = slotStart + SLOT_DURATION_MIN * 60 * 1000;

    const hasConflict = busyRanges.some((busy) => {
      if (!busy.start || !busy.end) return false;

      const busyStart = new Date(busy.start).getTime() - BUFFER_MIN * 60 * 1000;
      const busyEnd = new Date(busy.end).getTime() + BUFFER_MIN * 60 * 1000;
      return slotStart < busyEnd && slotEnd > busyStart;
    });

    return !hasConflict;
  });

  return availableSlots.map((slot) => slot.toISOString());
}

export async function createCalendarEvent(booking: {
  name: string;
  email: string;
  phone: string;
  notes?: string;
  startTime: string;
  endTime: string;
  timezone: string;
}) {
  if (process.env.USE_MOCK_CALENDAR === "true") {
    return {
      meetLink: "https://meet.google.com/mock-link",
      eventId: "mock-id",
    };
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  const auth = new google.auth.GoogleAuth({
    clientOptions: {
      subject: 'admin@uzerobelize.com',
    },
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });
  const calendar = google.calendar({ version: "v3", auth });

  const response = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: 1, // Required to generate a Google Meet link
    sendUpdates: "all", // Sends an invite email to the attendee
    requestBody: {
      summary: `Discovery Call: ${booking.name}`,
      description: `Phone: ${booking.phone}\nNotes: ${booking.notes || "None provided"}`,
      start: {
        dateTime: booking.startTime,
        timeZone: booking.timezone,
      },
      end: {
        dateTime: booking.endTime,
        timeZone: booking.timezone,
      },
      attendees: [{ email: booking.email }],
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  return {
    eventId: response.data.id,
    meetLink: response.data.hangoutLink,
  };
}
