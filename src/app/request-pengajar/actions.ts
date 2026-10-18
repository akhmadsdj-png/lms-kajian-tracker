"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type RequestState = { ok: boolean; message: string } | null;

export async function requestTutorAction(_prev: RequestState, formData: FormData): Promise<RequestState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Masuk dulu untuk mengirim request." };

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const channelUrl = (formData.get("channelUrl") as string | null)?.trim() || null;
  const note = (formData.get("note") as string | null)?.trim() || null;

  if (name.length < 3) return { ok: false, message: "Tulis nama ustadz, minimal 3 huruf." };
  if (name.length > 120 || (channelUrl?.length ?? 0) > 300 || (note?.length ?? 0) > 1000) {
    return { ok: false, message: "Isian terlalu panjang. Persingkat lalu kirim lagi." };
  }
  if (channelUrl && !/youtube\.com|youtu\.be|^@/i.test(channelUrl)) {
    return { ok: false, message: "Link channel harus dari YouTube, atau kosongkan saja." };
  }

  // Light spam guard: at most 5 open requests per user
  const open = await prisma.tutorRequest.count({ where: { userId, status: "pending" } });
  if (open >= 5) {
    return {
      ok: false,
      message: "Kamu masih punya 5 request yang belum diproses. Tunggu admin memprosesnya dulu.",
    };
  }

  await prisma.tutorRequest.create({ data: { userId, name, channelUrl, note } });
  revalidatePath("/request-pengajar");
  revalidatePath("/admin");
  return { ok: true, message: `Request untuk ${name} terkirim. Admin akan mengecek channel-nya.` };
}
