import db from "../db"
import logger from "../utils/logger"

export const initializeEvent = async (name: string, totalTickets: number) => {
  const [event] = await db("events")
    .insert({
      name,
      total_tickets: totalTickets,
      available_tickets: totalTickets,
    })
    .returning("*")
  logger.info(`Event created: ${JSON.stringify(event)}`)
  return event
}

export const bookTicket = async (eventId: number, userId: number) => {
  return db.transaction(async (trx) => {
    const event = await trx("events").where({ id: eventId }).forUpdate().first()

    if (!event) {
      throw new Error("Event not found")
    }

    if (event.available_tickets > 0) {
      await trx("events").where({ id: eventId }).decrement("available_tickets", 1)

      await trx("bookings").insert({ event_id: eventId, user_id: userId })

      logger.info(`Ticket booked: Event ${eventId}, User ${userId}`)
      return { message: "Ticket booked successfully" }
    } else {
      await trx("waiting_list").insert({ event_id: eventId, user_id: userId })
      logger.info(`Added to waiting list: Event ${eventId}, User ${userId}`)
      return { message: "Added to waiting list" }
    }
  })
}

export const cancelBooking = async (eventId: number, userId: number) => {
  return db.transaction(async (trx) => {
    const booking = await trx("bookings").where({ event_id: eventId, user_id: userId }).first()

    if (!booking) {
      throw new Error("Booking not found")
    }

    await trx("bookings").where({ id: booking.id }).del()

    await trx("events").where({ id: eventId }).increment("available_tickets", 1)

    const nextInWaitingList = await trx("waiting_list")
      .where({ event_id: eventId })
      .orderBy("created_at", "asc")
      .first()

    if (nextInWaitingList) {
      await trx("waiting_list").where({ id: nextInWaitingList.id }).del()

      await trx("bookings").insert({ event_id: eventId, user_id: nextInWaitingList.user_id })

      await trx("events").where({ id: eventId }).decrement("available_tickets", 1)

      logger.info(`Ticket reassigned: Event ${eventId}, User ${nextInWaitingList.user_id}`)
    }

    logger.info(`Booking cancelled: Event ${eventId}, User ${userId}`)
    return { message: "Booking cancelled successfully" }
  })
}

export const getEventStatus = async (eventId: number) => {
  const event = await db("events").where({ id: eventId }).first()

  if (!event) {
    throw new Error("Event not found")
  }

  const waitingListCount = await db("waiting_list").where({ event_id: eventId }).count("id as count").first()

  return {
    eventId: event.id,
    name: event.name,
    availableTickets: event.available_tickets,
    waitingListCount: Number.parseInt(waitingListCount?.count as string) || 0,
  }
}

