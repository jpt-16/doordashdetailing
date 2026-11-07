"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Sheet } from "@/components/ui/sheet";
import { CATEGORIES } from "@/lib/sample-data";

const TYPES = [
  { id: "any", label: "Any type" },
  { id: "instant", label: "Instant book" },
  { id: "request", label: "Request" },
];

export function FiltersButton() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(params.get("type") ?? "any");
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");
  const [service, setService] = useState(params.get("service") ?? "all");

  const active = ["type", "min", "max"].filter((k) => params.get(k)).length;

  const apply = () => {
    const q = new URLSearchParams(params.toString());
    const set = (k: string, v: string, empty: string) => (v && v !== empty ? q.set(k, v) : q.delete(k));
    set("type", type, "any");
    set("min", min, "");
    set("max", max, "");
    set("service", service, "all");
    router.replace(`${path}?${q.toString()}`, { scroll: false });
    setOpen(false);
  };
  const clear = () => {
    setType("any");
    setMin("");
    setMax("");
    setService("all");
  };

  const box =
    "block h-14 w-full rounded-btn border border-field px-3 pt-4 text-base focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press inline-flex h-11 flex-none items-center gap-2 rounded-btn border border-field px-4 text-sm font-semibold transition-transform duration-150 ease-out active:scale-[0.97]"
      >
        <Icon name="sliders" size={18} /> Filters{active ? ` · ${active}` : ""}
      </button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Filters"
        footer={
          <div className="flex items-center justify-between">
            <button type="button" onClick={clear} className="link press text-base transition-transform duration-150 ease-out active:scale-[0.97]">
              Clear all
            </button>
            <Button size="lg" variant="dark" onClick={apply}>
              Show results
            </Button>
          </div>
        }
      >
        <h3 className="text-[22px] font-semibold tracking-tight">Booking type</h3>
        <p className="mt-1 text-sm text-muted">Instant book confirms right away. Requests wait for the detailer.</p>
        {/* Joined segment group: the active segment fills solid ink. */}
        <div role="radiogroup" aria-label="Booking type" className="mt-4 grid grid-cols-3 overflow-hidden rounded-card border border-line">
          {TYPES.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={type === t.id}
              onClick={() => setType(t.id)}
              className={`min-h-14 text-sm font-semibold transition-colors duration-150 ${i > 0 ? "border-l border-line" : ""} ${
                type === t.id ? "bg-ink text-white" : "bg-white text-ink hover:bg-band"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="my-6 h-px bg-line" />
        <h3 className="text-[22px] font-semibold tracking-tight">Price range</h3>
        <p className="mt-1 text-sm text-muted">Starting price for your vehicle size</p>
        <div className="mt-4 flex items-center gap-4">
          <label className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-2 text-xs text-muted">Minimum</span>
            <input className={box} inputMode="numeric" placeholder="$0" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} />
          </label>
          <span className="h-px w-4 bg-ink" />
          <label className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-2 text-xs text-muted">Maximum</span>
            <input className={box} inputMode="numeric" placeholder="$500+" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} />
          </label>
        </div>

        <div className="my-6 h-px bg-line" />
        <h3 className="text-[22px] font-semibold tracking-tight">Service type</h3>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={service === c.id}
              onClick={() => setService(c.id)}
              className={`press min-h-14 rounded-card border-2 bg-white px-3 text-left text-sm font-semibold transition-transform duration-150 ease-out active:scale-[0.97] ${
                service === c.id ? "border-ink" : "border-line"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
}
