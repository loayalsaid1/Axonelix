// Base URL sourced from env — defaults to localhost for dev
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

/**
 * Typed fetch wrapper.
 * - Throws on non-2xx responses with the server's error message.
 * - Passes `cache` and `next` options straight through so callers control
 *   SSR caching behaviour (revalidate, no-store, etc.).
 */
export async function apiFetch<T>(
  path: string,
  { body, ...options }: FetchOptions = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...options,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data?.message ?? message;
    } catch {
      // ignore parse failure
    }
    throw new Error(message);
  }

  // 204 No-Content — return undefined cast
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
