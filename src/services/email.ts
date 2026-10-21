import { Resend } from "resend";

// 1. Interface Definitions
export interface LeadAlertPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status?: string | null;
  notes?: string | null;
  createdAt?: Date | string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// 2. Resend Singleton Instance
const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

/**
 * Escapes unsafe HTML characters to prevent XSS / formatting corruption in email clients.
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Helper to retry transient network/API errors with backoff.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  delayMs = 500,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * (attempt + 1)),
        );
      }
    }
  }
  throw lastError;
}

/**
 * Sends a sanitized, production-ready lead notification email via Resend.
 */
export async function sendNewLeadNotification(
  lead: LeadAlertPayload,
): Promise<SendEmailResult> {
  const recipient = process.env.ALERT_EMAIL_RECIPIENT;
  const sender =
    process.env.ALERT_EMAIL_SENDER || "Lead Alerts <alerts@yourdomain.com>";

  // Fail-safe check if configuration is missing
  if (!resend || !recipient) {
    const missing = [];
    if (!apiKey) missing.push("RESEND_API_KEY");
    if (!recipient) missing.push("ALERT_EMAIL_RECIPIENT");

    console.warn(
      `[Email Service] Notification skipped. Missing configuration: ${missing.join(", ")}`,
    );
    return {
      success: false,
      error: `Missing environment configuration: ${missing.join(", ")}`,
    };
  }

  // Sanitize user inputs
  const firstName = escapeHtml(lead.firstName);
  const lastName = escapeHtml(lead.lastName);
  const email = escapeHtml(lead.email);
  const phone = lead.phone ? escapeHtml(lead.phone) : "N/A";
  const status = lead.status ? escapeHtml(lead.status) : "new";
  const notes = lead.notes ? escapeHtml(lead.notes) : "None provided";
  const timestamp = lead.createdAt
    ? new Date(lead.createdAt).toISOString()
    : new Date().toISOString();

  // Plain Text Version (Crucial for anti-spam scoring)
  const textContent = `
NEW LEAD ALERT
----------------------------------------
Name:      ${lead.firstName} ${lead.lastName}
Email:     ${lead.email}
Phone:     ${lead.phone || "N/A"}
Status:    ${lead.status || "new"}
Notes:     ${lead.notes || "None provided"}
Timestamp: ${timestamp}
----------------------------------------
`.trim();

  // Responsive HTML Version
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f5; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e4e4e7; }
    .header { background-color: #0f172a; color: #ffffff; padding: 24px; text-align: left; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .content { padding: 24px; }
    .field { margin-bottom: 16px; border-bottom: 1px solid #f4f4f5; padding-bottom: 12px; }
    .field:last-child { border-bottom: none; }
    .label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    .value { font-size: 15px; color: #0f172a; word-break: break-word; }
    .value a { color: #2563eb; text-decoration: none; }
    .footer { background-color: #f8fafc; padding: 16px 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 New Lead Received</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Full Name</div>
        <div class="value">${firstName} ${lastName}</div>
      </div>
      <div class="field">
        <div class="label">Email Address</div>
        <div class="value"><a href="mailto:${email}">${email}</a></div>
      </div>
      <div class="field">
        <div class="label">Phone Number</div>
        <div class="value">${phone}</div>
      </div>
      <div class="field">
        <div class="label">Status</div>
        <div class="value">${status}</div>
      </div>
      <div class="field">
        <div class="label">Notes / Details</div>
        <div class="value">${notes}</div>
      </div>
    </div>
    <div class="footer">
      Received at ${timestamp} • Automated alert from Hono API
    </div>
  </div>
</body>
</html>
`.trim();

  try {
    const response = await withRetry(() =>
      resend.emails.send({
        from: sender,
        to: recipient,
        subject: `New Lead: ${lead.firstName} ${lead.lastName}`,
        text: textContent,
        html: htmlContent,
      }),
    );

    if (response.error) {
      console.error("[Email Service] Resend API error:", response.error);
      return {
        success: false,
        error: response.error.message,
      };
    }

    return {
      success: true,
      messageId: response.data?.id,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown network failure";
    console.error(
      "[Email Service] Unhandled error while sending email:",
      errorMessage,
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
}

