import Link from "next/link";

interface ShelfProps {
  title: React.ReactNode;
  href?: string;
  children: React.ReactNode;
}

// Horizontally scrolling row that bleeds to the page edge on small screens.
export function Shelf({ title, href, children }: ShelfProps) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 className="font-sans text-xl font-bold">{title}</h2>
        {href && (
          <Link href={href} className="shrink-0 text-sm font-semibold text-pencil hover:text-ink">
            Lihat semua
          </Link>
        )}
      </div>
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6">
        {children}
      </ul>
    </section>
  );
}
