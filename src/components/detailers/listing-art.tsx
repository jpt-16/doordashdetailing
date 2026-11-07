import { hueFor } from "@/lib/sample-data";

/**
 * Stand-in for detailer photos (there is no photo storage yet). Each slide is a tinted scene with a
 * detailing van, varied by index so a carousel has something to swipe through.
 */
export function ListingArt({ slug, index = 0 }: { slug: string; index?: number }) {
  const h = (hueFor(slug) + index * 28) % 360;
  const id = `a-${slug}-${index}`;
  const x = [40, 70, 20, 55, 30, 62][index % 6];
  const scale = [1, 1.25, 0.9, 1.1, 1.4, 0.95][index % 6];
  return (
    <svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${h} 60% 62%)`} />
          <stop offset="1" stopColor={`hsl(${(h + 40) % 360} 62% 30%)`} />
        </linearGradient>
      </defs>
      <rect width="320" height="240" fill={`url(#${id})`} />
      <circle cx={260 - index * 18} cy="52" r="70" fill="#fff" opacity=".09" />
      <circle cx="30" cy="230" r="90" fill="#fff" opacity=".07" />
      <g transform={`translate(${x} ${70 + (1 - scale) * 40}) scale(${scale * 1.5})`}>
        <ellipse cx="60" cy="62" rx="50" ry="4.500" fill="#000" opacity=".18" />
        <path d="M12 50V26c0-4 3-7 7-7h46c5 0 9 2 12 6l14 12c3 3 5 6 5 10v3z" fill="#fff" />
        <path d="M72 26h10l12 11H72z" fill={`hsl(${h} 40% 85%)`} />
        <path d="M12 50h98v3a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3z" fill="#1b1b1b" opacity=".85" />
        <circle cx="33" cy="54" r="9" fill="#111" />
        <circle cx="33" cy="54" r="3.500" fill="#d3dae3" />
        <circle cx="90" cy="54" r="9" fill="#111" />
        <circle cx="90" cy="54" r="3.500" fill="#d3dae3" />
        <path d="M38 27c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z" fill={`hsl(${h} 70% 45%)`} />
      </g>
    </svg>
  );
}
