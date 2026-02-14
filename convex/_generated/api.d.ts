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
import type * as functions_helper from "../functions/helper.js";
import type * as functions_sessions_actions from "../functions/sessions_actions.js";
import type * as functions_sessions_queries from "../functions/sessions_queries.js";
import type * as functions_students_actions from "../functions/students_actions.js";
import type * as functions_students_queries from "../functions/students_queries.js";
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
  "functions/helper": typeof functions_helper;
  "functions/sessions_actions": typeof functions_sessions_actions;
  "functions/sessions_queries": typeof functions_sessions_queries;
  "functions/students_actions": typeof functions_students_actions;
  "functions/students_queries": typeof functions_students_queries;
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
