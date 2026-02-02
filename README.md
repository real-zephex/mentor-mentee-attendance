# Mentor-Mentee Attendance System

A modern, full-stack web application for managing student records and tracking attendance across mentoring sessions. Built with Next.js, Convex, and TypeScript.

## 🎯 Features

### Core Functionality
- **Student Management**
  - Add new student records with comprehensive details (name, roll number, email, phone, DOB)
  - View all students in an organized table format with all details
  - Delete student records with cascading deletion of associated attendance records
  - Real-time validation and error handling

- **Session Management**
  - Create new mentoring sessions with date, time, and remarks
  - Track multiple sessions for attendance marking

- **Attendance Tracking**
  - Mark attendance for students per session (Present/Absent)
  - Real-time attendance status updates
  - Automatic association of attendance with student records

- **Attendance Overview**
  - Comprehensive dashboard showing attendance across all sessions
  - Student-level attendance percentage calculation
  - Color-coded attendance indicators (Green for Present, Red for Absent)
  - Sortable and scrollable table for easy data exploration
  - Visual indicators for low attendance (< 75%)

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16.1.6](https://nextjs.org/) - React-based framework with App Router
- **UI Library**: [React 19.2.3](https://react.dev/)
- **Type Safety**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with [PostCSS](https://postcss.org/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) - Headless component library
- **Form Management**: [React Hook Form 7.71.1](https://react-hook-form.com/) with [Zod 4.3.6](https://zod.dev/) validation
- **Icons**: [Lucide React 0.563.0](https://lucide.dev/)
- **Notifications**: [Sonner 2.0.7](https://sonner.emilkowal.ski/)
- **Charts**: [Recharts 2.15.4](https://recharts.org/)
- **Utilities**: 
  - clsx for className management
  - date-fns for date manipulation
  - class-variance-authority for variant management

### Backend
- **Database**: [Convex 1.31.6](https://www.convex.dev/) - Serverless backend with real-time database
- **Schema Definition**: Convex with TypeScript support

### Development Tools
- **Linting**: ESLint 9
- **Build Tool**: Next.js built-in

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A [Convex](https://www.convex.dev/) account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mentor-mentee-attendance.git
   cd mentor-mentee-attendance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Convex**
   ```bash
   npm install -g convex
   npx convex init
   ```
   Follow the prompts to set up your Convex project.

4. **Environment Configuration**
   Create a `.env.local` file in the root directory with your Convex credentials:
   ```env
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Usage

### Home Page
Navigate to the application's home page to access:
- **Management Dashboard** - Add students, create sessions, and mark attendance
- **Attendance Overview** - View consolidated attendance records

### Management Dashboard
The dashboard is organized into three tabs:

#### 1. Add Students Tab
- Fill in student details: Name, Roll Number, Email, Phone, and Date of Birth
- Click "Submit" to add the student
- View all existing students in a table below the form
- Delete students using the delete button (removes student and all associated attendance records)

#### 2. New Session Tab
- Create a new session with:
  - Session ID (unique identifier)
  - Session Date
  - Start and End Time
  - Remarks (optional notes about the session)
- Click "Submit" to create the session

#### 3. Mark Attendance Tab
- Select a session date
- Select students and their attendance status (Present/Absent)
- Submit to record attendance

### Attendance Overview
- Access via "View Records" button on home page
- View a comprehensive table showing:
  - All students (sorted by roll number)
  - Attendance status for each session
  - Overall attendance percentage for each student
  - Color-coded indicators: Green (≥75% attendance), Red (<75% attendance)

## 📁 Project Structure

```
mentor-mentee-attendance/
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Home page with navigation
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── dashboard/
│   │   └── page.tsx             # Management dashboard
│   └── overview/
│       └── page.tsx             # Attendance overview
├── components/
│   ├── custom/                  # Custom components
│   │   ├── studentForm.tsx      # Student management form + list
│   │   ├── studentsList.tsx     # Students table component
│   │   ├── sessionForm.tsx      # Session creation form
│   │   └── attendanceForm.tsx   # Attendance marking form
│   └── ui/                      # Radix UI components
├── convex/                       # Convex backend
│   ├── functions/
│   │   ├── queries.ts           # Database queries
│   │   └── mutations.ts         # Database mutations
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── schema.ts                # Database schema
│   ├── _generated/              # Auto-generated Convex files
│   └── convex.json              # Convex configuration
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions
├── public/                       # Static assets
├── package.json                 # Project dependencies
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── README.md                    # This file
```

## 🗄️ Database Schema

### Students Table
```typescript
{
  _id: Id<"students">           // Auto-generated unique ID
  roll_number: string           // Student roll number (indexed, unique)
  name: string                  // Student name
  email: string                 // Student email
  phone: string                 // Student phone number (10 digits)
  dob: string                   // Date of birth (YYYY-MM-DD)
}
```

### Sessions Table
```typescript
{
  _id: Id<"sessions">           // Auto-generated unique ID
  session_id: string            // Session identifier
  session_date: string          // Date (YYYY-MM-DD)
  start_time: string            // Start time
  end_time: string              // End time
  remarks: string               // Session remarks/notes
}
```

### Attendance Table
```typescript
{
  _id: Id<"attendance">         // Auto-generated unique ID
  attendance_id: string         // Attendance identifier
  class_session_id: string      // Reference to session ID
  student_id: string            // Reference to student ID (indexed)
  status: string                // "Present" or "Absent"
}
```

## 🔧 API Functions

### Queries
- `getStudents()` - Fetch all students with count
- `getSessions()` - Fetch all sessions with today's sessions
- `getAttendanceOverview()` - Fetch students, sessions, and attendance data

### Mutations
- `addStudents(data)` - Add a new student (validates duplicate roll numbers)
- `addSessions(data)` - Create a new session
- `addAttendance(data)` - Record attendance for a student in a session
- `removeStudent(id)` - Delete a student and cascade delete all associated attendance records

## ✨ Key Features & Implementation Details

### Cascading Deletion
When a student is deleted:
1. All attendance records associated with that student are queried first using the `by_student` index
2. Each attendance record is deleted by its `_id`
3. The student record is then deleted
4. This prevents orphaned attendance records and maintains data integrity

**Implementation Logic:**
```typescript
// Query attendance records first
const studentAttendance = await ctx.db
  .query("attendance")
  .withIndex("by_student", (q) => q.eq("student_id", args.id))
  .collect();

// Delete all attendance records
for (const attendanceRecord of studentAttendance) {
  await ctx.db.delete("attendance", attendanceRecord._id);
}

// Finally delete the student
const removeId = await ctx.db.delete("students", args.id);
```

### Real-time Updates
- Convex provides real-time database updates
- Changes are reflected immediately across all connected clients
- Form validations ensure data consistency

### Form Validation
- React Hook Form with Zod schema validation
- Client-side validation for immediate user feedback
- Server-side validation in Convex mutations

### Attendance Calculation
- Attendance percentage = (Total Present Sessions / Total Sessions) × 100
- Color-coded indicators for quick visual assessment
- Automatically sorted by roll number

## 🚀 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

### Code Style
- ESLint configuration enforced
- TypeScript strict mode enabled
- Tailwind CSS for consistent styling

## 📝 Workflow

### Adding a New Student
1. Navigate to Dashboard → Add Students tab
2. Fill in all required fields
3. Click Submit
4. Student appears in the "All Students" table
5. Delete option available if needed

### Creating a Session
1. Navigate to Dashboard → New Session tab
2. Enter session details (date, time, remarks)
3. Click Submit
4. Session is created and ready for attendance marking

### Marking Attendance
1. Navigate to Dashboard → Mark Attendance tab
2. Select a session date
3. Select students and mark their status
4. Click Submit
5. View records in Attendance Overview

### Viewing Attendance
1. Navigate to Attendance Overview from home page
2. View consolidated attendance matrix
3. See individual attendance percentages
4. Sort by roll number (default)

## 🐛 Troubleshooting

### Session Not Found
- Ensure at least one session exists before marking attendance
- Check session dates are in correct format (YYYY-MM-DD)

### Attendance Not Showing
- Verify attendance records exist for the selected date
- Check student and session IDs are correctly referenced

### Duplicate Student Error
- Roll numbers must be unique
- Verify the roll number doesn't already exist

### Convex Connection Issues
- Verify `NEXT_PUBLIC_CONVEX_URL` is correctly set in `.env.local`
- Ensure Convex project is active and running
- Check network connectivity

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev/)
- [React Hook Form Guide](https://react-hook-form.com/form-builder)
- [Zod Validation](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI Components](https://www.radix-ui.com/docs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Created as a mentor-mentee attendance management system.

---

**Last Updated**: February 2025
