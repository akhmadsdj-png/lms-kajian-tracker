// Super admins come from ADMIN_EMAILS. They are always admin and can't be blocked,
// demoted or deleted from the admin page, so the owner can never be locked out.
export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean) || [];
  return adminEmails.includes(email.toLowerCase());
}
