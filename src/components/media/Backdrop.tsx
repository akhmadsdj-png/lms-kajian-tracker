// Blurred artwork behind a hero or header, fading into the page (Spotify / Apple TV style).
export function Backdrop({ src }: { src: string | null }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element -- decorative, heavily blurred
        <img src={src} alt="" className="h-full w-full scale-125 object-cover opacity-90 blur-3xl saturate-150" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-paper/10 via-paper/55 to-paper" />
    </div>
  );
}
