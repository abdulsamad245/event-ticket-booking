import { body, param, validationResult } from "express-validator"
import type { Request, Response, NextFunction } from "express"

export const validateInitializeEvent = [
  body("name").isString().notEmpty().withMessage("Event name is required"),
  body("totalTickets").isInt({ min: 1 }).withMessage("Total tickets must be a positive integer"),
]

export const validateBookTicket = [
  body("eventId").isInt({ min: 1 }).withMessage("Valid event ID is required"),
  body("userId").isInt({ min: 1 }).withMessage("Valid user ID is required"),
]

export const validateCancelBooking = [
  body("eventId").isInt({ min: 1 }).withMessage("Valid event ID is required"),
  body("userId").isInt({ min: 1 }).withMessage("Valid user ID is required"),
]

export const validateGetEventStatus = [param("eventId").isInt({ min: 1 }).withMessage("Valid event ID is required")]

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return
  }
  next()
}

