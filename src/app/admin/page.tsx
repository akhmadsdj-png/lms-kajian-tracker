import { getAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AddTutorForm } from "./AddTutorForm";
import { connection } from "next/server";

export default async function AdminPage() {
  await connection();
  if (!(await getAdmin())) {
    redirect("/dashboard");
  }

  const tutors = await prisma.tutor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { playlists: true },
      },
    },
  });


  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-10 text-3xl">Kelola pengajar</h1>


      <div className="grid gap-12 md:grid-cols-[18rem_1fr]">
        <section>
          <h2 className="mb-4 text-xl">Tambah pengajar</h2>
          <AddTutorForm />
        </section>

        <section>
          <h2 className="mb-2 text-xl">{tutors.length} pengajar</h2>
          {tutors.length === 0 ? (
            <p className="border-t border-rule py-4 text-pencil">
              Belum ada pengajar. Tambahkan lewat formulir di samping.
            </p>
          ) : (
            <ul className="border-t border-rule">
              {tutors.map((tutor) => (
                <li key={tutor.id} className="border-b border-rule px-2 py-3">
                  <p className="font-semibold">{tutor.name}</p>
                  <p className="text-sm text-pencil">
                    {tutor._count.playlists} playlist tersinkron, channel {tutor.youtubeChannelId || "belum diisi"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
