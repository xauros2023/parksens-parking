import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isValidSessionToken } from "./adminAuth";

// Returns true if the incoming request carries a valid admin session cookie.
// Call this at the top of every admin-only route handler before touching the database.
// Next.js 15+ made cookies() async, so this must be awaited by every caller.
export async function isAdminRequest() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  return isValidSessionToken(token);
}
