import { auth } from "./auth";
import { prisma } from "./prisma";
import { isSuperAdmin } from "./admin-emails";

export { isSuperAdmin };

/**
 * The signed-in admin, checked against the database (not just the session), or null.
 * Use this in admin pages and server actions.
 */
export async function getAdmin() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return null;
  if (isSuperAdmin(user.email)) return { id: user.id, email: user.email ?? null, superAdmin: true };

  const row = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, blockedAt: true } });
  if (row?.role === "admin" && !row.blockedAt) return { id: user.id, email: user.email ?? null, superAdmin: false };
  return null;
}
