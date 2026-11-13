import type { LeadFormData, ApiResult } from "../entities/lead";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.arkansastrademarketing.com";

/**
 * Writes new lead data from a multi-stage form to the Hono API endpoint.
 */
export async function createLead<T = unknown>(
  formData: LeadFormData,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const body = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: body.error || "Failed to create lead",
        issues: body.issues, // Contains Zod field errors if validation failed
      };
    }

    return {
      success: true,
      data: body as T,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
}
