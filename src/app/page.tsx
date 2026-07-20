import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/LoginButton";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-[calc(100vh-57px)] flex-col items-center justify-center overflow-hidden px-4">
      {/* Background effects */}
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.07] blur-[100px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-teal-500/[0.05] blur-[80px]" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-lg text-center">
        {/* Logo */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-4xl font-bold text-white shadow-2xl shadow-emerald-500/25">
          ك
        </div>

        {/* Title */}
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Kajian{" "}
          <span className="text-gradient">Tracker</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-8 max-w-md text-base text-slate-400 sm:text-lg">
          Lacak progres belajar kajian Islam dari playlist YouTube.
          Simpan posisi terakhir, tandai materi yang sudah selesai.
        </p>

        {/* Login button */}
        <LoginButton />

        {/* Guest access */}
        <Link
          href="/dashboard"
          className="mt-3 block text-sm text-slate-500 transition-colors hover:text-slate-300 underline underline-offset-4"
        >
          Jelajahi tanpa login →
        </Link>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-6">
          {[
            { icon: "📖", label: "Tracking Progres" },
            { icon: "🔖", label: "Tandai Selesai" },
            { icon: "▶️", label: "Resume Otomatis" },
          ].map((feature) => (
            <div key={feature.label} className="text-center">
              <div className="mb-2 text-2xl">{feature.icon}</div>
              <p className="text-xs text-slate-500">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
