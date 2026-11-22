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

### Employee Registration

```http
POST /api/employeeregister
Content-Type: application/json
```

Required request fields: `employee_name`, `email`, `address`, `contact_number`,
`dob`, `employee_qualification`, `bank_account`, `ifsc_code`, `password`,
`emp_dpt`, `course`, `aadhar`, and `pan`. The server generates an immutable,
unique `employee_id` for each new employee and returns it in the `employee`
object. The optional `designation` field stores the employee's job title,
separate from their account role. `POST /api/register` remains an alias for
this endpoint. The admin dashboard submits this request through its Vite
development proxy; run the backend on port `5000` or set `API_PROXY_TARGET` to
the backend origin before starting the admin development server.

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

## Attendance Module

Attendance reuses the existing `Student`, `Course`, and `User` collections.
Teachers are existing users with `emp_role: "employee"`; administrators use
`emp_role: "admin"`. Student enrollment continues to use the existing
`Student.course` text field, which must match a course name or course code for
the student to appear in that course's attendance roster.
Student course attendance is recorded per course and date, never as a
separate full-day student mark. Students must check in and check out; the
server calculates total minutes at checkout. Students can also submit a
course-specific leave application with a date and reason.

Run the additive, repeatable attendance index migration from `backend/` after
configuring `MONGO_URI`:

```powershell
npm run migrate:attendance
```

It creates the `course_assignments`, `attendance_sessions`,
`student_attendance`, `daily_attendance`, and `employee_attendance` collections
and their indexes. `daily_attendance` is retained for legacy data but is no
longer used by student attendance. Course attendance records store check-in and
check-out timestamps, server-calculated minutes, status, leave reason, marker
type, and the optional attendance session.

Staff attendance routes require a staff JWT, supplied as a Bearer token or
the existing `token` cookie. Student attendance routes require the student JWT.

- `GET /api/attendance/me` returns the authenticated staff account.
- `GET /api/attendance/teacher/courses` lists only the signed-in employee's assigned courses.
- `GET /api/attendance/teacher/courses/:courseId/students?date=YYYY-MM-DD` loads the class roster, status, in/out times, and recorded minutes.
- `POST /api/attendance/teacher/courses/:courseId/session` opens a 10-minute session by default; `durationMinutes` may be set from 1 to 240.
- `PATCH /api/attendance/teacher/sessions/:sessionId/close` closes the attendance window.
- `GET /api/attendance/teacher/history?courseId=...&from=YYYY-MM-DD&to=YYYY-MM-DD` returns history for an assigned course.
- `GET /api/attendance/student` returns the authenticated student's enrolled courses and any in-progress or completed course record.
- `POST /api/attendance/student/courses/:courseId/mark` accepts `{ "action": "check-in" }` any time today for an enrolled course and `{ "action": "check-out" }` after check-in. No teacher-opened session is required; attendance becomes present and time is calculated only at checkout.
- `POST /api/attendance/student/courses/:courseId/leave` accepts `{ "date": "YYYY-MM-DD", "reason": "..." }` for a course-specific leave application.
- `GET /api/attendance/student/history?from=YYYY-MM-DD&to=YYYY-MM-DD&courseId=...` returns course records, status, in/out times, total minutes, and attendance percentages.
- `GET /api/attendance/admin/summary` returns today's course attendance and employee counts, including currently checked-in students.
- `GET /api/attendance/admin/students` lists filtered course attendance records and accepts `name` and `studentId` filters. The ID filter searches the student's database ID, roll number, application number, or admission number. `PUT /api/attendance/admin/students/:attendanceId` lets administrators change a student's course attendance status without changing recorded in/out times. `/api/attendance/admin/employees` lists filtered employee attendance. Administrators can export student and employee records as CSV in the admin UI.
- `PUT /api/attendance/admin/employees/:employeeId` creates or edits an employee's daily attendance.
- `GET /api/attendance/admin/assignments` and `PUT /api/attendance/admin/assignments` read/update teacher course assignments.
- `GET /api/attendance/admin/courses/:courseId/students` lists registered students and the IDs currently assigned to the course. `PUT` on the same path accepts `{ "studentIds": ["..."] }` to replace that course's roster; students can be assigned to multiple courses, and an empty list removes all assignments for that course.

Teacher session controls are optional and do not gate student check-in or
check-out.

Admin attendance routes enforce the administrator role; teacher routes enforce
the employee role and verify course assignment on each roster, history, and
session request. Student routes require the student JWT and derive the student
ID exclusively from that session. Enrolled students can check in any time today
without a teacher attendance window; checkout requires an active check-in.
Leave can be requested for today or a future date and is unique per student,
course, and date. Attendance dates cannot be in the future except for leave
applications. In-progress records are excluded from attendance percentages.

## Notes

- The API uses `app.use('/api', router)` in `app.js`.
- Requests are parsed with `express.json()` and `express.urlencoded()`.
- Cookie settings use `httpOnly: true` and `sameSite: 'lax'`.
- Cookies are marked `secure` when `NODE_ENV=production`.
- Run `npm test` from `backend/` for the focused student self-attendance controller tests.

## Example Environment File

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mernstack
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=1d
NODE_ENV=development
```
