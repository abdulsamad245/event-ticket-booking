import type { Request, Response, NextFunction } from "express"
import * as eventService from "../services/eventService";
import logger from "../utils/logger";

const sendResponse = (res: Response, status: number, success: boolean, data?: any, message?: string) => {
  const response: any = { success }
  if (data) response.data = data
  if (message) response.message = message
  res.status(status).json(response)
}

export const initializeEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, totalTickets } = req.body
    const event = await eventService.initializeEvent(name, totalTickets)
    sendResponse(res, 201, true, event, "Event created successfully")
  } catch (error) {
    logger.error("Error initializing event:", error)
    sendResponse(res, 500, false, null, "Failed to initialize event")
  }
}

export const bookTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, userId } = req.body
    const result = await eventService.bookTicket(eventId, userId)
    sendResponse(res, 200, true, null, result.message)
  } catch (error) {
    logger.error("Error booking ticket:", error)
    if (error instanceof Error && error.message === "Event not found") {
      sendResponse(res, 404, false, null, "Event not found")
    } else {
      sendResponse(res, 500, false, null, "Failed to book ticket")
    }
  }
}

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, userId } = req.body
    const result = await eventService.cancelBooking(eventId, userId)
    sendResponse(res, 200, true, null, result.message)
  } catch (error) {
    logger.error("Error cancelling booking:", error)
    if (error instanceof Error && error.message === "Booking not found") {
      sendResponse(res, 404, false, null, "Booking not found")
    } else {
      sendResponse(res, 500, false, null, "Failed to cancel booking")
    }
  }
}

export const getEventStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.params
    const status = await eventService.getEventStatus(Number.parseInt(eventId))
    sendResponse(res, 200, true, status, "Event status retrieved successfully")
  } catch (error) {
    logger.error("Error getting event status:", error)
    if (error instanceof Error && error.message === "Event not found") {
      sendResponse(res, 404, false, null, "Event not found")
    } else {
      sendResponse(res, 500, false, null, "Failed to get event status")
    }
  }
}

