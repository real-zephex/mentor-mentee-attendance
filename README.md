# Mentor-Mentee Attendance

Attendance management system for multi-teacher, multi-subject classrooms built with Next.js, Convex, and Clerk.

## Features

- Role-based access with Clerk authentication and Convex authorization (admin, teacher, student, user).
- Admin verification workflow to approve users, assign roles, and link student records.
- Class, student, and subject management with validation and indexing.
- Session scheduling tied to class + subject + teacher with date/time metadata.
- Attendance recording per session with bulk defaults and status tracking.
- Attendance analytics matrix with subject filter, date range filter, sorting, and stats.
- Teacher views restricted to their sessions and assigned subjects.
- Cascade cleanup when deleting classes/students to prevent orphaned attendance.

## How It Works

### Authentication and User Lifecycle

1. Users sign in via Clerk.
2. Clerk webhooks create/update/delete users in Convex.
3. New users are marked as `pending` until an admin confirms access.
4. Admins approve users, set roles, and can link student accounts.

### Core Data Model

- `users`: role, status, and optional student link.
- `classes`: class name, year, and room.
- `students`: roll number, name, and class.
- `subjects`: subject name, code, and assigned teacher.
- `sessions`: class, subject, date/time, remarks, and creator.
- `attendance`: session + student + status (`P`, `A`, `DL`, `UM`).

### Session -> Attendance Flow

1. A session is created for a class and subject.
2. Convex pre-creates attendance rows for every student in the class with status `UM`.
3. Teachers update attendance statuses during or after the session.

### Attendance Matrix Analytics

1. Pick a class in the Analysis tab.
2. Filter sessions by subject and date range.
3. Sort students by roll, name, or attendance percentage.
4. Stats show good/fair/poor buckets and class average.

## UI Areas

- **Analysis**: class selection and attendance matrix analytics.
- **Students**: admin-only student CRUD.
- **Classes**: admin-only class CRUD.
- **Sessions**: session scheduling and editing; teachers see only their sessions.
- **Attendance**: per-session attendance marking and filtering.
- **Admin Dashboard**: user verification and subject management.

## Tech Stack

- Next.js App Router + React 19
- Convex for database, queries, and mutations
- Clerk for authentication and webhooks
- Tailwind CSS v4 + shadcn/ui

## Local Setup

### Requirements

- Bun
- Convex CLI (via `bunx convex`)
- Clerk application with JWT template `convex`

### Environment Variables

Set the following in your local environment (typically `.env.local`):

```
NEXT_PUBLIC_CONVEX_URL=
CLERK_JWT_ISSUER_DOMAIN=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Notes:
- `CLERK_JWT_ISSUER_DOMAIN` must match the Clerk JWT template `convex`.
- `CLERK_WEBHOOK_SECRET` is used by the Convex HTTP webhook handler.

### Clerk Webhook Setup

- Create a Clerk webhook that points to your Convex HTTP endpoint (root path).
- Subscribe to: `user.created`, `user.updated`, `user.deleted`.

### Running Locally

In one terminal, start Convex:

```
bunx convex dev
```

In another terminal, start Next.js:

```
bun run dev
```

Open `http://localhost:3000`.

### Scripts

```
bun run dev
bun run build
bun run lint
```

## Project Structure

- `app/`: Next.js routes and layout
- `components/custom/`: feature components (attendance, sessions, overview, admin)
- `components/ui/`: shadcn UI primitives
- `convex/`: schema, auth config, queries, mutations, and webhooks
- `hooks/`: shared hooks for data access and auth state

## Operational Notes

- Only admin and teacher roles can access the main UI.
- Students are managed as records and can be linked to users for reporting.
- There is no automated test suite; use `bun run build` and `bun run lint` for validation.
