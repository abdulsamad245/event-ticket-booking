// import knex from "knex";
// const config = require("../knexfile");

// const db = knex(config.development);

// console.log(config.development);

import knex from "knex"
import dotenv from "dotenv"

dotenv.config()

const db = knex({
  client: "pg",
  connection: process.env.DATABASE_URL,
  pool: {
    min: 2,
    max: 20,
  },
})

// export default db



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
