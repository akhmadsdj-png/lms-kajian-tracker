import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAdmin, isSuperAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/format";
import { Avatar } from "@/components/media/Avatar";
import { AdminNav } from "../AdminNav";
import { UserActions } from "./UserActions";

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  blockedAt: Date | null;
  createdAt: Date;
  completed: number;
  seconds: number;
  lastActive: Date | null;
  requests: number;
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await connection();
  const admin = await getAdmin();
  if (!admin) redirect("/dashboard");

  const q = (await searchParams).q?.trim() ?? "";
  const like = `%${q}%`;

  // One query: every user with their totals (watch time = full length of finished
  // pertemuan + position reached in unfinished ones)
  const users = await prisma.$queryRaw<UserRow[]>`
    SELECT u."id", u."name", u."email", u."image", u."role", u."blockedAt", u."createdAt",
      COALESCE(p.completed, 0)::int AS completed,
      COALESCE(p.seconds, 0)::int AS seconds,
      p.last_active AS "lastActive",
      COALESCE(r.requests, 0)::int AS requests
    FROM "User" u
    LEFT JOIN (
      SELECT up."userId",
        COUNT(*) FILTER (WHERE up."isCompleted") AS completed,
        SUM(CASE WHEN up."isCompleted" THEN COALESCE(v."durationSeconds", up."lastWatchedSeconds")
                 ELSE up."lastWatchedSeconds" END) AS seconds,
        MAX(up."updatedAt") AS last_active
      FROM "UserProgress" up JOIN "Video" v ON v."id" = up."videoId"
      GROUP BY up."userId"
    ) p ON p."userId" = u."id"
    LEFT JOIN (SELECT "userId", COUNT(*) AS requests FROM "TutorRequest" GROUP BY "userId") r ON r."userId" = u."id"
    WHERE ${q} = '' OR u."name" ILIKE ${like} OR u."email" ILIKE ${like}
    ORDER BY p.last_active DESC NULLS LAST, u."createdAt" DESC
  `;

  const total = await prisma.user.count();
  const blockedCount = users.filter((u) => u.blockedAt).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-6 text-3xl">Kelola pengguna</h1>
      <AdminNav active="/admin/pengguna" />

      <form action="/admin/pengguna" className="mb-6 flex max-w-md gap-2" role="search">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama atau email"
          className="h-10 min-w-0 flex-1 rounded-full border border-rule bg-paper px-4 placeholder:text-pencil focus:border-pen focus:outline-none"
        />
        <button className="h-10 rounded-full bg-raised px-4 font-semibold hover:bg-rule">Cari</button>
      </form>

      <p className="mb-3 text-sm text-pencil tabular-nums">
        {q ? `${users.length} dari ${total} pengguna cocok dengan "${q}"` : `${total} pengguna`}
        {blockedCount > 0 && `, ${blockedCount} diblokir`}
      </p>

      {users.length === 0 ? (
        <p className="rounded-2xl bg-surface p-6 text-pencil">Tidak ada pengguna yang cocok. Coba kata lain.</p>
      ) : (
        <ul className="divide-y divide-rule rounded-2xl bg-surface">
          {users.map((u) => {
            const superAdmin = isSuperAdmin(u.email);
            const isSelf = u.id === admin.id;
            const lockedReason = isSelf
              ? "Ini akunmu."
              : superAdmin
                ? "Admin utama, diatur lewat ADMIN_EMAILS."
                : u.role === "admin" && !admin.superAdmin
                  ? "Admin lain hanya bisa diubah admin utama."
                  : undefined;
            const hours = u.seconds / 3600;
            const name = u.name ?? u.email ?? "Tanpa nama";

            return (
              <li key={u.id} className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5 ${u.blockedAt ? "opacity-70" : ""}`}>
                <Link href={`/admin/pengguna/${u.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
                  <Avatar src={u.image} name={name} size={44} />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold group-hover:text-pen">
                      <span className="truncate">{name}</span>
                      {(superAdmin || u.role === "admin") && (
                        <span className="rounded-full bg-pen-soft px-2 py-0.5 text-xs text-pen">
                          {superAdmin ? "Admin utama" : "Admin"}
                        </span>
                      )}
                      {u.blockedAt && (
                        <span className="rounded-full bg-red-950/60 px-2 py-0.5 text-xs text-red-200">Diblokir</span>
                      )}
                    </p>
                    <p className="truncate text-sm text-pencil">{u.email}</p>
                    <p className="mt-1 text-xs tabular-nums text-pencil">
                      Bergabung {timeAgo(u.createdAt)}
                      {u.lastActive ? `, aktif ${timeAgo(u.lastActive)}` : ", belum pernah menonton"}
                      {`, ${u.completed} selesai, ${hours >= 10 ? Math.round(hours) : hours.toLocaleString("id-ID", { maximumFractionDigits: 1 })} jam`}
                      {u.requests > 0 && `, ${u.requests} request`}
                    </p>
                  </div>
                </Link>
                <UserActions
                  id={u.id}
                  name={name}
                  isAdmin={u.role === "admin"}
                  blocked={Boolean(u.blockedAt)}
                  lockedReason={lockedReason}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
