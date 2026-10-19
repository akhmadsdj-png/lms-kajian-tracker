import Link from "next/link";

export const metadata = {
  title: "Kebijakan privasi",
  description: "Data apa yang disimpan Kajian Tracker, untuk apa, dan cara menghapusnya.",
};

const UPDATED = "20 Oktober 2026";

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 pt-6 pb-20 sm:px-6 sm:pt-10">
      <h1 className="font-sans text-3xl font-bold sm:text-4xl">Kebijakan privasi</h1>
      <p className="mt-2 text-sm text-pencil">Terakhir diperbarui {UPDATED}</p>

      <p className="mt-6 text-lg">
        Kajian Tracker membantu kamu mengikuti kajian YouTube sampai tuntas. Kami hanya menyimpan data yang dibutuhkan
        untuk itu, tidak menjualnya, dan tidak memasang iklan.
      </p>

      <Section title="Tanpa masuk">
        <p>
          Kamu bisa menonton semua kajian tanpa akun. Progres tidak disimpan di server kami. Browser-mu hanya
          mengingat dua pengaturan kecil: apakah sidebar diciutkan, dan kapan kamu menutup ajakan memasang aplikasi.
        </p>
      </Section>

      <Section title="Kalau kamu masuk dengan Google">
        <p>Kami menyimpan:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Nama, alamat email, dan foto profil dari akun Google-mu, untuk menampilkan akunmu.</li>
          <li>Data login dari Google yang diperlukan agar kamu tetap masuk. Kami tidak bisa membaca email, Drive, atau data Google-mu yang lain.</li>
          <li>Progres tiap video: menit terakhir yang ditonton dan apakah sudah selesai.</li>
          <li>Jumlah aktivitas per hari, untuk ringkasan di halaman Progres.</li>
          <li>Playlist pribadi dan daftar Tonton nanti yang kamu buat.</li>
          <li>Request pengajar dan saran yang kamu kirim.</li>
        </ul>
        <p className="mt-3">
          Data ini hanya dipakai untuk menjalankan fitur di atas. Admin bisa melihat nama, email, dan ringkasan
          progresmu untuk mengelola pengguna, misalnya memblokir akun yang menyalahgunakan layanan.
        </p>
      </Section>

      <Section title="Layanan pihak lain">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>YouTube</strong> memutar videonya. Saat video diputar, YouTube dapat menyimpan cookie sesuai
            kebijakan privasi Google.
          </li>
          <li>
            <strong>Vercel</strong> menjalankan situs ini dan menghitung jumlah kunjungan per halaman tanpa cookie dan
            tanpa mengenali siapa kamu.
          </li>
          <li>
            <strong>Supabase</strong> menyimpan database kami di server Australia.
          </li>
        </ul>
      </Section>

      <Section title="Menghapus akun">
        <p>
          Kirim permintaan hapus akun lewat WhatsApp{" "}
          <a href="https://wa.me/6285156115262" className="font-semibold text-pen hover:underline">
            0851-5611-5262
          </a>{" "}
          dari email yang terdaftar. Akun beserta seluruh progres, aktivitas, playlist pribadi, dan request-mu akan
          dihapus permanen. Kamu juga bisa mencabut akses Kajian Tracker kapan saja dari pengaturan akun Google.
        </p>
      </Section>

      <Section title="Perubahan">
        <p>
          Kalau kebijakan ini berubah, tanggal di atas ikut diperbarui. Pertanyaan bisa dikirim lewat{" "}
          <Link href="/request-pengajar?jenis=saran" className="font-semibold text-pen hover:underline">
            halaman saran
          </Link>
          .
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-sans text-xl font-bold">{title}</h2>
      <div className="mt-3 leading-relaxed text-ink/90">{children}</div>
    </section>
  );
}
