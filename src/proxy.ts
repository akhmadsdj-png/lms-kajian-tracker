export { auth as proxy } from "@/lib/auth";

export const config = {
  // No forced redirects — all routes are publicly accessible
  matcher: [],
};
