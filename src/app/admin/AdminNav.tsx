import Link from "next/link";

const TABS = [
  { href: "/admin", label: "Pengajar dan request" },
  { href: "/admin/pengguna", label: "Pengguna" },
];

export function AdminNav({ active }: { active: string }) {
  return (
    <nav aria-label="Menu admin" className="mb-8 flex gap-2">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={active === t.href ? "page" : undefined}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
            active === t.href ? "bg-ink text-paper" : "bg-raised hover:bg-rule"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
