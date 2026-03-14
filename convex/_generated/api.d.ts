/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions_attendance_actions from "../functions/attendance_actions.js";
import type * as functions_attendance_queries from "../functions/attendance_queries.js";
import type * as functions_classes_actions from "../functions/classes_actions.js";
import type * as functions_classes_queries from "../functions/classes_queries.js";
import type * as functions_exams_actions from "../functions/exams_actions.js";
import type * as functions_exams_queries from "../functions/exams_queries.js";
import type * as functions_helper from "../functions/helper.js";
import type * as functions_marks_actions from "../functions/marks_actions.js";
import type * as functions_marks_queries from "../functions/marks_queries.js";
import type * as functions_semesters_actions from "../functions/semesters_actions.js";
import type * as functions_semesters_queries from "../functions/semesters_queries.js";
import type * as functions_sessions_actions from "../functions/sessions_actions.js";
import type * as functions_sessions_queries from "../functions/sessions_queries.js";
import type * as functions_students_actions from "../functions/students_actions.js";
import type * as functions_students_queries from "../functions/students_queries.js";
import type * as functions_subjects_actions from "../functions/subjects_actions.js";
import type * as functions_subjects_queries from "../functions/subjects_queries.js";
import type * as functions_users_actions from "../functions/users_actions.js";
import type * as functions_users_queries from "../functions/users_queries.js";
import type * as http from "../http.js";
import type * as types_index from "../types/index.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "functions/attendance_actions": typeof functions_attendance_actions;
  "functions/attendance_queries": typeof functions_attendance_queries;
  "functions/classes_actions": typeof functions_classes_actions;
  "functions/classes_queries": typeof functions_classes_queries;
  "functions/exams_actions": typeof functions_exams_actions;
  "functions/exams_queries": typeof functions_exams_queries;
  "functions/helper": typeof functions_helper;
  "functions/marks_actions": typeof functions_marks_actions;
  "functions/marks_queries": typeof functions_marks_queries;
  "functions/semesters_actions": typeof functions_semesters_actions;
  "functions/semesters_queries": typeof functions_semesters_queries;
  "functions/sessions_actions": typeof functions_sessions_actions;
  "functions/sessions_queries": typeof functions_sessions_queries;
  "functions/students_actions": typeof functions_students_actions;
  "functions/students_queries": typeof functions_students_queries;
  "functions/subjects_actions": typeof functions_subjects_actions;
  "functions/subjects_queries": typeof functions_subjects_queries;
  "functions/users_actions": typeof functions_users_actions;
  "functions/users_queries": typeof functions_users_queries;
  http: typeof http;
  "types/index": typeof types_index;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
