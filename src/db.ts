import knex from "knex";
const config = require("../knexfile");

const db = knex(config.development);

console.log(config.development);


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
