/** Shown wherever a detailer has no photos yet: a flat neutral tile with their initials. No illustration. */
export function PhotoPlaceholder({ name, className = "" }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className={`grid h-full w-full place-items-center bg-band text-muted ${className}`} role="img" aria-label={`${name}, no photos yet`}>
      <span className="text-3xl font-semibold tracking-tight">{initials}</span>
    </div>
  );
}
