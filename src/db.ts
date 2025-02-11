import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const config = require("../knexfile");

const environment = process.env.ENVIRONMENT || "development";

const db = knex(config[environment]);

console.log(config[environment]);

// Test if the connection was successful
db.raw("SELECT 1")
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.error("Database connection failed", err);
    process.exit(1);
  });

export default db;
