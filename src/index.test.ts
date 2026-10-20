import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "./index.js";
import { db } from "./db/index.js";

vi.mock("./db", () => ({
  db: {
    insert: vi.fn(),
    query: {
      leads: {
        findFirst: vi.fn(),
      },
    },
  },
}));

describe("Leads API Endpoints (MySQL)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /leads", () => {
    it("creates a lead when given valid minimal input", async () => {
      const mockLead = {
        id: 1,
        firstName: "Alex",
        lastName: "Smith",
        email: "alex@example.com",
        phone: null,
        status: "new",
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mock MySQL insert returning ResultSetHeader
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
      } as any);

      // Mock the subsequent select query by insertId
      vi.mocked(db.query.leads.findFirst).mockResolvedValue(mockLead as any);

      const res = await app.request("/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Alex",
          lastName: "Smith",
          email: "alex@example.com",
        }),
      });

      const expected = 201;
      const actual = res.status;

      expect(actual).toBe(expected);

      const data = await res.json();
      expect(data).toEqual(mockLead);
    });

    it("creates a lead when optional fields are provided", async () => {
      const mockLead = {
        id: 2,
        firstName: "Alex",
        lastName: "Smith",
        email: "alex@example.com",
        phone: "123-456-7890",
        status: "new",
        notes: "Enterprise prospect",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
      } as any);

      vi.mocked(db.query.leads.findFirst).mockResolvedValue(mockLead as any);

      const res = await app.request("/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Alex",
          lastName: "Smith",
          email: "alex@example.com",
          phone: "123-456-7890",
          notes: "Enterprise prospect",
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.phone).toBe("123-456-7890");
      expect(data.notes).toBe("Enterprise prospect");
    });

    it("returns 400 when required fields are missing", async () => {
      const res = await app.request("/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: "Alex" }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Validation failed");
      expect(data.issues).toHaveProperty("lastName");
      expect(data.issues).toHaveProperty("email");
    });

    it("returns 400 when email address is invalid", async () => {
      const res = await app.request("/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Alex",
          lastName: "Smith",
          email: "invalid-email-format",
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Validation failed");
      expect(data.issues.email).toContain("Invalid email address format");
    });
  });

  describe("GET /leads/:id", () => {
    it("returns 200 and lead when found", async () => {
      const mockLead = {
        id: 10,
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        status: "new",
      };

      vi.mocked(db.query.leads.findFirst).mockResolvedValue(mockLead as any);

      const res = await app.request("/leads/10");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockLead);
    });

    it("returns 404 when lead does not exist", async () => {
      vi.mocked(db.query.leads.findFirst).mockResolvedValue(undefined);

      const res = await app.request("/leads/999");

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toEqual({ error: "Lead not found" });
    });

    it("returns 400 when ID parameter is non-numeric", async () => {
      const res = await app.request("/leads/abc");

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Validation failed");
      expect(data.issues).toHaveProperty("id");
    });

    it("returns 400 when ID parameter is non-positive", async () => {
      const res = await app.request("/leads/-5");

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Validation failed");
      expect(data.issues).toHaveProperty("id");
    });
  });
});

