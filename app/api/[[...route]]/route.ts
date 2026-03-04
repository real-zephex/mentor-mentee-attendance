import { Hono } from "hono";
import { handle } from "hono/vercel";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { compare } from "bcryptjs";
import { signToken, verifyToken } from "@/lib/jwt";
import { getCookie, setCookie } from "hono/cookie";

const app = new Hono().basePath("/api");
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

app.post("/auth", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "All fields are required" }, 400);
  }

  const user = await convex.query(api.functions.queries.getUser, { email });

  if (!user.status || !user.data) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const isValid = await compare(password, user.data.password);
  if (!isValid) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const token = await signToken({
    userId: user.data._id,
    email: user.data.email,
  });

  setCookie(c, "auth_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return c.json({ message: "Logged in successfully" }, 200);
});

app.post("/logout", async (c) => {
  setCookie(c, "auth_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 0,
    path: "/",
  });

  return c.json({ message: "Logged out successfully" }, 200);
});

app.get("/auth-status", async (c) => {
  const token = getCookie(c, "auth_token");

  if (!token) {
    return c.json({ authenticated: false }, 200);
  }

  try {
    await verifyToken(token);
    return c.json({ authenticated: true }, 200);
  } catch {
    return c.json({ authenticated: false }, 200);
  }
});

export const GET = handle(app);
export const POST = handle(app);
