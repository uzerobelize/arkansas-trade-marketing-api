// src/services/calendar.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("googleapis", () => ({
  google: {
    auth: { GoogleAuth: vi.fn() },
    calendar: vi.fn().mockReturnValue({
      freebusy: {
        query: vi.fn().mockImplementation(async (params) => {
          // Extract requested calendar ID dynamically
          const calendarId = params?.requestBody?.items?.[0]?.id || "primary";
          return {
            data: {
              calendars: {
                [calendarId]: { busy: [] },
              },
            },
          };
        }),
      },
    }),
  },
}));

describe("Availability Engine", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    process.env = { ...originalEnv, USE_MOCK_CALENDAR: "true" };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.useRealTimers();
  });

  it("queries custom GOOGLE_CALENDAR_ID when set in environment", async () => {
    process.env.USE_MOCK_CALENDAR = "false";
    process.env.GOOGLE_CALENDAR_ID =
      "custom-calendar-id@group.calendar.google.com";
    vi.setSystemTime(new Date("2026-10-01T10:00:00.000Z"));

    const { google } = await import("googleapis");
    const { getAvailableSlots } = await import("./calendar.js");

    await getAvailableSlots("2026-10-21", "UTC");

    const calendarInstance = google.calendar({
      version: "v3",
      auth: {} as any,
    });
    expect(calendarInstance.freebusy.query).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: expect.objectContaining({
          items: [{ id: "custom-calendar-id@group.calendar.google.com" }],
        }),
      }),
    );
  });
});
