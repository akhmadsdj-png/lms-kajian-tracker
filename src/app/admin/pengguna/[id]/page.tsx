import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { getAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ProgressView } from "@/components/progress/ProgressView";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  if (!(await getAdmin())) redirect("/dashboard");

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } });
  if (!user) notFound();

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Link href="/admin/pengguna" className="text-sm text-pencil hover:text-ink hover:underline">
          Kembali ke daftar pengguna
        </Link>
      </div>
      <ProgressView userId={user.id} title={`Progres ${user.name ?? user.email ?? "pengguna"}`} readOnly />
    </>
  );
}
