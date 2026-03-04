import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// Call this after a successful login to create a token
export async function signToken(payload: { userId: string; email: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" }) // signing algorithm
    .setIssuedAt() // when it was issued
    .setExpirationTime("7d") // token expires in 7 days
    .sign(secret);
}

// Call this on protected routes to verify the incoming token
export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload; // returns the decoded payload if valid, throws if not
}
