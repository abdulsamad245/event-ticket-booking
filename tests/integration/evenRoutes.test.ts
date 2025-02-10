import request from "supertest";
import app from "../../src/server";
import db from "../../src/db";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { Knex } from "knex";

jest.mock("../../src/db");

const mockedDb = db as jest.Mocked<typeof db>;

describe("API Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/initialize", () => {
    it("should initialize a new event", async () => {
      const mockEvent = { id: 1, name: "Test Event", total_tickets: 100, available_tickets: 100 }
      ;(mockedDb as any).insert.mockResolvedValue([mockEvent])

      const response = await request(app)
        .post("/api/initialize")
        .auth("admin", "password123")
        .send({ name: "Test Event", totalTickets: 100 })

      expect(response.status).toBe(201)
      expect(response.body).toEqual({
        success: true,
        data: mockEvent,
        message: "Event created successfully",
      })
    })

    it("should return 400 for invalid input", async () => {
      const response = await request(app)
        .post("/api/initialize")
        .auth("admin", "password123")
        .send({ name: "", totalTickets: -1 })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty("errors")
    })

    it("should return 401 for unauthorized access", async () => {
      const response = await request(app).post("/api/initialize").send({ name: "Test Event", totalTickets: 100 })

      expect(response.status).toBe(401)
    })
  })

  describe("POST /api/book", () => {
    it("should book a ticket", async () => {
      const mockEvent = { id: 1, name: "Test Event", total_tickets: 100, available_tickets: 1 };
      const mockTransaction = {
        where: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockReturnThis(),
        first: jest.fn<() => Promise<typeof mockEvent>>().mockResolvedValue(mockEvent),
        decrement: jest.fn<() => Promise<number>>().mockResolvedValue(1),
        insert: jest.fn<() => Promise<{ id: number }>>().mockResolvedValue({ id: 1 }),
      };
      mockedDb.transaction.mockImplementation((callback: any) => callback(mockTransaction as unknown as Knex.Transaction));

      const response = await request(app).post("/api/book").send({ eventId: 1, userId: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Ticket booked successfully",
      });
    });

    it("should add to waiting list when sold out", async () => {
      const mockEvent = { id: 1, name: "Test Event", total_tickets: 100, available_tickets: 0 };
      const mockTransaction = {
        where: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockReturnThis(),
        first: jest.fn<() => Promise<typeof mockEvent>>().mockResolvedValue(mockEvent),
        insert: jest.fn<() => Promise<{ id: number }>>().mockResolvedValue({ id: 1 }),
      };
      mockedDb.transaction.mockImplementation((callback: any) => callback(mockTransaction as unknown as Knex.Transaction));

      const response = await request(app).post("/api/book").send({ eventId: 1, userId: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Added to waiting list",
      });
    });

    it("should return 404 when event is not found", async () => {
      const mockTransaction = {
        where: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockReturnThis(),
        first: jest.fn<() => Promise<null>>().mockResolvedValue(null),
      };
      mockedDb.transaction.mockImplementation((callback: any) => callback(mockTransaction as unknown as Knex.Transaction));

      const response = await request(app).post("/api/book").send({ eventId: 1, userId: 1 });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "Event not found",
      });
    });
  });

  describe("POST /api/cancel", () => {
    it("should cancel a booking", async () => {
      const mockBooking = { id: 1, event_id: 1, user_id: 1 };
      const mockTransaction = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn<() => Promise<typeof mockBooking>>().mockResolvedValue(mockBooking),
        del: jest.fn<() => Promise<number>>().mockResolvedValue(1),
        increment: jest.fn<() => Promise<number>>().mockResolvedValue(1),
        orderBy: jest.fn().mockReturnThis(),
        insert: jest.fn<() => Promise<{ id: number }>>().mockResolvedValue({ id: 1 }),
      };
      mockedDb.transaction.mockImplementation((callback: any) => callback(mockTransaction as unknown as Knex.Transaction));

      const response = await request(app).post("/api/cancel").send({ eventId: 1, userId: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Booking cancelled successfully",
      });
    });

    it("should return 404 when booking is not found", async () => {
      const mockTransaction = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn<() => Promise<null>>().mockResolvedValue(null),
      };
      mockedDb.transaction.mockImplementation((callback: any) => callback(mockTransaction as unknown as Knex.Transaction));

      const response = await request(app).post("/api/cancel").send({ eventId: 1, userId: 1 });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "Booking not found",
      });
    });
  });

  describe("GET /api/status/:eventId", () => {
    it("should get event status", async () => {
      const mockEvent = { id: 1, name: "Test Event", total_tickets: 100, available_tickets: 50 };
      const mockWaitingListCount = { count: "5" };

      mockedDb.where.mockImplementation(() => ({
        first: jest.fn<() => Promise<typeof mockEvent>>().mockResolvedValue(mockEvent),
      }) as any);

      mockedDb.where.mockImplementation(() => ({
        count: jest.fn().mockReturnValue({
          first: jest.fn<() => Promise<typeof mockWaitingListCount>>().mockResolvedValue(mockWaitingListCount),
        }),
      }) as any);

      const response = await request(app).get("/api/status/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          eventId: 1,
          name: "Test Event",
          availableTickets: 50,
          waitingListCount: 5,
        },
        message: "Event status retrieved successfully",
      });
    });

    it("should return 404 when event is not found", async () => {
      mockedDb.where.mockImplementation(() => ({
        first: jest.fn<() => Promise<null>>().mockResolvedValue(null),
      }) as any);

      const response = await request(app).get("/api/status/1");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "Event not found",
      });
    });
  });
});
