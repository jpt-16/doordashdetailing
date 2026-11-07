"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Band, Hairline, LabelRow } from "@/components/ui/section";
import { Icon, Stars } from "@/components/ui/icons";
import { PhotoPlaceholder } from "@/components/detailers/photo-placeholder";
import { createBooking } from "@/app/actions/bookings";
import { priceOf, type Service, type VehicleSize } from "@/lib/sample-data";
import { WINDOW_LABEL, dollars, prettyDay } from "@/lib/bookings";
import type { Slot } from "@/lib/slots";
import type { UserRole, Win } from "@/types/db";

type Row = "service" | "date" | "window" | "vehicle" | "address";
const SIZES: VehicleSize[] = ["sedan", "suv", "truck"];
const sizeLabel = (s: string) => (s === "suv" ? "SUV" : s[0].toUpperCase() + s.slice(1));

const control =
  "mt-2 block h-12 w-full rounded-btn border border-field bg-white px-3 text-base focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink";

export function BookingForm({
  detailerId,
  name,
  photo,
  rating,
  reviewCount,
  instant,
  services,
  factor,
  slots,
  sample,
  bookable,
  initial,
  role,
  depositPercent,
}: {
  detailerId: string;
  name: string;
  photo?: string;
  rating: number | null;
  reviewCount: number;
  instant: boolean;
  services: Service[];
  factor: number;
  slots: Slot[];
  sample: boolean;
  bookable: boolean;
  initial: { service: string; date: string; window: string; vehicle: VehicleSize; where: string };
  role: UserRole | null;
  depositPercent: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<Row | null>(null);
  const [serviceId, setServiceId] = useState(initial.service);
  const firstDate = slots.find((s) => s.date === initial.date)?.date ?? slots[0]?.date ?? "";
  const [date, setDate] = useState(firstDate);
  const winsFor = (d: string) => slots.find((s) => s.date === d)?.wins ?? [];
  const [win, setWin] = useState<Win | "">(
    (winsFor(firstDate).find((w) => w === initial.window) ?? winsFor(firstDate)[0] ?? "") as Win | "",
  );
  const [vehicle, setVehicle] = useState<VehicleSize>(initial.vehicle);
  const [where, setWhere] = useState(initial.where);
  const [note, setNote] = useState("");
  const [breakdown, setBreakdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const svc = services.find((s) => s.id === serviceId) ?? services[0];
  const totalC = svc ? Math.round(priceOf(svc, vehicle, factor) * 100) : 0;
  const depC = Math.round((totalC * depositPercent) / 100);
  const restC = totalC - depC;
  const sedanC = svc ? Math.round(priceOf(svc, "sedan", factor) * 100) : 0;

  const canSubmit = bookable && !!svc && !!date && !!win && role !== "detailer" && role !== "admin";

  const submit = () => {
    setError(null);
    if (!role) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    start(async () => {
      const res = await createBooking({ detailerId, serviceId, vehicle, address: where, day: date, win, note });
      if (res.ok) router.push(`/bookings/${res.id}`);
      else setError(res.error);
    });
  };

  const edit = (row: Row) => (
    <button
      type="button"
      onClick={() => setEditing(editing === row ? null : row)}
      className="link press text-base transition-transform duration-150 ease-out active:scale-[0.97]"
    >
      {editing === row ? "Done" : "Edit"}
    </button>
  );
  const row = (r: Row, label: string, value: string, field: ReactNode) => (
    <>
      <LabelRow label={label} action={edit(r)}>
        {value}
      </LabelRow>
      {editing === r && <div className="step-in -mt-2 pb-4">{field}</div>}
    </>
  );

  if (!svc) {
    return <p className="py-10 text-base text-muted">This detailer has not listed any services yet.</p>;
  }

  return (
    <div className="-mx-6 sm:mx-0">
      <div className="flex gap-4 px-6 pb-6 sm:px-0">
        <div className="h-24 w-28 flex-none overflow-hidden rounded-btn">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={name} className="h-full w-full object-cover" />
          ) : (
            <PhotoPlaceholder name={name} />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted">Mobile detailer</p>
          <p className="truncate text-base font-semibold leading-snug">{name}</p>
          <p className="text-sm">{svc.name}</p>
          <p className="mt-1 flex items-center gap-1 text-xs">
            {rating === null ? (
              <span className="font-semibold">New</span>
            ) : (
              <>
                <Stars n={1} size={11} /> {rating.toFixed(1)} <span className="text-muted">({reviewCount})</span>
              </>
            )}
          </p>
        </div>
      </div>

      {!bookable && (
        <div className="mx-6 mb-6 rounded-btn bg-band p-4 text-sm sm:mx-0">
          {sample
            ? "This is a sample detailer, so booking is turned off. Approved detailers can be booked."
            : "This detailer has not opened any times yet. Check back soon."}
        </div>
      )}

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
                  {s.name} · ${priceOf(s, vehicle, factor)}
                </option>
              ))}
            </select>,
          )}
          {row(
            "date",
            "Date",
            date ? prettyDay(date) : "No open days",
            slots.length ? (
              <select
                aria-label="Date"
                className={control}
                value={date}
                onChange={(e) => {
                  const d = e.target.value;
                  setDate(d);
                  if (!winsFor(d).includes(win as Win)) setWin(winsFor(d)[0] ?? "");
                }}
              >
                {slots.map((s) => (
                  <option key={s.date} value={s.date}>
                    {prettyDay(s.date)}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted">No open days in the next two weeks.</p>
            ),
          )}
          {row(
            "window",
            "Arrival window",
            win ? WINDOW_LABEL[win] : "Choose a day first",
            <select aria-label="Arrival window" className={control} value={win} onChange={(e) => setWin(e.target.value as Win)}>
              {winsFor(date).map((w) => (
                <option key={w} value={w}>
                  {WINDOW_LABEL[w]}
                </option>
              ))}
            </select>,
          )}
          {row(
            "vehicle",
            "Vehicle",
            sizeLabel(vehicle),
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
                  {sizeLabel(s)}
                </button>
              ))}
            </div>,
          )}
          {row(
            "address",
            "Address",
            where || "Add the address",
            <input aria-label="Address" className={control} value={where} onChange={(e) => setWhere(e.target.value)} placeholder="Street address, town" autoComplete="street-address" />,
          )}
        </div>
      </section>

      <Band />
      <section className="px-6 py-6 sm:px-0">
        <h2 className="text-[22px] font-semibold tracking-tight">Your total</h2>
        <div className="mt-4 space-y-3 text-base">
          <div className="flex justify-between">
            <span>{svc.name}</span>
            <span className="tabular-nums">{dollars(totalC)}</span>
          </div>
          <Hairline />
          <div className="flex justify-between font-semibold">
            <span>Total (USD)</span>
            <span className="tabular-nums">{dollars(totalC)}</span>
          </div>
          <div className="flex items-center justify-between rounded-btn bg-band px-4 py-3 font-semibold">
            <span>Deposit, {depositPercent}%</span>
            <span className="tabular-nums">{dollars(depC)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>After the job is done</span>
            <span className="tabular-nums">{dollars(restC)}</span>
          </div>
        </div>
        <button type="button" onClick={() => setBreakdown(true)} className="link press ml-auto mt-4 block text-base transition-transform duration-150 ease-out active:scale-[0.97]">
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
          maxLength={500}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder={`Hi ${name.split(" ")[0]}! My car is…`}
          className="mt-4 block w-full rounded-btn border border-field p-4 text-base placeholder:text-muted focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
        />
      </section>

      <Band />
      <section className="px-6 py-6 sm:px-0">
        <h2 className="text-[22px] font-semibold tracking-tight">Cancellation policy</h2>
        <p className="mt-3 text-base">Cancel up to 24 hours before your arrival window for a full refund. After that, the deposit is not refunded.</p>
      </section>

      <Band />
      <section className="flex gap-4 px-6 py-6 sm:px-0">
        <Icon name="clock" size={32} />
        <p className="text-base">
          <span className="font-semibold">
            {instant ? "Your time is held as soon as you book." : "Your booking is not confirmed until the detailer accepts (within 24 hours)."}
          </span>{" "}
          Deposits and payments arrive in the next build step, so nothing is charged yet.
        </p>
      </section>

      <Band />
      <section className="px-6 pb-32 pt-6 sm:px-0">
        <p className="text-xs leading-relaxed text-muted">
          By selecting the button below, I agree to the cancellation policy and to pay the total shown if the booking is confirmed.
        </p>
        {error && (
          <p role="alert" className="mt-4 rounded-btn bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}
        {(role === "detailer" || role === "admin") && (
          <p className="mt-4 text-sm text-muted">Sign in with a customer account to book.</p>
        )}
        <Button size="lg" className="mt-5 w-full" onClick={submit} disabled={pending || (!!role && !canSubmit)}>
          {pending ? "Booking…" : instant ? "Book now" : "Request to book"}
        </Button>
      </section>

      <Sheet open={breakdown} onClose={() => setBreakdown(false)} title="Price breakdown">
        <div className="space-y-3 text-base tabular-nums">
          <div className="flex justify-between">
            <span>{svc.name}</span>
            <span>{dollars(sedanC)}</span>
          </div>
          {totalC !== sedanC && (
            <div className="flex justify-between">
              <span>Size adjustment ({sizeLabel(vehicle)})</span>
              <span>+{dollars(totalC - sedanC)}</span>
            </div>
          )}
          <Hairline />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{dollars(totalC)}</span>
          </div>
          <div className="flex justify-between">
            <span>Deposit ({depositPercent}%)</span>
            <span>{dollars(depC)}</span>
          </div>
          <div className="flex justify-between">
            <span>Charged after the job</span>
            <span>{dollars(restC)}</span>
          </div>
        </div>
        <p className="mt-5 text-sm text-muted">No extra fees. The platform fee comes out of the detailer’s payout, not your total.</p>
      </Sheet>
    </div>
  );
}
