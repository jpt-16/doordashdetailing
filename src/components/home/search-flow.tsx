"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, format, getISODay, startOfToday } from "date-fns";
import { Button } from "@/components/ui/button";

type Vehicle = "sedan" | "suv" | "truck";
type Mode = "dates" | "week" | "flexible";
type Win = "morning" | "afternoon" | "evening";
type Step = "where" | "when" | "vehicle";

const STEPS: Step[] = ["where", "when", "vehicle"];
const TOWNS = ["Framingham", "Natick", "Sudbury", "Ashland", "Wayland", "Southborough"];
const WINDOWS: { id: Win; label: string; hours: string }[] = [
  { id: "morning", label: "Morning", hours: "8 to 12" },
  { id: "afternoon", label: "Afternoon", hours: "12 to 4" },
  { id: "evening", label: "Evening", hours: "4 to 7" },
];
const VEHICLES: { id: Vehicle; label: string; note: string }[] = [
  { id: "sedan", label: "Sedan", note: "Coupes, hatchbacks" },
  { id: "suv", label: "SUV", note: "Crossovers, minivans" },
  { id: "truck", label: "Truck", note: "Pickups, large vans" },
];
const MODES: { id: Mode; label: string }[] = [
  { id: "dates", label: "Dates" },
  { id: "week", label: "This week" },
  { id: "flexible", label: "Flexible" },
];

type Props = {
  defaultWhere?: string;
  defaultVehicle?: Vehicle | null;
  /** Where "Search" goes. The results page is a later step, so this is the signed-in/out landing for now. */
  searchHref: string;
};

const DRAWER_CLOSE_MS = 230;

export function SearchFlow({ defaultWhere = "", defaultVehicle = null, searchHref }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<"enter" | "open" | "closing">("enter");
  const [step, setStep] = useState<Step>("where");
  const [where, setWhere] = useState(defaultWhere);
  const [mode, setMode] = useState<Mode>("dates");
  const [date, setDate] = useState<string | null>(null);
  const [win, setWin] = useState<Win | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(defaultVehicle);
  const [dragY, setDragY] = useState<number | null>(null);

  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y0: number; t0: number; h: number } | null>(null);

  const open = () => {
    setMounted(true);
    setState("enter");
    requestAnimationFrame(() => requestAnimationFrame(() => setState("open")));
  };

  const close = useCallback(() => {
    setState("closing");
    setTimeout(() => {
      setMounted(false);
      setDragY(null);
      trigger.current?.focus();
    }, DRAWER_CLOSE_MS);
  }, []);

  // Lock page scroll, close on Escape, move focus into the dialog.
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [mounted, close]);

  // Swipe-down to dismiss on phones. Close if dragged past 25% of the height, or flicked fast enough.
  const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
  const onGrabDown = (e: React.PointerEvent) => {
    if (isDesktop()) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { y0: e.clientY, t0: performance.now(), h: panel.current?.offsetHeight ?? 600 };
    setDragY(0);
  };
  const onGrabMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setDragY(Math.max(0, e.clientY - drag.current.y0));
  };
  const onGrabUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const dy = Math.max(0, e.clientY - d.y0);
    const v = dy / Math.max(1, performance.now() - d.t0); // px per ms
    if (dy > d.h * 0.25 || v > 0.11) {
      close();
    } else {
      setDragY(null);
    }
  };

  const clearAll = () => {
    setWhere("");
    setMode("dates");
    setDate(null);
    setWin(null);
    setVehicle(null);
    setStep("where");
  };

  const search = () => {
    const q = new URLSearchParams();
    if (where) q.set("where", where);
    if (mode === "dates" && date) q.set("date", date);
    if (mode === "week") q.set("when", "this-week");
    if (mode === "flexible") q.set("when", "flexible");
    if (win) q.set("window", win);
    if (vehicle) q.set("vehicle", vehicle);
    const sep = searchHref.includes("?") ? "&" : "?";
    router.push(`${searchHref}${q.size ? sep + q.toString() : ""}`);
  };

  const whenSummary =
    mode === "week"
      ? "This week"
      : mode === "flexible"
        ? "Flexible"
        : date
          ? format(new Date(date + "T00:00"), "EEE, MMM d")
          : "Any day";
  const whenValue = win ? `${whenSummary} · ${WINDOWS.find((w) => w.id === win)!.label}` : whenSummary;
  const vehicleLabel = vehicle ? VEHICLES.find((v) => v.id === vehicle)!.label : null;

  const summary = [where || "Your address", whenSummary, vehicleLabel ?? "Vehicle"].join(" · ");
  const last = step === "vehicle";
  const next = () => (last ? search() : setStep(STEPS[STEPS.indexOf(step) + 1]));

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={open}
        className="press flex w-full max-w-xl items-center gap-4 rounded-full border border-line bg-white py-3 pl-6 pr-3 text-left shadow-pill transition-[transform,box-shadow] duration-150 ease-out hover:shadow-card active:scale-[0.98]"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">Book a detail</span>
          <span className="block truncate text-sm text-muted">{summary}</span>
        </span>
        <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-brand-600 text-white">
          <SearchIcon />
        </span>
      </button>

      {mounted && (
        <div className="fixed inset-0 z-50 md:flex md:items-center md:justify-center" role="dialog" aria-modal="true" aria-label="Book a detail">
          <div
            className="sheet-backdrop absolute inset-0 bg-black"
            data-state={state === "open" ? "open" : "closed"}
            onClick={close}
          />
          <div
            ref={panel}
            tabIndex={-1}
            data-state={state}
            data-dragging={dragY !== null}
            style={dragY !== null ? { transform: `translateY(${dragY}px)` } : undefined}
            className="sheet-panel absolute inset-x-0 bottom-0 flex max-h-[94dvh] flex-col rounded-t-[24px] bg-white outline-none md:static md:max-h-[88dvh] md:w-full md:max-w-lg md:rounded-card md:shadow-card"
          >
            <div
              className="flex touch-none justify-center pb-1 pt-2.5 md:hidden"
              onPointerDown={onGrabDown}
              onPointerMove={onGrabMove}
              onPointerUp={onGrabUp}
              onPointerCancel={onGrabUp}
            >
              <span className="h-1 w-9 rounded-full bg-field/60" />
            </div>

            <div className="flex items-center justify-between px-4 pb-3 pt-1 md:pt-4">
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="press grid h-9 w-9 place-items-center rounded-full border border-field transition-transform duration-150 ease-out active:scale-[0.97]"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M2 2l10 10M12 2 2 12" />
                </svg>
              </button>
              <p className="text-base font-semibold">Book a detail</p>
              <span className="w-9" />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-band/60 px-4 pb-5 pt-3">
              {STEPS.map((s) =>
                s === step ? (
                  <section key={s} className="step-in rounded-card bg-white p-6 shadow-card">
                    {s === "where" && <WhereStep where={where} setWhere={setWhere} done={() => setStep("when")} />}
                    {s === "when" && (
                      <WhenStep mode={mode} setMode={setMode} date={date} setDate={setDate} win={win} setWin={setWin} />
                    )}
                    {s === "vehicle" && <VehicleStep vehicle={vehicle} setVehicle={setVehicle} />}
                  </section>
                ) : (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStep(s)}
                    className="press flex w-full items-center justify-between gap-4 rounded-card bg-white px-6 py-5 text-left text-sm shadow-pill transition-transform duration-150 ease-out active:scale-[0.98]"
                  >
                    <span className="text-muted">{s === "where" ? "Where" : s === "when" ? "When" : "Vehicle"}</span>
                    <span className="truncate font-semibold text-ink">
                      {s === "where" ? where || "Add address" : s === "when" ? whenValue : (vehicleLabel ?? "Add vehicle")}
                    </span>
                  </button>
                ),
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line bg-white px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-footer md:rounded-b-card">
              <button type="button" onClick={clearAll} className="link press text-base transition-transform duration-150 ease-out active:scale-[0.97]">
                Clear all
              </button>
              {last ? (
                <Button size="lg" variant="primary" onClick={search}>
                  <SearchIcon /> Search
                </Button>
              ) : (
                <Button size="lg" variant="dark" onClick={next}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- steps ---------- */

function WhereStep({ where, setWhere, done }: { where: string; setWhere: (v: string) => void; done: () => void }) {
  return (
    <>
      <h2 className="text-[26px] font-semibold leading-tight tracking-tight">Where is the car?</h2>
      <label className="mt-5 block">
        <span className="sr-only">Street address</span>
        <input
          value={where}
          onChange={(e) => setWhere(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && where && done()}
          placeholder="Street address or town"
          autoComplete="street-address"
          className="block h-12 w-full rounded-btn border border-field px-4 text-base placeholder:text-muted focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
        />
      </label>
      <p className="mt-5 text-sm font-semibold">Suggested towns</p>
      <ul className="mt-2">
        {TOWNS.map((t) => (
          <li key={t}>
            <button
              type="button"
              onClick={() => {
                setWhere(`${t}, MA`);
                done();
              }}
              className="press flex min-h-12 w-full items-center gap-4 rounded-btn text-left text-base transition-[transform,background-color] duration-150 ease-out hover:bg-band active:scale-[0.98]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-btn bg-band">
                <PinIcon />
              </span>
              {t}, MA
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function WhenStep({
  mode,
  setMode,
  date,
  setDate,
  win,
  setWin,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  date: string | null;
  setDate: (d: string | null) => void;
  win: Win | null;
  setWin: (w: Win | null) => void;
}) {
  const idx = MODES.findIndex((m) => m.id === mode);
  return (
    <>
      <h2 className="text-[26px] font-semibold leading-tight tracking-tight">When should we come?</h2>

      {/* Pill segmented control: a white thumb slides over a band track. */}
      <div role="tablist" aria-label="When" className="relative mt-5 grid grid-cols-3 rounded-full bg-band p-1">
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-white shadow-pill transition-transform duration-200 ease-out"
          style={{ transform: `translateX(${idx * 100}%)` }}
        />
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className="relative z-10 min-h-10 rounded-full text-sm font-semibold text-ink"
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "dates" && <Calendar date={date} setDate={setDate} />}
      {mode === "week" && <p className="mt-6 text-base text-muted">We will show openings from today through Sunday.</p>}
      {mode === "flexible" && <p className="mt-6 text-base text-muted">We will show the soonest openings first.</p>}

      <p className="mt-6 text-sm font-semibold">Arrival window</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {WINDOWS.map((w) => (
          <Tile key={w.id} selected={win === w.id} onClick={() => setWin(win === w.id ? null : w.id)}>
            <span className="block text-sm font-semibold">{w.label}</span>
            <span className="block text-xs text-muted">{w.hours}</span>
          </Tile>
        ))}
      </div>
    </>
  );
}

function Calendar({ date, setDate }: { date: string | null; setDate: (d: string | null) => void }) {
  const today = startOfToday();
  const lead = getISODay(today) - 1; // Monday-first
  const start = addDays(today, -lead);
  const days = Array.from({ length: Math.ceil((lead + 21) / 7) * 7 }, (_, i) => addDays(start, i));
  const weeks = Array.from({ length: days.length / 7 }, (_, w) => days.slice(w * 7, w * 7 + 7));
  return (
    <div className="mt-5">
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="py-1">
            {d}
          </span>
        ))}
      </div>
      {weeks.map((week, wi) => {
        const first = week.find((d) => d.getDate() === 1);
        return (
          <div key={wi}>
            {(wi === 0 || first) && (
              <p className="pb-1 pt-3 text-sm font-semibold">{format(first ?? today, "MMMM yyyy")}</p>
            )}
            <div className="grid grid-cols-7">
              {week.map((d) => {
                const past = d < today;
                const iso = format(d, "yyyy-MM-dd");
                const sel = date === iso;
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={past}
                    aria-pressed={sel}
                    aria-label={format(d, "EEEE, MMMM d")}
                    onClick={() => setDate(sel ? null : iso)}
                    className={`press mx-auto grid h-11 w-11 place-items-center rounded-full border-2 text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.97] ${
                      sel ? "border-ink" : "border-transparent"
                    } ${past ? "text-field line-through" : "text-ink hover:border-line"}`}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VehicleStep({ vehicle, setVehicle }: { vehicle: Vehicle | null; setVehicle: (v: Vehicle | null) => void }) {
  return (
    <>
      <h2 className="text-[26px] font-semibold leading-tight tracking-tight">What are we detailing?</h2>
      <p className="mt-1 text-sm text-muted">Detailers price by vehicle size.</p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {VEHICLES.map((v) => (
          <Tile key={v.id} selected={vehicle === v.id} onClick={() => setVehicle(vehicle === v.id ? null : v.id)} tall>
            <CarIcon kind={v.id} />
            <span className="mt-3 block text-sm font-semibold">{v.label}</span>
            <span className="block text-xs text-muted">{v.note}</span>
          </Tile>
        ))}
      </div>
    </>
  );
}

/* ---------- pieces ---------- */

// Selection is a 2px black border that swaps instantly; the tile only scales while pressed.
function Tile({
  selected,
  onClick,
  children,
  tall,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tall?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`press rounded-card border-2 bg-white px-3 text-left transition-transform duration-150 ease-out active:scale-[0.97] ${
        tall ? "py-4" : "py-3"
      } ${selected ? "border-ink" : "border-line"}`}
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.500-3.500" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.500" />
    </svg>
  );
}

function CarIcon({ kind }: { kind: Vehicle }) {
  const body =
    kind === "sedan"
      ? "M3 16v-3l2-4h9l4 4h3v3M3 16h18M7 16v1.500M17 16v1.500"
      : kind === "suv"
        ? "M3 16v-3l2-5h11l3 4h2v4M3 16h18M7 16v1.500M17 16v1.500"
        : "M2 16v-4l2-3h7v4h4l2 2h3v1M2 16h19M6 16v1.500M18 16v1.500";
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={body} />
    </svg>
  );
}
