interface BookingAlertPayload {
  name: string;
  email: string;
  phone: string;
  startTime: string;
}

export async function sendWhatsAppBookingAlert(payload: BookingAlertPayload) {
  const {
    META_PHONE_NUMBER_ID,
    META_ACCESS_TOKEN,
    WHATSAPP_RECIPIENT_NUMBER,
    META_TEMPLATE_NAME = "new_booking_alert", // Fallback if env var is missing
  } = process.env;
  
  if (!META_PHONE_NUMBER_ID || !META_ACCESS_TOKEN || !WHATSAPP_RECIPIENT_NUMBER) {
    console.warn("WhatsApp API credentials missing. Skipping alert.");
    return null;
  }

  const url = `https://graph.facebook.com/v20.0/${META_PHONE_NUMBER_ID}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: WHATSAPP_RECIPIENT_NUMBER,
    type: "template",
    template: {
      // Use 'hello_world' here if your custom template isn't approved yet
      name: META_TEMPLATE_NAME,
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: payload.name },
            { type: "text", text: payload.email },
            { type: "text", text: payload.phone },
            { type: "text", text: payload.startTime },
          ],
        },
      ],
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${META_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Meta API Error:", errorData);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to send WhatsApp alert:", error);
    return null;
  }
}
