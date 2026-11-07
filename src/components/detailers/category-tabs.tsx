"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/sample-data";

/** Chip row with a sliding underline: one element moves with translateX/scaleX (200ms ease-out). */
export function CategoryTabs({ active }: { active: string }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [bar, setBar] = useState({ x: 0, w: 0, ready: false });

  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[active];
      if (el) setBar({ x: el.offsetLeft, w: el.offsetWidth, ready: true });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  const go = (id: string) => {
    const q = new URLSearchParams(params.toString());
    if (id === "all") q.delete("service");
    else q.set("service", id);
    router.replace(`${path}?${q.toString()}`, { scroll: false });
  };

  return (
    <div role="tablist" aria-label="Service type" className="relative flex gap-6 overflow-x-auto border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          ref={(el) => {
            refs.current[c.id] = el;
          }}
          role="tab"
          aria-selected={active === c.id}
          type="button"
          onClick={() => go(c.id)}
          className={`press min-h-12 flex-none whitespace-nowrap text-sm font-semibold transition-[color,transform] duration-150 ease-out active:scale-[0.97] ${
            active === c.id ? "text-ink" : "text-muted hover:text-ink"
          }`}
        >
          {c.label}
        </button>
      ))}
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-0.5 w-[100px] origin-left bg-ink transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${bar.x}px) scaleX(${bar.w / 100})`, opacity: bar.ready ? 1 : 0 }}
      />
    </div>
  );
}
