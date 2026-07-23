"use server";

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { revalidateTag, revalidatePath } from "next/cache";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function addTutorAction(formData: FormData) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const youtubeChannelId = formData.get("youtubeChannelId") as string;

  if (!name || !youtubeChannelId) {
    throw new Error("Name and Channel ID are required");
  }

  const slug = slugify(name);

  try {
    await prisma.tutor.create({
      data: {
        name,
        slug,
        youtubeChannelId,
      },
    });
  } catch (error: any) {
    throw new Error(error.message);
  }

  revalidateTag("tutors", { expire: 0 });
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}
