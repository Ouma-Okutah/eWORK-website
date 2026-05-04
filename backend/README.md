# eWORK AI Backend

This is the backend API starter for the eWORK AI marketing site, student portal, online classes, and course enrollment flow.

## Stack

- Node.js 20+
- Express
- Local JSON datastore for development
- Built-in password hashing with Node crypto
- Signed bearer tokens

The datastore lives at `backend/data/db.json` after the server starts. It can later be replaced with PostgreSQL without changing the API shape.

## Setup

If using the portable Node runtime downloaded into this project:

```powershell
cd C:\web2
.\start-backend.ps1
```

Or with a system Node.js installation:

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

The API runs on:

```text
http://localhost:4000
```

The backend also serves the frontend from the same address:

```text
http://localhost:4000
```

## Core Endpoints

Health:

```http
GET /api/health
```

Auth:

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

Courses and AI branches:

```http
GET /api/courses
GET /api/courses/:id
GET /api/branches
```

Placement and enrollment:

```http
POST /api/assessments/placement
POST /api/enrollments
GET /api/me/dashboard
PATCH /api/progress/:courseId
```

Certificates:

```http
POST /api/certificates
GET /api/certificates/verify/:code
```

Online classes:

```http
POST /api/meetings
GET /api/meetings/:id
```

Messages and support:

```http
GET /api/messages
POST /api/messages
```

Admin:

```http
GET /api/admin/summary
```

The first registered user is automatically created as `admin`; later users are `student`.

## Example Register Request

```bash
curl -X POST http://localhost:4000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\":\"Amina Learner\",\"email\":\"amina@example.com\",\"password\":\"Passw0rd!\",\"phone\":\"+254700000000\",\"country\":\"Kenya\",\"profile\":{\"field\":\"Business\",\"experienceLevel\":\"Beginner\",\"careerGoal\":\"Automate operations\"}}"
```

Use the returned token as:

```http
Authorization: Bearer YOUR_TOKEN
```

## Next Backend Steps

- Replace JSON datastore with PostgreSQL.
- Add real payment webhooks for Stripe, PayPal, and mobile money.
- Add email/SMS/WhatsApp notification providers.
- Add file upload storage for assignments and projects.
- Add role-specific admin endpoints for course creation and instructor assignment.
