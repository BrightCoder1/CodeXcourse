# MERN Stack Backend

This is the backend API for a simple MERN stack user authentication system. It is built with Express, MongoDB, Mongoose, JWT, and cookie-based auth.

## Features

- User registration
- User login
- JWT generation and cookie storage
- Protected profile access
- Profile update
- Profile deletion
- Logout support
- MongoDB connection via Mongoose

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- cookie-parser
- dotenv

## Project Structure

```text
backend/
├── app.js
├── server.js
├── package.json
├── README.md
├── src/
│   ├── config/
│   │   └── db.config.js
│   ├── controllers/
│   │   └── User.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   └── user.models.js
│   └── routes.js
└── .env
```

## Requirements

- Node.js
- npm
- MongoDB running locally or a valid MongoDB connection string

## Setup

1. Open the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mernstack
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=1d
NODE_ENV=development
```

Notes:
- `MONGO_URI` is optional. If it is not provided, the app connects to `mongodb://localhost:27017/mernstack`.
- `JWT_SECRET` should be a long, private, random string.
- `JWT_EXPIRE` is passed directly to `jsonwebtoken`.

4. Start the server:

```bash
node server.js
```

The server runs on port `5000` by default, or the value from `PORT`.

## API Routes

All routes are prefixed with `/api`.

### 1) Home

```http
GET /api/
```

Response:

```json
{
  "message": "Hello, Home page..."
}
```

### 2) Register User

```http
POST /api/register
Content-Type: application/json
```

Request body:

```json
{
  "username": "John",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "your-password"
}
```

Response:

- `201` on success
- `400` if required fields are missing
- `409` if the email already exists
- `500` for server errors

Example success response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "username": "John",
    "email": "john@example.com",
    "phone": "1234567890",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 3) Login User

```http
POST /api/login
Content-Type: application/json
```

Request body:

```json
{
  "email": "john@example.com",
  "password": "your-password"
}
```

On success:
- a JWT is generated
- the token is saved in an HTTP-only cookie named `token`
- the response also includes the token in JSON
- the password is removed from the user object

Response:

```json
{
  "success": true,
  "message": "User Login Successfully!",
  "user": {
    "_id": "...",
    "username": "John",
    "email": "john@example.com",
    "phone": "1234567890"
  },
  "token": "eyJhbGciOi..."
}
```

### 4) Get Profile

```http
GET /api/profile
```

Protected route. It accepts either:

- a Bearer token in the `Authorization` header
- or the `token` cookie

Example:

```http
Authorization: Bearer <jwt-token>
```

Successful response:

```json
{
  "success": true,
  "message": "User profile fetched successfully",
  "user": {
    "_id": "...",
    "username": "John",
    "email": "john@example.com",
    "phone": "1234567890",
    "address": "..."
  }
}
```

### 5) Logout User

```http
GET /api/logout
```

This clears the `token` cookie and returns:

```json
{
  "success": true,
  "message": "User Logout Successfully!"
}
```

### 6) Update Profile

```http
PUT /api/update
Content-Type: application/json
```

Protected route. Any of these fields may be sent:

```json
{
  "username": "John Updated",
  "email": "john.updated@example.com",
  "phone": "9876543210",
  "address": "New York"
}
```

Response:

- `200` on success
- `404` if the user is not found
- `409` if the new email already belongs to another user
- `401` if the token is invalid or missing

### 7) Delete Profile

```http
DELETE /api/delete
```

Protected route. Deletes the logged-in user account and clears the auth cookie.

Response:

```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

## Authentication

Authentication is handled by `src/middleware/auth.middleware.js`.

The middleware checks for a JWT in this order:

1. `Authorization: Bearer <token>` header
2. `token` cookie

If no token is present, or if the token is invalid or expired, the API returns:

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

or

```json
{
  "success": false,
  "message": "Access denied. Please login first."
}
```

## User Model

The Mongoose schema in `src/models/user.models.js` includes:

- `username` (required)
- `email` (required, unique)
- `phone` (required)
- `address` (optional)
- `password` (required)

Passwords are hashed before saving using `bcryptjs`.

## Database Configuration

Connection details are defined in `src/config/db.config.js`.

Default MongoDB URL:

```text
mongodb://localhost:27017/mernstack
```

You can override it with the `MONGO_URI` environment variable in `.env`.

## Notes

- The API uses `app.use('/api', router)` in `app.js`.
- Requests are parsed with `express.json()` and `express.urlencoded()`.
- Cookie settings use `httpOnly: true` and `sameSite: 'lax'`.
- Cookies are marked `secure` when `NODE_ENV=production`.
- There is no automated test suite configured yet; the current `npm test` script is only a placeholder.

## Example Environment File

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mernstack
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=1d
NODE_ENV=development
```
