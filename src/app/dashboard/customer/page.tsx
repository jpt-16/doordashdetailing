import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buttonClass } from "@/components/ui/button";
import { BookingRow } from "@/components/bookings/booking-parts";
import { ACTIVE } from "@/lib/bookings";
import type { Booking } from "@/types/db";

export default async function CustomerDashboard() {
  const profile = await requireRole("customer");
  const supabase = await createClient();
  const { data } = await supabase.from("bookings").select("*").order("day", { ascending: false }).limit(50);
  const bookings = (data ?? []) as Booking[];
  const names = await detailerNames(bookings);
  const upcoming = bookings.filter((b) => ACTIVE.includes(b.status)).reverse();
  const past = bookings.filter((b) => !ACTIVE.includes(b.status));

  if (bookings.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-6 sm:py-12">
        <p className="text-sm text-muted">Hi, {profile.full_name}</p>
        <h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight">No details booked yet</h1>
        <p className="mt-3 text-base text-muted">When you book a detailer, your arrival window, address and receipt will be right here.</p>
        <Link href="/" className={buttonClass("primary", "lg", "mt-8")}>
          Book a detail
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm text-muted">Hi, {profile.full_name}</p>
      <h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight">Your bookings</h1>

      {upcoming.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[22px] font-semibold tracking-tight">Upcoming</h2>
          <div className="divide-y divide-line">
            {upcoming.map((b) => (
              <BookingRow key={b.id} b={b} title={names[b.detailer_id] ?? "Detailer"} />
            ))}
          </div>
        </section>
      )}
      {past.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[22px] font-semibold tracking-tight">Past</h2>
          <div className="divide-y divide-line">
            {past.map((b) => (
              <BookingRow key={b.id} b={b} title={names[b.detailer_id] ?? "Detailer"} />
            ))}
          </div>
        </section>
      )}
      <Link href="/" className={buttonClass("outline", "lg", "mt-8")}>
        Book another detail
      </Link>
    </div>
  );
}

async function detailerNames(bookings: Booking[]): Promise<Record<string, string>> {
  const ids = [...new Set(bookings.map((b) => b.detailer_id))];
  if (ids.length === 0) return {};
  const supabase = await createClient();
  const { data } = await supabase.from("detailers").select("id, business_name").in("id", ids);
  return Object.fromEntries(((data ?? []) as { id: string; business_name: string }[]).map((d) => [d.id, d.business_name]));
}
