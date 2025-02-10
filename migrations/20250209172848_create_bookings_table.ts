import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("bookings", (table) => {
    table.increments("id").primary()
    table.integer("event_id").references("id").inTable("events").onDelete("CASCADE")
    table.integer("user_id").notNullable()
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("bookings")
}

