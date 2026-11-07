const paths = {
  check: "m5 12.500 4.500 4.500L19 7.500",
  shield: "M12 3 5 6v5c0 4.500 3 8 7 10 4-2 7-5.500 7-10V6zM9 12l2 2 4-4",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  pin: "M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11zM12 12.500a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5z",
  chat: "M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
  car: "M3 16v-3l2-5h14l2 5v3M3 16h18M7 16v2M17 16v2M6.500 13h11",
  drop: "M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z",
  bolt: "M13 3 5 14h6l-1 7 8-11h-6z",
  plug: "M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4",
  sparkle: "M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800z",
  receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6",
  calendar: "M8 3v4M16 3v4M3.500 10h17M5 5h14a1.500 1.500 0 0 1 1.500 1.500v12A1.500 1.500 0 0 1 19 20H5a1.500 1.500 0 0 1-1.500-1.500v-12A1.500 1.500 0 0 1 5 5z",
  card: "M3 7.500A2.500 2.500 0 0 1 5.500 5h13A2.500 2.500 0 0 1 21 7.500v9a2.500 2.500 0 0 1-2.500 2.500h-13A2.500 2.500 0 0 1 3 16.500zM3 10h18",
  chevR: "m9 5 7 7-7 7",
  chevL: "m15 5-7 7 7 7",
  chevD: "m6 9 6 6 6-6",
  heart: "M12 20s-7-4.300-7-10a4 4 0 0 1 7-2.600A4 4 0 0 1 19 10c0 5.700-7 10-7 10z",
  support: "M4 13v-1a8 8 0 0 1 16 0v1M4 13h3v5H5a1 1 0 0 1-1-1zM20 13h-3v5h2a1 1 0 0 0 1-1zM17 18c0 2-2 3-5 3",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.500 20c.8-4 4-6 7.500-6s6.700 2 7.500 6",
  x: "M6 6l12 12M18 6 6 18",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.500-3.500",
  sliders: "M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4",
  wrench: "M14.500 6.500a4 4 0 0 0 4.800 4.800l-9 9a2.100 2.100 0 0 1-3-3zM14.500 6.500 17 4l3 3-2.500 2.500",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 24, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-none ${className}`}
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

export function Stars({ n, size = 12 }: { n: number; size?: number }) {
  return (
    <span className="inline-flex" aria-label={`${n} out of 5`}>
      {Array.from({ length: Math.round(n) }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="m12 2.500 2.900 6 6.600.9-4.800 4.600 1.200 6.500L12 17.400 6.100 20.500l1.200-6.500L2.500 9.400l6.600-.9z" />
        </svg>
      ))}
    </span>
  );
}
