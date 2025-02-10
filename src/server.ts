import express from "express"
import dotenv from "dotenv"
import swaggerUi from "swagger-ui-express"
import swaggerJsdoc from "swagger-jsdoc"
import { router as eventRoutes } from "./routes/eventRoutes"
import { errorHandler } from "./middleware/errorHandler"
import { notFound } from "./middleware/notFound"
import { requestLogger } from "./middleware/requestLogger"
import logger from "./utils/logger"
import rateLimit from "express-rate-limit"

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(requestLogger)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})

// Apply rate limiter to all routes
app.use(limiter)

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Event Ticket Booking API",
      version: "1.0.0",
      description: "API for an event ticket booking system",
    },
    components: {
      securitySchemes: {
        basicAuth: {
          type: "http",
          scheme: "basic",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
}


const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use("/api", eventRoutes)

app.use(notFound)
app.use(errorHandler)

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`)
  })
}

export default app

