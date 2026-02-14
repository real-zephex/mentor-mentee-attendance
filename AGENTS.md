# AGENTS.md - Agent Instructions

This file provides guidelines for AI agents working on this Next.js + Convex attendance tracking application.

## Package Manager

**ALWAYS use `bun` instead of `npm` for all package management and script execution.**

```bash
# Installation
bun install <package>

# Running scripts
bun run dev
bun run build
bun run lint
```

## Build, Lint & Dev Commands

```bash
# Development server
bun run dev

# Production build
bun run build

# Type checking (via Next.js build)
bun run build

# Linting with ESLint
bun run lint
bun run lint -- --fix    # Auto-fix issues

# No tests configured - project has no test suite
```

## Code Style Guidelines

### General

- **TypeScript**: Strict mode enabled. No `any` types. Always define explicit types.
- **Formatting**: Use the existing style. No trailing semicolons (except where required).
- **Line length**: Keep lines under 100 characters when possible.
- **Comments**: Minimal inline comments. Use descriptive variable names instead.

### Imports

```typescript
// 1. React/Next imports first
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. External libraries
import { useQuery, useMutation } from "convex/react";
import { ConvexError, v } from "convex/values";

// 3. Internal absolute imports (using @/* alias)
import { api } from "@/convex/_generated/api";
import { requireAuth } from "@/convex/functions/helper";
import { ReturnProps } from "@/convex/types";

// 4. Relative imports (only when necessary)
import { MyComponent } from "./MyComponent";
```

**Important**: Always use `@/*` for imports from the project root. Configure in `tsconfig.json`.

### Naming Conventions

- **Files**: 
  - PascalCase for React components: `StudentTable.tsx`
  - camelCase for utilities/hooks: `useAuthCheck.ts`
  - Suffix pattern for Convex: `*_queries.ts`, `*_actions.ts`
  
- **Variables/Functions**:
  - camelCase for variables/functions: `getAllStudents`, `attendanceMap`
  - PascalCase for types/interfaces: `AttendanceMatrix`, `ReturnType`
  - UPPER_CASE for constants: `MAX_STUDENTS`

- **Convex Queries/Actions**: 
  - PascalCase: `GetAttendanceMatrix`, `newStudents`, `deleteStudent`
  - Descriptive names that indicate what they do

### Type Definitions

All types are centralized in `convex/types/index.ts`:

```typescript
// Use v.object for Convex table definitions
export const Students = v.object({
  roll_no: v.string(),
  name: v.string(),
  class: v.id("classes"),
});

// Use Infer for TypeScript types
export type StudentType = Infer<typeof Students>;

// Return type wrapper (MANDATORY for queries/actions)
type Success<T> = {
  status: "success";
  data: T;
};

type Failure = {
  status: "error";
  error: string;
};

export type ReturnProps<T> = Success<T> | Failure;
```

## Project-Specific Patterns

### 1. ReturnProps Pattern (Mandatory)

All Convex queries and actions MUST return `ReturnProps<T>`:

```typescript
export const GetAttendanceMatrix = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args): Promise<ReturnProps<AttendanceMatrix>> => {
    try {
      // ... logic
      return {
        status: "success",
        data: { students, sessions, attendance_matrix: attendanceMap },
      };
    } catch (error) {
      console.error("Error message", error);
      return {
        status: "error",
        error: error instanceof ConvexError 
          ? error.message 
          : (error as Error).message,
      };
    }
  },
});
```

### 2. Authentication Pattern

Always use the helper functions from `convex/functions/helper.ts`:

```typescript
import { requireAuth, requireAdminAuth } from "./helper";

export const myQuery = query({
  handler: async (ctx) => {
    await requireAuth(ctx);  // For regular authenticated users
    // or
    await requireAdminAuth(ctx);  // For admin-only operations
    // ... rest of logic
  },
});
```

### 3. Convex File Organization

```
convex/
├── schema.ts              # Database schema with indexes
├── types/
│   └── index.ts          # All TypeScript type definitions
└── functions/
    ├── helper.ts         # Auth and utility functions
    ├── *_queries.ts      # Read operations (use 'query')
    ├── *_actions.ts      # Write operations (use 'mutation')
    └── users_*.ts        # User-specific operations
```

### 4. Database Schema with Indexes

Always add appropriate indexes for performance:

```typescript
export default defineSchema({
  users: defineTable(UserObject)
    .index("by_clerk_user_id", ["clerk_user_id"])
    .index("email", ["email"]),
  classes: defineTable(ClassesTable)
    .index("by_year", ["class_year"]),
  students: defineTable(Students)
    .index("by_roll", ["roll_no"])
    .index("by_class", ["class"]),
  sessions: defineTable(Sessions)
    .index("by_date", ["session_date"])
    .index("by_class", ["class"]),
  attendance: defineTable(Attendance)
    .index("by_student", ["student"])
    .index("by_session", ["session", "student"]),  // Composite index
});
```

### 5. Frontend Query Usage

```typescript
"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export function MyComponent() {
  const students = useQuery(api.functions.students_queries.getAllStudents);
  
  // Always check status before accessing data
  const studentsCount = students?.status === "success" 
    ? students.data.length 
    : 0;
    
  // Handle loading state
  if (students === undefined) return <Loading />;
  
  // Handle error state
  if (students.status === "error") return <Error message={students.error} />;
  
  // Use data
  return <StudentList students={students.data} />;
}
```

### 6. Error Handling Convention

```typescript
try {
  // Operation that might fail
  const result = await someOperation();
  
  if (!result) {
    throw new ConvexError("Descriptive error message");
  }
  
  return { status: "success", data: result };
} catch (error) {
  console.error("Contextual error message:", error);
  
  // Re-throw ConvexError as-is
  if (error instanceof ConvexError) throw error;
  
  // Wrap other errors
  throw new ConvexError((error as Error).message);
}
```

## React Component Patterns

### File Structure

```typescript
"use client";  // Required for components using hooks

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
// ... other imports

export function ComponentName() {
  // State declarations
  const [data, setData] = useState();
  
  // Hooks
  const query = useQuery(...);
  
  // Derived state
  const computed = useMemo(...);
  
  // Handlers
  const handleClick = () => { ... };
  
  return (
    // JSX
  );
}
```

### Component Naming

- Use function declarations for components: `export function MyComponent()`
- Not arrow functions for exported components
- Descriptive names that indicate purpose

## Performance Guidelines

1. **Bulk Queries**: Never use nested loops with database queries. Fetch all data in bulk:
   ```typescript
   // ❌ BAD: N+1 queries
   for (const session of sessions) {
     for (const student of students) {
       await getAttendance(session.id, student.id);
     }
   }
   
   // ✅ GOOD: Single bulk fetch
   const attendance = await ctx.db.query("attendance").collect();
   ```

2. **Indexes**: Always add database indexes for filtered queries

3. **Memoization**: Use `useMemo` for expensive computations in React

4. **Parallel Fetching**: Use `Promise.all` for independent queries:
   ```typescript
   const [students, sessions] = await Promise.all([
     ctx.db.query("students").collect(),
     ctx.db.query("sessions").collect(),
   ]);
   ```

## UI Components

- Use **shadcn/ui** components from `@/components/ui/`
- Custom components go in `@/components/custom/`
- Icons from `lucide-react`
- Styling with **Tailwind CSS** v4

## Before Submitting Changes

1. Run `bun run build` to ensure no TypeScript errors
2. Run `bun run lint` to check code style
3. Verify the app compiles without warnings
4. Test the specific feature you modified

## Common Pitfalls

- ❌ Don't use `console.log` in production code (use `console.error` for errors)
- ❌ Don't forget `await requireAuth(ctx)` in Convex functions
- ❌ Don't return raw data without wrapping in `ReturnProps`
- ❌ Don't forget to add indexes when creating new tables
- ✅ Always handle loading and error states in React components
- ✅ Always use proper TypeScript types, never `any`
