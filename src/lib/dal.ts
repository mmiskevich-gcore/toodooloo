import "server-only";
import { redirect } from "next/navigation";
import { db } from "./db";
import { getSessionUserId } from "./session";

export type CurrentUser = { id: string; email: string };

// Single place that turns the session cookie into a user. Every page and
// action that touches user data goes through here.
export async function getCurrentUser(): Promise<CurrentUser> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  if (!user) redirect("/login");
  return user;
}
