import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// 1. Mock Resend SDK before importing the service
const mockSend = vi.fn();

vi.mock('resend', () => {
  return {
    Resend: vi.fn().mockImplementation(function () {
      return {
        emails: {
          send: mockSend,
        },
      };
    }),
  };
});

describe("Email Service (sendNewLeadNotification)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env = { ...originalEnv };

    // Set default valid env vars for testing
    process.env.RESEND_API_KEY = "re_test_12345";
    process.env.ALERT_EMAIL_RECIPIENT = "admin@example.com";
    process.env.ALERT_EMAIL_SENDER = "Alerts <alerts@example.com>";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("sends notification successfully with correct parameters", async () => {
    mockSend.mockResolvedValue({
      data: { id: "msg_999" },
      error: null,
    });

    const { sendNewLeadNotification } = await import("./email.js");

    const leadData = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "555-0123",
      notes: "Interested in services",
    };

    const result = await sendNewLeadNotification(leadData);

    expect(result).toEqual({
      success: true,
      messageId: "msg_999",
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Alerts <alerts@example.com>",
        to: "admin@example.com",
        subject: "New Lead: Jane Doe",
        text: expect.stringContaining("Jane Doe"),
        html: expect.stringContaining("Jane Doe"),
      }),
    );
  });

  it("escapes unsafe HTML characters to prevent XSS in email clients", async () => {
    mockSend.mockResolvedValue({
      data: { id: "msg_xss_123" },
      error: null,
    });

    const { sendNewLeadNotification } = await import("./email.js");

    const maliciousLead = {
      firstName: '<script>alert("xss")</script>',
      lastName: "Test & Co",
      email: "hacker@example.com",
      notes: 'Check out "this" link <a href="#">Click</a>',
    };

    await sendNewLeadNotification(maliciousLead);

    const callArgs = mockSend.mock.calls[0][0];

    // Assert that HTML tags and quotes were properly escaped
    expect(callArgs.html).toContain(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    );
    expect(callArgs.html).toContain("Test &amp; Co");
    expect(callArgs.html).toContain(
      "Check out &quot;this&quot; link &lt;a href=&quot;#&quot;&gt;Click&lt;/a&gt;",
    );
  });

  it("returns failure when RESEND_API_KEY is missing", async () => {
    delete process.env.RESEND_API_KEY;

    const { sendNewLeadNotification } = await import("./email.js");

    const result = await sendNewLeadNotification({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Missing environment configuration");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns failure when ALERT_EMAIL_RECIPIENT is missing", async () => {
    delete process.env.ALERT_EMAIL_RECIPIENT;

    const { sendNewLeadNotification } = await import("./email.js");

    const result = await sendNewLeadNotification({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("ALERT_EMAIL_RECIPIENT");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("handles API errors returned by Resend", async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: "Domain not verified" },
    });

    const { sendNewLeadNotification } = await import("./email.js");

    const result = await sendNewLeadNotification({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
    });

    expect(result).toEqual({
      success: false,
      error: "Domain not verified",
    });
  });

  it("retries when network error occurs and succeeds on second attempt", async () => {
    // Fail once with network exception, then succeed
    mockSend
      .mockRejectedValueOnce(new Error("Network timeout"))
      .mockResolvedValueOnce({
        data: { id: "msg_retry_success" },
        error: null,
      });

    const { sendNewLeadNotification } = await import("./email.js");

    const result = await sendNewLeadNotification({
      firstName: "Retry",
      lastName: "User",
      email: "retry@example.com",
    });

    expect(result).toEqual({
      success: true,
      messageId: "msg_retry_success",
    });
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("returns error when retries are exhausted", async () => {
    mockSend.mockRejectedValue(new Error("Persistent connection error"));

    const { sendNewLeadNotification } = await import("./email.js");

    const result = await sendNewLeadNotification({
      firstName: "Fail",
      lastName: "User",
      email: "fail@example.com",
    });

    expect(result).toEqual({
      success: false,
      error: "Persistent connection error",
    });
    expect(mockSend).toHaveBeenCalledTimes(3); // Initial attempt + 2 retries
  });
});

