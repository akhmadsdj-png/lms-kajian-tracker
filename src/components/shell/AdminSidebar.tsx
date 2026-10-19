import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NavLink } from "./NavLink";
import { ArrowLeftIcon, InboxIcon, TeacherIcon, UsersIcon } from "./icons";

const row = {
  className: "flex items-center gap-4 rounded-lg px-3 py-2",
  activeClassName: "bg-raised font-semibold",
  inactiveClassName: "hover:bg-surface",
};

const railItem = {
  className: "flex flex-col items-center gap-1 rounded-lg px-1 py-3 text-[11px]",
  activeClassName: "bg-raised font-semibold",
  inactiveClassName: "hover:bg-surface",
};

/** Sidebar shown on /admin pages instead of the reader's sidebar. */
export function AdminSidebar() {
  return (
    <nav className="px-3 pt-1 pb-8" aria-label="Menu admin">
      <p className="px-3 pt-1 pb-3 text-sm font-semibold text-pencil">Panel admin</p>
      <NavLink href="/admin/request" prefix {...row} icon={<InboxIcon />}>
        <span className="flex-1">Request dan saran</span>
        <Suspense fallback={null}>
          <PendingBadge />
        </Suspense>
      </NavLink>
      <NavLink href="/admin" {...row} icon={<TeacherIcon />}>
        Pengajar
      </NavLink>
      <NavLink href="/admin/pengguna" prefix {...row} icon={<UsersIcon />}>
        Pengguna
      </NavLink>

      <hr className="mx-3 my-3 border-rule" />

      <NavLink href="/dashboard" {...row} icon={<ArrowLeftIcon />}>
        Kembali ke aplikasi
      </NavLink>
    </nav>
  );
}

/** Collapsed (icon rail) version of the admin sidebar. */
export function AdminRail() {
  return (
    <nav className="space-y-1 px-1 pt-1 pb-8" aria-label="Menu admin">
      <NavLink href="/admin/request" prefix {...railItem} icon={<InboxIcon />}>
        Request
      </NavLink>
      <NavLink href="/admin" {...railItem} icon={<TeacherIcon />}>
        Pengajar
      </NavLink>
      <NavLink href="/admin/pengguna" prefix {...railItem} icon={<UsersIcon />}>
        Pengguna
      </NavLink>
      <hr className="mx-2 my-2 border-rule" />
      <NavLink href="/dashboard" {...railItem} icon={<ArrowLeftIcon />}>
        Aplikasi
      </NavLink>
    </nav>
  );
}

// Unprocessed requests. Checked against the session (cookie only), so readers who
// aren't admins never trigger the query or receive the number.
async function PendingBadge() {
  const session = await auth();
  if (!session?.user?.isAdmin) return null;
  const pending = await prisma.tutorRequest.count({ where: { status: "pending" } });
  if (pending === 0) return null;
  return (
    <span className="rounded-full bg-pen px-2 py-0.5 text-xs font-bold tabular-nums text-paper" aria-label={`${pending} baru`}>
      {pending}
    </span>
  );
}
