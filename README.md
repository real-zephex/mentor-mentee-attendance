# Mentor-Mentee Attendance System

A streamlined web application for tracking student attendance in a mentor-mentee relationship.

## Features

- **Student Management**: Add and maintain student records (Roll Number, Name, Contact, etc.).
- **Session Tracking**: Create time-stamped sessions for daily tracking.
- **Attendance Marking**: Real-time attendance submission for students in active sessions.
- **Overview Dashboard**: Consolidated matrix view of attendance records across all students and dates.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database/Backend**: Convex (Real-time sync)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Shadcn/UI
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed.
- A [Convex](https://www.convex.dev/) account.

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   bun install
   ```
3. Set up Convex:
   ```bash
   npx convex dev
   ```
4. Run the development server:
   ```bash
   bun dev
   ```

## Usage

1. **Dashboard**: Navigate to `/dashboard` to manage students, create new sessions, or mark attendance for the day.
2. **Overview**: Visit `/overview` to see the complete history of student participation in a table format.

## Production Build

```bash
bun run build
```
