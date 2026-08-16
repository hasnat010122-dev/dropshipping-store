import { cookies } from "next/headers";

export const ADMIN_COOKIE = "buyzo_admin";

export async function isAdmin() {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === "true";
}
