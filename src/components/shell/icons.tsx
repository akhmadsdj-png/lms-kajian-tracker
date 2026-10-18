type IconProps = { className?: string; filled?: boolean };

const base = (className = "h-6 w-6") => ({
  className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function HomeIcon({ className, filled }: IconProps) {
  return (
    <svg {...base(className)} fill={filled ? "currentColor" : "none"}>
      <path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6.5H9V21H4.5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

export function CompassIcon({ className, filled }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="9" fill={filled ? "currentColor" : "none"} />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" fill={filled ? "var(--color-paper)" : "none"} stroke={filled ? "var(--color-paper)" : "currentColor"} />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function LibraryIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 4v16M9 4v16M14 4.5l5.5 15" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
