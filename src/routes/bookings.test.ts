import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import bookings from "./bookings.js";
import {
  getAvailableSlots,
  createCalendarEvent,
} from "../services/calendar.js";
import { db } from "../db/index.js";
import { sendNewLeadNotification } from "../services/email.js";

// Mock external services & DB
vi.mock("../services/calendar.js");
vi.mock("../services/email.js");
vi.mock("../db/index.js", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        $returningId: vi.fn().mockResolvedValue([{ id: 1 }]),
      })),
    })),
  },
}));

const app = new Hono();
app.route("/api/bookings", bookings);

describe("POST /api/bookings", () => {
  const validPayload = {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "5551234567",
    notes: "Looking forward to the discovery call.",
    startTime: "2026-10-28T15:00:00.000Z",
    endTime: "2026-10-28T16:00:00.000Z",
    timezone: "America/Chicago",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully book an appointment and return 201", async () => {
    vi.mocked(getAvailableSlots).mockResolvedValue([
      "2026-10-28T15:00:00.000Z",
      "2026-10-28T15:30:00.000Z",
    ]);
    vi.mocked(createCalendarEvent).mockResolvedValue({
      eventId: "google-event-123",
      meetLink: "https://meet.google.com/abc-defg-hij",
    });

    const res = await app.request("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual({
      message: "Booking confirmed",
      bookingId: 1,
      meetLink: "https://meet.google.com/abc-defg-hij",
    });

    expect(createCalendarEvent).toHaveBeenCalledWith(validPayload);
    expect(db.insert).toHaveBeenCalled();
    expect(sendNewLeadNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        status: "booked",
      }),
    );
  });

  it("should return 409 Conflict if requested time slot is unavailable", async () => {
    vi.mocked(getAvailableSlots).mockResolvedValue([
      "2026-10-28T16:00:00.000Z",
    ]);

    const res = await app.request("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toMatch(/no longer available/i);

    expect(createCalendarEvent).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
    expect(sendNewLeadNotification).not.toHaveBeenCalled();
  });

  it("should return 400 Bad Request for validation failures", async () => {
    const invalidPayload = {
      ...validPayload,
      email: "invalid-email",
      phone: "",
    };

    const res = await app.request("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidPayload),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("should return 500 Internal Server Error when external services fail", async () => {
    vi.mocked(getAvailableSlots).mockResolvedValue([
      "2026-10-28T15:00:00.000Z",
    ]);
    vi.mocked(createCalendarEvent).mockRejectedValue(
      new Error("Calendar API failed"),
    );

    const res = await app.request("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Failed to process booking");

    expect(db.insert).not.toHaveBeenCalled();
    expect(sendNewLeadNotification).not.toHaveBeenCalled();
  });
});
