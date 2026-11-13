/**
 * Interface matching the payload expected from a multi-stage form
 * to create a new lead in your Hono + MySQL API.
 */
export interface LeadFormData {
  // Stage 1: Personal Details
  firstName: string;
  lastName: string;

  // Stage 2: Contact Info
  email: string;
  phone?: string;

  // Stage 3: Lead Meta / Notes
  status?: "new" | "contacted" | "qualified" | "lost";
  notes?: string;
}

/**
 * Standard API response wrapper matching Hono + Zod error structure
 */
export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  issues?: Record<string, string[]>;
}

