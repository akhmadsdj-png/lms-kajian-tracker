import Image from "next/image";

export function Avatar({ src, name, size }: { src: string | null; name: string; size: number }) {
  const initials = name
    .replace(/^Ustadz\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return src ? (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      unoptimized
      // Google profile photos often refuse hotlinked requests that carry a Referer
      referrerPolicy="no-referrer"
      className="shrink-0 rounded-full bg-raised object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-raised font-semibold text-pencil"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
