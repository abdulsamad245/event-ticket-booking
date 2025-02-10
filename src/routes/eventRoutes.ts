import express from "express"
import * as eventController from "../controllers/eventController"
import {
  validateInitializeEvent,
  validateBookTicket,
  validateCancelBooking,
  validateGetEventStatus,
  validate,
} from "../middleware/validation"
import { basicAuthMiddleware } from "../middleware/auth"

export const router = express.Router()

/**
 * @swagger
 * /api/initialize:
 *   post:
 *     summary: Initialize a new event
 *     tags: [Events]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               totalTickets:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/initialize", basicAuthMiddleware, validateInitializeEvent, validate, eventController.initializeEvent)

/**
 * @swagger
 * /api/book:
 *   post:
 *     summary: Book a ticket for a user
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Ticket booked or added to waiting list
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/book", validateBookTicket, validate, eventController.bookTicket)

/**
 * @swagger
 * /api/cancel:
 *   post:
 *     summary: Cancel a booking for a user
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/cancel", validateCancelBooking, validate, eventController.cancelBooking)

/**
 * @swagger
 * /api/status/{eventId}:
 *   get:
 *     summary: Get event status
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event status retrieved successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.get("/status/:eventId", validateGetEventStatus, validate, eventController.getEventStatus)

