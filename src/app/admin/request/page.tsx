import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { setRequestStatusAction } from "../actions";

export default async function AdminRequestsPage() {
  await connection();
  if (!(await getAdmin())) {
    redirect("/dashboard");
  }

  const requests = await prisma.tutorRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-2 text-3xl">Request dan saran</h1>
      <p className="mb-8 text-pencil">
        {pendingCount > 0 ? `${pendingCount} belum diproses.` : "Semua sudah diproses."} Tandai setelah ditindaklanjuti.
      </p>
      <section>
        {requests.length === 0 ? (
          <p className="border-t border-rule py-4 text-pencil">Belum ada request atau saran dari pengguna.</p>
        ) : (
          <ul className="border-t border-rule">
            {requests.map((r) => (
              <li key={r.id} className={`flex flex-col gap-3 border-b border-rule px-2 py-4 sm:flex-row sm:items-start sm:justify-between ${r.status === "pending" ? "" : "opacity-60"}`}>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-pen">{r.type === "feature" ? "Saran atau fitur" : "Pengajar"}</p>
                  <p className="font-semibold">{r.name}</p>
                  {r.channelUrl && (
                    <a href={r.channelUrl.startsWith("@") ? `https://www.youtube.com/${r.channelUrl}` : r.channelUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-sm text-pen hover:underline">
                      {r.channelUrl}
                    </a>
                  )}
                  {r.note && <p className="mt-1 text-sm text-pencil">{r.note}</p>}
                  <p className="mt-1 text-xs text-pencil">
                    {r.user.name ?? r.user.email},{" "}
                    {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {r.status === "pending" ? (
                    <>
                      <form action={setRequestStatusAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="status" value="added" />
                        <button className="rounded-full bg-pen px-3 py-1.5 text-sm font-semibold text-paper hover:opacity-90">
                          {r.type === "feature" ? "Tandai selesai" : "Tandai ditambahkan"}
                        </button>
                      </form>
                      <form action={setRequestStatusAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="status" value="rejected" />
                        <button className="rounded-full bg-raised px-3 py-1.5 text-sm font-semibold hover:bg-rule">Tolak</button>
                      </form>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-pencil">{r.status === "added" ? (r.type === "feature" ? "Selesai" : "Ditambahkan") : "Ditolak"}</span>
                      <form action={setRequestStatusAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="status" value="pending" />
                        <button className="text-sm text-pencil underline-offset-4 hover:text-ink hover:underline">Batalkan</button>
                      </form>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
