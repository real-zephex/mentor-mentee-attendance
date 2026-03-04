import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  // If no token and trying to access a protected page, redirect to login
  if (!token && req.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (req.nextUrl.pathname === "/login" && token) {
    try {
      await verifyToken(token);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch {
      // Token is bad, continue to login page
      return NextResponse.next();
    }
  }

  if (!token) {
    return NextResponse.next();
  }

  try {
    await verifyToken(token); // throws if invalid or expired
    return NextResponse.next(); // token is valid, let them through
  } catch {
    // Token is bad — clear it and send to login
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};

export default middleware;
