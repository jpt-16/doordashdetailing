"use client";

import { useMemo, useState } from "react";
import { Icon, Stars, type IconName } from "@/components/ui/icons";
import { Sheet } from "@/components/ui/sheet";
import { servicePrice, type Review, type Service, type VehicleSize } from "@/lib/sample-data";

const catIcon: Record<Service["cat"], IconName> = { exterior: "drop", interior: "car", full: "sparkle", ceramic: "shield", fleet: "car" };

/** Bio clamped to 3 lines with an underlined "Show more ›". */
export function ShowMore({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 160;
  return (
    <div>
      <p className={`text-base leading-relaxed ${open || !long ? "" : "line-clamp-3"}`}>{text}</p>
      {long && (
        <button type="button" onClick={() => setOpen((v) => !v)} className="link press mt-2 inline-flex items-center gap-1 text-base transition-transform duration-150 ease-out active:scale-[0.97]">
          {open ? "Show less" : "Show more"} <Icon name={open ? "chevD" : "chevR"} size={14} className={open ? "rotate-180" : ""} />
        </button>
      )}
    </div>
  );
}

export function ServicesList({ services, size, factor }: { services: Service[]; size: VehicleSize; factor: number }) {
  const [open, setOpen] = useState(false);
  const preview = services.slice(0, 5);
  return (
    <>
      <ul>
        {preview.map((s) => (
          <li key={s.id} className="flex items-center gap-4 py-3">
            <Icon name={catIcon[s.cat]} size={24} />
            <span className="flex-1 text-base">{s.name}</span>
            <span className="text-base font-semibold">${servicePrice(s.base, size, factor)}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press mt-4 h-12 w-full rounded-btn border border-ink text-base font-semibold transition-[transform,background-color] duration-150 ease-out hover:bg-band active:scale-[0.97]"
      >
        Show all {services.length} services
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="What’s included">
        <ul className="divide-y divide-line">
          {services.map((s) => (
            <li key={s.id} className="flex gap-4 py-4">
              <Icon name={catIcon[s.cat]} size={24} className="mt-0.5" />
              <div className="flex-1">
                <p className="text-base font-semibold">{s.name}</p>
                <p className="text-sm text-muted">{s.blurb}</p>
                <p className="mt-1 text-sm text-muted">About {s.mins >= 60 ? `${Math.floor(s.mins / 60)} hr${s.mins % 60 ? ` ${s.mins % 60} min` : ""}` : `${s.mins} min`}</p>
              </div>
              <p className="text-base font-semibold">${servicePrice(s.base, size, factor)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">Prices are for your vehicle size ({size}).</p>
      </Sheet>
    </>
  );
}

function ReviewCard({ r, wide }: { r: Review; wide?: boolean }) {
  return (
    <article className={`rounded-card border border-line p-5 ${wide ? "" : "w-[280px] flex-none snap-start"}`}>
      <div className="flex items-center gap-2 text-sm">
        <Stars n={r.rating} />
      </div>
      <p className="mt-3 line-clamp-4 text-base leading-snug">“{r.text}”</p>
      <div className="mt-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-band text-sm font-semibold">{r.name[0]}</span>
        <div>
          <p className="text-sm font-semibold">{r.name}</p>
          <p className="text-sm text-muted">{r.when}</p>
        </div>
      </div>
    </article>
  );
}

const SORTS = [
  { id: "recent", label: "Most recent" },
  { id: "high", label: "Highest rated" },
  { id: "low", label: "Lowest rated" },
] as const;

export function ReviewsBlock({ reviews, business }: { reviews: Review[]; business: string }) {
  const [open, setOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("recent");
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const f = reviews.filter((r) => !q || (r.text + r.name).toLowerCase().includes(q.toLowerCase()));
    return [...f].sort((a, b) => (sort === "recent" ? b.ts - a.ts : sort === "high" ? b.rating - a.rating || b.ts - a.ts : a.rating - b.rating || b.ts - a.ts));
  }, [reviews, q, sort]);

  if (reviews.length === 0) return <p className="text-base text-muted">No reviews yet. Be one of the first to book.</p>;

  return (
    <>
      <div className="-mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {reviews.slice(0, 5).map((r) => (
          <ReviewCard key={r.name + r.ts} r={r} />
        ))}
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press mt-5 h-12 w-full rounded-btn border border-ink text-base font-semibold transition-[transform,background-color] duration-150 ease-out hover:bg-band active:scale-[0.97]"
      >
        Show all {reviews.length} reviews
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title={`${reviews.length} reviews`}>
        <label className="flex h-12 items-center gap-3 rounded-btn border border-field px-4 focus-within:border-ink focus-within:ring-1 focus-within:ring-ink">
          <Icon name="search" size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search reviews of ${business}`} className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted" />
        </label>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted">{shown.length} shown</p>
          <button type="button" onClick={() => setSortOpen(true)} className="press inline-flex items-center gap-1 text-sm font-semibold transition-transform duration-150 ease-out active:scale-[0.97]">
            {SORTS.find((s) => s.id === sort)!.label} <Icon name="chevD" size={16} />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {shown.map((r) => (
            <ReviewCard key={r.name + r.ts} r={r} wide />
          ))}
          {shown.length === 0 && <p className="py-8 text-center text-base text-muted">No reviews match “{q}”.</p>}
        </div>
        <Sheet open={sortOpen} onClose={() => setSortOpen(false)} title="Sort by" back>
          <ul role="radiogroup" aria-label="Sort reviews">
            {SORTS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={sort === s.id}
                  onClick={() => {
                    setSort(s.id);
                    setSortOpen(false);
                  }}
                  className="flex min-h-14 w-full items-center justify-between border-b border-line text-left text-base"
                >
                  {s.label}
                  <span className={`grid h-6 w-6 place-items-center rounded-full border-2 ${sort === s.id ? "border-ink" : "border-field"}`}>
                    {sort === s.id && <span className="h-3 w-3 rounded-full bg-ink" />}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Sheet>
      </Sheet>
    </>
  );
}
