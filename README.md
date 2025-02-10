# Event Ticket Booking System

## Setup and Running Instructions

### 1. Clone the repository:
```sh
git clone https://github.com/abdulsamad245/event-ticket-booking.git
cd event-ticket-booking
```

### 2. Install dependencies:
```sh
npm install
```

### 3. Set up the database:

- Ensure PostgreSQL is installed and running.
- Create a new database for the application.

### 4. Set up environment variables:

- Create a `.env` file in the root directory with the following content:
```env
DATABASE_URL=postgres://username:password@localhost:5432/your_database_name
PORT=3000
```
- Replace `username`, `password`, and `your_database_name` with your PostgreSQL credentials.

### 5. Run database migrations:
```sh
npx knex migrate:latest
```

### 6. Start the server:

- For development:
  ```sh
  npm run dev
  ```
- For production:
  ```sh
  npm run build && npm start
  ```

### 7. Access the server:
The server will start on [http://localhost:3000](http://localhost:3000) (or the port specified in the `.env` file).

---

## Design Choices

1. **Node.js and Express**: Chosen for efficiency in building scalable network applications.
2. **PostgreSQL**: A robust, ACID-compliant database suitable for booking systems.
3. **Knex.js**: SQL query builder providing flexibility, migrations, and multi-database support.
4. **TypeScript**: Enhances code quality and maintainability with static typing.
5. **Jest**: Ensures code reliability through unit and integration tests.
6. **Swagger**: Integrated for API documentation to improve developer experience.
7. **Transaction-based operations**: Ensures consistency for booking and waiting list management.
8. **Rate limiting**: Protects against API abuse (100 requests per 15 minutes per IP).
9. **Error handling middleware**: Centralized error management for consistency.
10. **Winston logger**: Provides better debugging and monitoring.

---

## API Documentation

### 1. Initialize Event
- **Method:** `POST`
- **Path:** `/api/initialize`
- **Body:**
  ```json
  {
    "name": "Event Name",
    "totalTickets": 100
  }
  ```
- **Description:** Creates a new event with the given name and ticket count.
- **Authentication:** Basic Auth required (`username: admin`, `password: password123`).

### 2. Book Ticket
- **Method:** `POST`
- **Path:** `/api/book`
- **Body:**
  ```json
  {
    "eventId": 1,
    "userId": 1
  }
  ```
- **Description:** Books a ticket for the specified event and user. Adds user to the waiting list if no tickets are available.

### 3. Cancel Booking
- **Method:** `POST`
- **Path:** `/api/cancel`
- **Body:**
  ```json
  {
    "eventId": 1,
    "userId": 1
  }
  ```
- **Description:** Cancels a booking. If a waiting list exists, assigns the ticket to the next person.

### 4. Get Event Status
- **Method:** `GET`
- **Path:** `/api/status/:eventId`
- **Description:** Returns event details, including available tickets and waiting list count.

---

## Error Handling

- `400 Bad Request`: Invalid input.
- `401 Unauthorized`: Authentication failure.
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Unexpected server issues.

_All error responses include `success: false` and an error message._

---

## Rate Limiting

The API limits requests to **100 requests per 15 minutes per IP**.

---

## Swagger API Documentation

The API is documented using Swagger UI, making it easier to explore and test endpoints.

### Accessing Swagger UI:
1. Start the server.
2. Open [http://localhost:3000/api-docs](http://localhost:3000/api-docs) in a web browser.

### Benefits:
- Interactive API testing.
- Clear endpoint descriptions and request/response schemas.
- Authentication details included for protected routes.

---

## Security Considerations

- Use **HTTPS** in production to secure API communications.
- Implement **user authentication** for booking and cancellation operations.
- Ensure sensitive data (e.g., database credentials) is **never exposed** in the repository.

