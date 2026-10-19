import { getDashboardTutors } from "@/lib/queries";
import { Avatar } from "@/components/media/Avatar";
import { NavLink } from "./NavLink";
import { ChartIcon, CompassIcon, HomeIcon, PlusIcon } from "./icons";

const item = {
  className: "flex flex-col items-center gap-1 rounded-lg px-1 py-3 text-[11px]",
  activeClassName: "bg-raised font-semibold",
  inactiveClassName: "hover:bg-surface",
};

// Collapsed sidebar: icons with tiny labels, like YouTube's mini guide.
export async function Rail() {
  const tutors = await getDashboardTutors();

  return (
    <nav className="space-y-1 px-1 pt-1 pb-8">
      <NavLink href="/dashboard" {...item} icon={<HomeIcon />} activeIcon={<HomeIcon filled />}>
        Beranda
      </NavLink>
      <NavLink href="/progres" {...item} icon={<ChartIcon />} activeIcon={<ChartIcon filled />}>
        Progres
      </NavLink>
      <NavLink href="/search" {...item} icon={<CompassIcon />} activeIcon={<CompassIcon filled />}>
        Telusuri
      </NavLink>
      <hr className="mx-2 my-2 border-rule" />
      {tutors.map((t) => (
        <NavLink
          key={t.id}
          href={`/${t.slug}`}
          prefix
          {...item}
          icon={<Avatar src={t.imageUrl} name={t.name} size={28} />}
        >
          <span className="line-clamp-2 text-center leading-tight">
            {t.name.replace(/^Ustadz\s+/i, "")}
          </span>
        </NavLink>
      ))}
      <NavLink href="/request-pengajar" {...item} icon={<PlusIcon />}>
        Request
      </NavLink>
    </nav>
  );
}
