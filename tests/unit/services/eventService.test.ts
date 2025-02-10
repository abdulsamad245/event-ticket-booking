import * as eventService from "../../../src/services/eventService";
import db from "../../../src/db";
import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import type { Knex } from "knex";

jest.mock("../../../src/db");

const mockedDb = db as jest.Mocked<typeof db>;

describe("Event Service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initializeEvent", () => {
    it("should create a new event", async () => {
      const mockEvent = {
        id: 1,
        name: "Test Event",
        total_tickets: 100,
        available_tickets: 100,
      };
      (mockedDb as any).insert.mockResolvedValue([{ id: 1 }]);

      const result = await eventService.initializeEvent("Test Event", 100);
      expect(result).toEqual(mockEvent);
    });
  });

  describe("bookTicket", () => {
    it("should book a ticket when available", async () => {
      const mockEvent = {
        id: 1,
        name: "Test Event",
        total_tickets: 100,
        available_tickets: 1,
      };
      const mockTransaction = {
        where: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockReturnThis(),
        first: jest
          .fn<() => Promise<typeof mockEvent>>()
          .mockResolvedValue(mockEvent),
        decrement: jest.fn<() => Promise<number>>().mockResolvedValue(1),
        insert: jest
          .fn<() => Promise<{ id: number }>>()
          .mockResolvedValue({ id: 1 }),
      };
      mockedDb.transaction.mockImplementation((callback: any) =>
        callback(mockTransaction as unknown as Knex.Transaction)
      );

      const result = await eventService.bookTicket(1, 1);
      expect(result).toEqual({ message: "Ticket booked successfully" });
    });

    it("should add to waiting list when no tickets available", async () => {
      const mockEvent = {
        id: 1,
        name: "Test Event",
        total_tickets: 100,
        available_tickets: 0,
      };
      const mockTransaction = {
        where: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockReturnThis(),
        first: jest
          .fn<() => Promise<typeof mockEvent>>()
          .mockResolvedValue(mockEvent),
        insert: jest
          .fn<() => Promise<{ id: number }>>()
          .mockResolvedValue({ id: 1 }),
      };
      mockedDb.transaction.mockImplementation((callback: any) =>
        callback(mockTransaction as unknown as Knex.Transaction)
      );

      const result = await eventService.bookTicket(1, 1);
      expect(result).toEqual({ message: "Added to waiting list" });
    });

    it("should throw an error when event is not found", async () => {
      const mockTransaction = {
        where: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockReturnThis(),
        first: jest.fn<() => Promise<null>>().mockResolvedValue(null),
      };
      mockedDb.transaction.mockImplementation((callback: any) =>
        callback(mockTransaction as unknown as Knex.Transaction)
      );

      await expect(eventService.bookTicket(1, 1)).rejects.toThrow(
        "Event not found"
      );
    });
  });

  describe("cancelBooking", () => {
    it("should cancel a booking successfully", async () => {
      const mockBooking = { id: 1, event_id: 1, user_id: 1 };
      const mockTransaction = {
        where: jest.fn().mockReturnThis(),
        first: jest
          .fn<() => Promise<typeof mockBooking>>()
          .mockResolvedValue(mockBooking),
        del: jest.fn<() => Promise<number>>().mockResolvedValue(1),
        increment: jest.fn<() => Promise<number>>().mockResolvedValue(1),
        orderBy: jest.fn().mockReturnThis(),
        insert: jest
          .fn<() => Promise<{ id: number }>>()
          .mockResolvedValue({ id: 1 }),
      };
      mockedDb.transaction.mockImplementation((callback: any) =>
        callback(mockTransaction as unknown as Knex.Transaction)
      );

      const result = await eventService.cancelBooking(1, 1);
      expect(result).toEqual({ message: "Booking cancelled successfully" });
    });

    it("should reassign ticket to waiting list user on cancellation", async () => {
      const mockBooking = { id: 1, event_id: 1, user_id: 1 };
      const mockWaitingListUser = { id: 2, event_id: 1, user_id: 2 };
      const mockTransaction = {
        where: jest.fn().mockReturnThis(),
        first: jest
          .fn<() => Promise<typeof mockBooking>>()
          .mockResolvedValueOnce(mockBooking)
          .mockResolvedValueOnce(mockWaitingListUser),
        del: jest.fn<() => Promise<number>>().mockResolvedValue(1),
        increment: jest.fn<() => Promise<number>>().mockResolvedValue(1),
        orderBy: jest.fn().mockReturnThis(),
        insert: jest
          .fn<() => Promise<{ id: number }>>()
          .mockResolvedValue({ id: 2 }),
        decrement: jest.fn<() => Promise<number>>().mockResolvedValue(1),
      };
      mockedDb.transaction.mockImplementation((callback: any) =>
        callback(mockTransaction as unknown as Knex.Transaction)
      );

      const result = await eventService.cancelBooking(1, 1);
      expect(result).toEqual({ message: "Booking cancelled successfully" });
    });

    it("should throw an error when booking is not found", async () => {
      const mockTransaction = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn<() => Promise<null>>().mockResolvedValue(null),
      };
      mockedDb.transaction.mockImplementation((callback: any) =>
        callback(mockTransaction as unknown as Knex.Transaction)
      );

      await expect(eventService.cancelBooking(1, 1)).rejects.toThrow(
        "Booking not found"
      );
    });
  });

  describe("getEventStatus", () => {
    it("should return event status", async () => {
      const mockEvent = {
        id: 1,
        name: "Test Event",
        total_tickets: 100,
        available_tickets: 50,
      };
      const mockWaitingListCount = { count: "5" };
      (mockedDb as any).where.mockReturnValue({
        first: jest
          .fn<() => Promise<typeof mockEvent>>()
          .mockResolvedValue(mockEvent),
      });
      (mockedDb as any).where.mockReturnValue({
        count: jest.fn().mockReturnValue({
          first: jest
            .fn<() => Promise<typeof mockWaitingListCount>>()
            .mockResolvedValue(mockWaitingListCount),
        }),
      });

      const result = await eventService.getEventStatus(1);
      expect(result).toEqual({
        eventId: 1,
        name: "Test Event",
        availableTickets: 50,
        waitingListCount: 5,
      });
    });

    it("should throw an error when event is not found", async () => {
      (mockedDb as any).where.mockReturnValue({
        first: jest.fn<() => Promise<null>>().mockResolvedValue(null),
      });

      await expect(eventService.getEventStatus(1)).rejects.toThrow(
        "Event not found"
      );
    });
  });
});
