"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type RequestType = "tutor" | "feature";
export type RequestState = { ok: boolean; message: string; type: RequestType } | null;

export async function requestTutorAction(_prev: RequestState, formData: FormData): Promise<RequestState> {
  const type: RequestType = formData.get("type") === "feature" ? "feature" : "tutor";
  const fail = (message: string): RequestState => ({ ok: false, message, type });

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return fail("Masuk dulu untuk mengirim request.");

  const account = await prisma.user.findUnique({ where: { id: userId }, select: { blockedAt: true } });
  if (account?.blockedAt) return fail("Akunmu diblokir, jadi request tidak bisa dikirim.");

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const channelUrl = type === "tutor" ? (formData.get("channelUrl") as string | null)?.trim() || null : null;
  const note = (formData.get("note") as string | null)?.trim() || null;

  if (name.length < 3) {
    return fail(type === "tutor" ? "Tulis nama ustadz, minimal 3 huruf." : "Tulis saranmu, minimal 3 huruf.");
  }
  if (name.length > 120 || (channelUrl?.length ?? 0) > 300 || (note?.length ?? 0) > 1000) {
    return fail("Isian terlalu panjang. Persingkat lalu kirim lagi.");
  }
  if (channelUrl && !/youtube\.com|youtu\.be|^@/i.test(channelUrl)) {
    return fail("Link channel harus dari YouTube, atau kosongkan saja.");
  }

  // Light spam guard: at most 5 open requests of each type per user
  const open = await prisma.tutorRequest.count({ where: { userId, type, status: "pending" } });
  if (open >= 5) {
    return fail("Kamu masih punya 5 request yang belum diproses. Tunggu admin memprosesnya dulu.");
  }

  await prisma.tutorRequest.create({ data: { userId, type, name, channelUrl, note } });
  revalidatePath("/request-pengajar");
  revalidatePath("/admin");
  return {
    ok: true,
    type,
    message:
      type === "tutor"
        ? `Request untuk ${name} terkirim. Admin akan mengecek channel-nya.`
        : "Saranmu terkirim. Jazakallahu khairan, admin akan membacanya.",
  };
}
