"use client";

import { useRef, useState } from "react";
import { ListingArt } from "@/components/detailers/listing-art";

/** Scroll-snap carousel. `pill` shows "1 / N" (profile); `dots` shows dots (cards). */
export function PhotoCarousel({
  slug,
  count,
  pill = false,
  dots = false,
  className = "",
}: {
  slug: string;
  count: number;
  pill?: boolean;
  dots?: boolean;
  className?: string;
}) {
  const [i, setI] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const onScroll = () => {
    const el = ref.current;
    if (el) setI(Math.round(el.scrollLeft / el.clientWidth));
  };
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {Array.from({ length: count }, (_, k) => (
          <div key={k} className="h-full w-full flex-none snap-center">
            <ListingArt slug={slug} index={k} />
          </div>
        ))}
      </div>
      {pill && (
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-btn bg-black/70 px-2 py-1 text-xs font-medium text-white">
          {i + 1} / {count}
        </span>
      )}
      {dots && (
        <span className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-1">
          {Array.from({ length: count }, (_, k) => (
            <i key={k} className={`h-1.5 w-1.5 rounded-full transition-opacity duration-150 ${k === i ? "bg-white" : "bg-white/50"}`} />
          ))}
        </span>
      )}
    </div>
  );
}
