"use server";

import { revalidatePath } from "next/cache";
import { getAdmin, isSuperAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export type UserActionState = { ok: boolean; message: string } | null;

/** Loads the target and checks the acting admin may change it. */
async function authorize(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Hanya admin yang bisa mengelola pengguna." } as const;

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { ok: false, error: "Pengguna tidak valid." } as const;

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!target) return { ok: false, error: "Pengguna tidak ditemukan. Mungkin sudah dihapus." } as const;
  if (target.id === admin.id) return { ok: false, error: "Kamu tidak bisa mengubah akunmu sendiri di sini." } as const;
  if (isSuperAdmin(target.email)) return { ok: false, error: "Admin utama (ADMIN_EMAILS) tidak bisa diubah dari sini." } as const;
  if (target.role === "admin" && !admin.superAdmin) {
    return { ok: false, error: "Hanya admin utama yang bisa mengubah sesama admin." } as const;
  }
  return { ok: true, admin, target } as const;
}

function done(message: string): UserActionState {
  revalidatePath("/admin/pengguna");
  return { ok: true, message };
}

export async function setUserRoleAction(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  const auth = await authorize(formData);
  if (!auth.ok) return { ok: false, message: auth.error };
  const makeAdmin = formData.get("role") === "admin";
  await prisma.user.update({ where: { id: auth.target.id }, data: { role: makeAdmin ? "admin" : "user" } });
  const who = auth.target.name ?? auth.target.email ?? "Pengguna";
  return done(makeAdmin ? `${who} sekarang admin.` : `${who} bukan admin lagi.`);
}

export async function setUserBlockedAction(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  const auth = await authorize(formData);
  if (!auth.ok) return { ok: false, message: auth.error };
  const block = formData.get("blocked") === "1";
  await prisma.user.update({ where: { id: auth.target.id }, data: { blockedAt: block ? new Date() : null } });
  const who = auth.target.name ?? auth.target.email ?? "Pengguna";
  return done(
    block ? `${who} diblokir. Sesinya berakhir dalam 5 menit, dan progres tidak lagi tersimpan.` : `Blokir ${who} dibuka.`,
  );
}

export async function deleteUserAction(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  const auth = await authorize(formData);
  if (!auth.ok) return { ok: false, message: auth.error };
  if (formData.get("confirm") !== auth.target.id) return { ok: false, message: "Konfirmasi penghapusan tidak cocok." };
  // Accounts, sessions, progress, daily activity and requests cascade with the user
  await prisma.user.delete({ where: { id: auth.target.id } });
  return done(`Akun ${auth.target.name ?? auth.target.email ?? ""} dan seluruh datanya dihapus.`);
}
