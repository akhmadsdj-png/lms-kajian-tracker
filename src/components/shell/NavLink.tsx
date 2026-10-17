"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className: string;
  activeClassName: string;
  inactiveClassName?: string;
  /** Optional icon pair; the filled variant shows on the active route */
  icon?: React.ReactNode;
  activeIcon?: React.ReactNode;
  /** Match nested routes too, e.g. a tutor link stays active on its playlists */
  prefix?: boolean;
}

// Props are plain values so server components can render this.
export function NavLink({
  href,
  children,
  className,
  activeClassName,
  inactiveClassName = "",
  icon,
  activeIcon,
  prefix = false,
}: NavLinkProps) {
  const pathname = usePathname();
  const active = prefix ? pathname === href || pathname.startsWith(`${href}/`) : pathname === href;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${className} ${active ? activeClassName : inactiveClassName}`}
    >
      {active ? (activeIcon ?? icon) : icon}
      {children}
    </Link>
  );
}
