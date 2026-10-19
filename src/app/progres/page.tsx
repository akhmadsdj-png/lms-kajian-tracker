import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { SignInButton } from "@/components/shell/SignInButton";
import { ProgressView } from "@/components/progress/ProgressView";

export default async function ProgressPage() {
  await connection();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-sans text-3xl font-bold">Progres belajar</h1>
        <p className="mt-3 text-pencil">
          Masuk untuk melihat pertemuan yang sudah selesai, jam belajar, streak harian, dan kartu mutaba&apos;ah
          setiap playlist yang kamu ikuti.
        </p>
        <SignInButton className="mt-6 rounded-full bg-ink px-6 py-2.5 font-bold text-paper hover:opacity-90">
          Masuk dengan Google
        </SignInButton>
      </div>
    );
  }

  return <ProgressView userId={userId} />;
}
