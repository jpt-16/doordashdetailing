"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { addDays, format, startOfToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Band, Hairline, LabelRow } from "@/components/ui/section";
import { Icon, Stars } from "@/components/ui/icons";
import { ListingArt } from "@/components/detailers/listing-art";
import { servicePrice, type Service, type VehicleSize } from "@/lib/sample-data";

type Row = "service" | "date" | "window" | "vehicle" | "address";

const WINDOWS = [
  ["morning", "Morning, 8 to 12"],
  ["afternoon", "Afternoon, 12 to 4"],
  ["evening", "Evening, 4 to 7"],
] as const;
const SIZES: VehicleSize[] = ["sedan", "suv", "truck"];

const control =
  "mt-2 block h-12 w-full rounded-btn border border-field bg-white px-3 text-base focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink";

export function BookingForm({
  slug,
  name,
  rating,
  reviewCount,
  instant,
  services,
  factor,
  initial,
  signedIn,
  depositPercent,
}: {
  slug: string;
  name: string;
  rating: number;
  reviewCount: number;
  instant: boolean;
  services: Service[];
  factor: number;
  initial: { service: string; date: string; window: string; vehicle: VehicleSize; where: string };
  signedIn: boolean;
  depositPercent: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | null>(null);
  const [serviceId, setServiceId] = useState(initial.service);
  const [date, setDate] = useState(initial.date);
  const [win, setWin] = useState(initial.window || "morning");
  const [vehicle, setVehicle] = useState<VehicleSize>(initial.vehicle);
  const [where, setWhere] = useState(initial.where);
  const [note, setNote] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [breakdown, setBreakdown] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Dates depend on today's date, so they are built after mount to avoid a server/client mismatch.
  useEffect(() => {
    const t = startOfToday();
    setDays(Array.from({ length: 14 }, (_, i) => format(addDays(t, i), "yyyy-MM-dd")));
  }, []);

  const svc = services.find((s) => s.id === serviceId) ?? services[0];
  const total = servicePrice(svc.base, vehicle, factor);
  const deposit = Math.round((total * depositPercent) / 100);
  const rest = total - deposit;
  const winLabel = WINDOWS.find((w) => w[0] === win)![1];

  const edit = (row: Row) => (
    <button
      type="button"
      onClick={() => setEditing(editing === row ? null : row)}
      className="link press text-base transition-transform duration-150 ease-out active:scale-[0.97]"
    >
      {editing === row ? "Done" : "Edit"}
    </button>
  );

  const submit = () => {
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setSubmitted(true);
  };

  const row = (r: Row, label: string, value: string, field: ReactNode) => (
    <>
      <LabelRow label={label} action={edit(r)}>
        {value}
      </LabelRow>
      {editing === r && <div className="step-in -mt-2 pb-4">{field}</div>}
    </>
  );

  return (
    <div className="-mx-6 sm:mx-0">
      <div className="flex gap-4 px-6 pb-6 sm:px-0">
        <div className="h-24 w-28 flex-none overflow-hidden rounded-btn">
          <ListingArt slug={slug} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted">Mobile detailer</p>
          <p className="truncate text-base font-semibold leading-snug">{name}</p>
          <p className="text-sm">{svc.name}</p>
          <p className="mt-1 flex items-center gap-1 text-xs">
            <Stars n={1} size={11} /> {rating.toFixed(1)} <span className="text-muted">({reviewCount})</span>
          </p>
        </div>
      </div>

      <Band />
      <section className="px-6 py-6 sm:px-0">
        <h2 className="text-[22px] font-semibold tracking-tight">Your appointment</h2>
        <div className="divide-y divide-line">
          {row(
            "service",
            "Service",
            svc.name,
            <select aria-label="Service" className={control} value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · ${servicePrice(s.base, vehicle, factor)}
                </option>
              ))}
            </select>,
          )}
          {row(
            "date",
            "Date",
            date ? format(new Date(date + "T00:00"), "EEEE, MMMM d") : "Choose a day",
            <select aria-label="Date" className={control} value={date} onChange={(e) => setDate(e.target.value)}>
              <option value="">Choose a day</option>
              {(days.includes(date) || !date ? days : [date, ...days]).map((d) => (
                <option key={d} value={d}>
                  {format(new Date(d + "T00:00"), "EEEE, MMMM d")}
                </option>
              ))}
            </select>,
          )}
          {row(
            "window",
            "Arrival window",
            winLabel,
            <select aria-label="Arrival window" className={control} value={win} onChange={(e) => setWin(e.target.value)}>
              {WINDOWS.map(([id, l]) => (
                <option key={id} value={id}>
                  {l}
                </option>
              ))}
            </select>,
          )}
          {row(
            "vehicle",
            "Vehicle",
            vehicle === "suv" ? "SUV" : vehicle[0].toUpperCase() + vehicle.slice(1),
            <div className="grid grid-cols-3 gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={vehicle === s}
                  onClick={() => setVehicle(s)}
                  className={`press min-h-12 rounded-card border-2 bg-white text-sm font-semibold transition-transform duration-150 ease-out active:scale-[0.97] ${
                    vehicle === s ? "border-ink" : "border-line"
                  }`}
                >
                  {s === "suv" ? "SUV" : s[0].toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>,
          )}
          {row(
            "address",
            "Address",
            where || "Add the address",
            <input aria-label="Address" className={control} value={where} onChange={(e) => setWhere(e.target.value)} placeholder="Street address" autoComplete="street-address" />,
          )}
        </div>
      </section>

      <Band />
      <section className="px-6 py-6 sm:px-0">
        <h2 className="text-[22px] font-semibold tracking-tight">Your total</h2>
        <div className="mt-4 space-y-3 text-base">
          <div className="flex justify-between">
            <span>{svc.name}</span>
            <span className="tabular-nums">${total}.00</span>
          </div>
          <Hairline />
          <div className="flex justify-between font-semibold">
            <span>Total (USD)</span>
            <span className="tabular-nums">${total}.00</span>
          </div>
          <div className="flex items-center justify-between rounded-btn bg-band px-4 py-3 font-semibold">
            <span>Due today, {depositPercent}% deposit</span>
            <span className="tabular-nums">${deposit}.00</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>After the job is done</span>
            <span className="tabular-nums">${rest}.00</span>
          </div>
        </div>
        <button type="button" onClick={() => setBreakdown(true)} className="link press mt-4 block ml-auto text-base transition-transform duration-150 ease-out active:scale-[0.97]">
          Price breakdown
        </button>
      </section>

      <Band />
      <section className="px-6 py-6 sm:px-0">
        <h2 className="text-[22px] font-semibold tracking-tight">Message {name.split(" ")[0]}</h2>
        <p className="mt-1 text-sm text-muted">Share anything that helps: pet hair, a tight driveway, or gate codes.</p>
        <textarea
          aria-label="Message to your detailer"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder={`Hi ${name.split(" ")[0]}! My car is…`}
          className="mt-4 block w-full rounded-btn border border-field p-4 text-base placeholder:text-muted focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
        />
      </section>

      <Band />
      <section className="px-6 py-6 sm:px-0">
        <h2 className="text-[22px] font-semibold tracking-tight">Cancellation policy</h2>
        <p className="mt-3 text-base">
          Cancel up to 24 hours before your arrival window for a full refund. After that, the deposit is not refunded.
        </p>
      </section>

      <Band />
      <section className="flex gap-4 px-6 py-6 sm:px-0">
        <Icon name="clock" size={32} />
        <p className="text-base">
          <span className="font-semibold">
            {instant ? "You are booked as soon as you pay the deposit." : "Your booking is not confirmed until the detailer accepts (within 24 hours)."}
          </span>{" "}
          You will not be charged the rest until the job is done.
        </p>
      </section>

      <Band />
      <section className="px-6 pb-32 pt-6 sm:px-0">
        <p className="text-xs leading-relaxed text-muted">
          By selecting the button below, I agree to the cancellation policy and to pay the total shown if the booking is confirmed.
        </p>
        {submitted ? (
          <div role="status" className="step-in mt-5 rounded-card border border-ink p-5">
            <p className="text-base font-semibold">Preview only</p>
            <p className="mt-1 text-sm text-muted">
              Bookings and payments arrive in the next build step, so nothing was sent or charged.
            </p>
          </div>
        ) : (
          <Button size="lg" className="mt-5 w-full" onClick={submit}>
            {instant ? "Book now" : "Request to book"}
          </Button>
        )}
      </section>

      <Sheet open={breakdown} onClose={() => setBreakdown(false)} title="Price breakdown">
        <div className="space-y-3 text-base tabular-nums">
          <div className="flex justify-between">
            <span>{svc.name}</span>
            <span>${servicePrice(svc.base, "sedan", factor)}.00</span>
          </div>
          {vehicle !== "sedan" && (
            <div className="flex justify-between">
              <span>Size adjustment ({vehicle})</span>
              <span>+${total - servicePrice(svc.base, "sedan", factor)}.00</span>
            </div>
          )}
          <Hairline />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total}.00</span>
          </div>
          <div className="flex justify-between">
            <span>Deposit today ({depositPercent}%)</span>
            <span>${deposit}.00</span>
          </div>
          <div className="flex justify-between">
            <span>Charged after the job</span>
            <span>${rest}.00</span>
          </div>
        </div>
        <p className="mt-5 text-sm text-muted">No extra fees. The detailer’s platform fee comes out of their payout, not your total.</p>
      </Sheet>
    </div>
  );
}
