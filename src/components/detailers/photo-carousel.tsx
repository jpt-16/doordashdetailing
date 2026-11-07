"use client";

import { useRef, useState } from "react";
import { PhotoPlaceholder } from "@/components/detailers/photo-placeholder";

/**
 * Scroll-snap carousel of the detailer's own photos. With no photos (nothing uploads yet) it is a single
 * neutral placeholder. `pill` shows "1 / N" (profile); `dots` shows dots (cards).
 */
export function PhotoCarousel({
  name,
  photos = [],
  pill = false,
  dots = false,
  className = "",
}: {
  name: string;
  photos?: string[];
  pill?: boolean;
  dots?: boolean;
  className?: string;
}) {
  const [i, setI] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  if (photos.length === 0) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <PhotoPlaceholder name={name} />
      </div>
    );
  }

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
        {photos.map((src, k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt={`${name}, photo ${k + 1}`} className="h-full w-full flex-none snap-center object-cover" />
        ))}
      </div>
      {pill && (
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-btn bg-black/70 px-2 py-1 text-xs font-medium text-white">
          {i + 1} / {photos.length}
        </span>
      )}
      {dots && photos.length > 1 && (
        <span className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-1">
          {photos.map((src, k) => (
            <i key={src} className={`h-1.5 w-1.5 rounded-full transition-opacity duration-150 ${k === i ? "bg-white" : "bg-white/50"}`} />
          ))}
        </span>
      )}
    </div>
  );
}
