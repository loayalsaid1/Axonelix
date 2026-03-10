import { auth } from "@clerk/nextjs/server";

/**
 * Returns a RequestInit object with the current user's Bearer token injected
 * as an Authorization header. Safe to call in any Next.js Server Component or
 * Route Handler. Returns an empty object when there is no active session.
 */
export async function serverAuthOpts(): Promise<RequestInit> {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return {};
  return { headers: { Authorization: `Bearer ${token}` } };
}
