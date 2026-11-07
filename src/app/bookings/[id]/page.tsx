import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { brand } from "@config/brand";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, homeFor } from "@/lib/auth";
import { Band, Hairline, IconRow, LabelRow, Section } from "@/components/ui/section";
import { Icon } from "@/components/ui/icons";
import { CancelButton, DetailerActions, StatusBadge } from "@/components/bookings/booking-parts";
import { WINDOW_LABEL, dollars, prettyDay } from "@/lib/bookings";
import type { Booking } from "@/types/db";

export const metadata: Metadata = { title: "Booking" };

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(`/bookings/${id}`)}`);

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  // Row-level security only returns this booking to the customer, the detailer, or an admin.
  const { data } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const b = data as Booking;
  const { data: det } = await supabase.from("detailers").select("business_name, town, slug").eq("id", b.detailer_id).maybeSingle();
  const detailer = det as { business_name: string; town: string; slug: string } | null;

  const asCustomer = b.customer_id === profile.id;
  const asDetailer = profile.role === "detailer";
  const canCancel = (b.status === "requested" || b.status === "confirmed") && (asCustomer || asDetailer);
  const size = b.vehicle === "suv" ? "SUV" : b.vehicle[0].toUpperCase() + b.vehicle.slice(1);

  return (
    <div className="mx-auto max-w-2xl pb-10"><div className="-mx-6 sm:mx-0">
      <div className="px-6">
        <Link href={homeFor(profile.role)} className="link press inline-flex items-center gap-1 text-sm transition-transform duration-150 ease-out active:scale-[0.97]">
          <Icon name="chevL" size={16} /> Dashboard
        </Link>
        <div className="mt-4 flex items-start justify-between gap-3">
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            {asCustomer ? `Your detail with ${detailer?.business_name ?? "your detailer"}` : b.service_name}
          </h1>
          <StatusBadge status={b.status} />
        </div>
        {b.status === "requested" && asCustomer && (
          <p className="mt-3 rounded-btn bg-band p-4 text-sm">The detailer has not confirmed yet. You will see the status change here.</p>
        )}

        <div className="mt-6 grid grid-cols-2 pb-5">
          <div className="pr-4">
            <p className="text-base font-semibold">Date</p>
            <p className="text-muted">{prettyDay(b.day, { weekday: "short", month: "short", day: "numeric" })}</p>
          </div>
          <div className="border-l border-line pl-4">
            <p className="text-base font-semibold">Arrival window</p>
            <p className="text-muted">{WINDOW_LABEL[b.win]}</p>
          </div>
        </div>
        <Hairline />
        <IconRow icon="pin" title="Address">{b.address}</IconRow>
        {b.note && <IconRow icon="chat" title="Note">{b.note}</IconRow>}

        {asDetailer && (
          <div className="py-4">
            <DetailerActions b={b} size="lg" />
          </div>
        )}
      </div>

      <Band />
      <div className="px-6">
        <Section title="Booking details">
          <div className="divide-y divide-line">
            <LabelRow label="Service">{b.service_name}</LabelRow>
            <LabelRow label="Vehicle">{size}</LabelRow>
            <LabelRow label="Confirmation code">{b.code}</LabelRow>
            <LabelRow label="Cancellation policy">Free cancellation up to 24 hours before your arrival window.</LabelRow>
          </div>
        </Section>
      </div>

      <Band />
      <div className="px-6">
        <Section title="Payment info">
          <div className="divide-y divide-line">
            <LabelRow label="Total cost">{dollars(b.price_cents)} USD</LabelRow>
            <LabelRow label={`Deposit (${brand.depositPercent}%)`}>
              {dollars(b.deposit_cents)} USD · {b.deposit_paid ? "Paid" : "Not charged yet"}
            </LabelRow>
            <LabelRow label="After the job">{dollars(b.price_cents - b.deposit_cents)} USD</LabelRow>
          </div>
          {!b.deposit_paid && <p className="mt-3 text-sm text-muted">Card payments arrive in the next build step. Nothing has been charged.</p>}
        </Section>
      </div>

      <Band />
      <div className="px-6">
        <Section title="Get support anytime">
          <p className="text-base text-muted">Questions about this booking? Email {brand.supportEmail}.</p>
        </Section>
        {canCancel && <CancelButton id={b.id} />}
      </div>
    </div></div>
  );
}
