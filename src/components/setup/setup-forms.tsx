"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { deleteService, saveAvailability, saveService, updateProfile, type FormState } from "@/app/actions/detailer";
import { WEEKDAYS, WINDOW_SHORT, WINS } from "@/lib/bookings";
import type { Detailer, ServiceRow } from "@/types/db";

function Status({ state }: { state: FormState }) {
  if (state?.error)
    return (
      <p role="alert" className="rounded-btn bg-red-50 p-3 text-sm text-red-800">
        {state.error}
      </p>
    );
  if (state?.ok)
    return (
      <p role="status" className="rounded-btn bg-green-50 p-3 text-sm text-green-800">
        Saved.
      </p>
    );
  return null;
}

const area =
  "mt-1 block w-full rounded-btn border border-field bg-white p-3 text-base text-ink placeholder:text-muted focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink";
const select =
  "mt-1 block min-h-12 w-full rounded-btn border border-field bg-white px-3 text-base text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink";

/* ---------- business profile ---------- */
export function ProfileForm({ detailer }: { detailer: Detailer }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field label="Business name" name="business_name" defaultValue={detailer.business_name} required maxLength={60} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Town" name="town" defaultValue={detailer.town} maxLength={40} autoComplete="address-level2" />
        <Field label="Zip code" name="zip" defaultValue={detailer.zip} inputMode="numeric" maxLength={5} autoComplete="postal-code" />
      </div>
      <label className="block text-sm font-medium text-ink">
        About your business
        <textarea name="bio" defaultValue={detailer.bio} rows={5} maxLength={600} className={area} placeholder="What you offer, your equipment, and the areas you cover." />
      </label>
      <Status state={state} />
      <Button type="submit" variant="dark" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

/* ---------- services ---------- */
const CATS = [
  ["exterior", "Exterior"],
  ["interior", "Interior"],
  ["full", "Full detail"],
  ["ceramic", "Ceramic"],
  ["fleet", "Fleet"],
] as const;

function ServiceForm({ service }: { service?: ServiceRow }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveService, undefined);
  const d = (c?: number) => (c ? String(c / 100) : "");
  return (
    <form action={action} className="space-y-4">
      {service && <input type="hidden" name="id" value={service.id} />}
      <Field label="Service name" name="name" defaultValue={service?.name} required maxLength={80} placeholder="Premium exterior" />
      <label className="block text-sm font-medium text-ink">
        What is included
        <textarea name="description" defaultValue={service?.description} rows={2} maxLength={300} className={area} placeholder="Hand wash, clay bar and spray sealant." />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium text-ink">
          Type
          <select name="category" defaultValue={service?.category ?? "exterior"} className={select}>
            {CATS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <Field label="Minutes" name="minutes" type="number" inputMode="numeric" min={15} max={720} step={5} defaultValue={service?.minutes ?? 90} required />
      </div>
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Price by vehicle size (USD)</legend>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Sedan" name="sedan" type="number" inputMode="decimal" min={10} max={2000} step={1} defaultValue={d(service?.price_sedan_cents)} required />
          <Field label="SUV" name="suv" type="number" inputMode="decimal" min={10} max={2000} step={1} defaultValue={d(service?.price_suv_cents)} required />
          <Field label="Truck" name="truck" type="number" inputMode="decimal" min={10} max={2000} step={1} defaultValue={d(service?.price_truck_cents)} required />
        </div>
      </fieldset>
      {service && (
        <label className="flex min-h-11 items-center gap-3 text-base">
          <input type="checkbox" name="active" defaultChecked={service.active} className="h-5 w-5 accent-ink" />
          Show to customers
        </label>
      )}
      <Status state={state} />
      <Button type="submit" variant="dark" disabled={pending}>
        {pending ? "Saving…" : service ? "Save service" : "Add service"}
      </Button>
    </form>
  );
}

export function ServicesManager({ services }: { services: ServiceRow[] }) {
  return (
    <div className="space-y-3">
      {services.length === 0 && (
        <p className="rounded-card border border-line p-5 text-base text-muted">
          No services yet. Add your first one so customers can book you.
        </p>
      )}
      {services.map((s) => (
        <details key={s.id} className="group rounded-card border border-line">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3">
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold">{s.name}</span>
              <span className="block text-sm text-muted">
                From ${Math.min(s.price_sedan_cents, s.price_suv_cents, s.price_truck_cents) / 100} · {s.minutes} min
              </span>
            </span>
            {s.active ? <Badge tone="green">Live</Badge> : <Badge tone="neutral">Hidden</Badge>}
          </summary>
          <div className="space-y-4 border-t border-line p-5">
            <ServiceForm service={s} />
            <form action={deleteService}>
              <input type="hidden" name="id" value={s.id} />
              <Button type="submit" variant="danger">
                Delete service
              </Button>
            </form>
          </div>
        </details>
      ))}
      <details className="rounded-card border border-dashed border-field">
        <summary className="flex min-h-14 cursor-pointer list-none items-center px-5 py-3 text-base font-semibold">Add a service</summary>
        <div className="border-t border-line p-5">
          <ServiceForm key={services.length} />
        </div>
      </details>
    </div>
  );
}

/* ---------- availability + booking settings ---------- */
export function AvailabilityForm({
  open,
  instantBook,
  jobsPerWindow,
}: {
  open: string[]; // "weekday:win"
  instantBook: boolean;
  jobsPerWindow: number;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveAvailability, undefined);
  const set = new Set(open);
  return (
    <form action={action} className="space-y-5">
      <div>
        <p className="text-sm font-medium">When you work</p>
        <p className="text-sm text-muted">Tick the arrival windows you take jobs. Customers can only book ticked windows.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-center">
            <thead>
              <tr>
                <th className="w-24" />
                {WEEKDAYS.map((d) => (
                  <th key={d} scope="col" className="pb-2 text-xs font-medium text-muted">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WINS.map((w) => (
                <tr key={w}>
                  <th scope="row" className="py-1 pr-2 text-left text-sm font-medium capitalize">
                    {w}
                    <span className="block text-xs font-normal text-muted">{WINDOW_SHORT[w]}</span>
                  </th>
                  {WEEKDAYS.map((d, i) => (
                    <td key={d} className="py-1">
                      <label className="grid h-11 place-items-center">
                        <span className="sr-only">
                          {d} {w}
                        </span>
                        <input type="checkbox" name={`slot-${i}-${w}`} defaultChecked={set.has(`${i}:${w}`)} className="h-5 w-5 accent-ink" />
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <label className="block text-sm font-medium text-ink">
        Jobs you can take per window
        <select name="jobs_per_window" defaultValue={jobsPerWindow} className={select}>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-start gap-3 text-base">
        <input type="checkbox" name="instant_book" defaultChecked={instantBook} className="mt-1 h-5 w-5 accent-ink" />
        <span>
          <span className="font-semibold">Instant booking</span>
          <span className="block text-sm text-muted">Customers are confirmed right away. Leave off to approve each request first.</span>
        </span>
      </label>

      <Status state={state} />
      <Button type="submit" variant="dark" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Save availability"}
      </Button>
    </form>
  );
}
