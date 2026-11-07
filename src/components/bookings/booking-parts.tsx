import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { advanceBooking, cancelBooking, respondBooking } from "@/app/actions/bookings";
import { STATUS_LABEL, STATUS_TONE, WINDOW_LABEL, dollars, prettyDay } from "@/lib/bookings";
import type { Booking } from "@/types/db";

export function StatusBadge({ status }: { status: Booking["status"] }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}

/** One booking as a tappable row. `title` is the detailer's name for customers, the service for detailers. */
export function BookingRow({ b, title, sub }: { b: Booking; title: string; sub?: string }) {
  return (
    <Link
      href={`/bookings/${b.id}`}
      className="press flex items-center gap-4 py-4 transition-transform duration-150 ease-out active:scale-[0.99]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold">{title}</p>
        <p className="truncate text-sm text-muted">{sub ?? b.service_name}</p>
        <p className="text-sm text-muted">
          {prettyDay(b.day, { weekday: "short", month: "short", day: "numeric" })} · {WINDOW_LABEL[b.win]}
        </p>
      </div>
      <div className="flex flex-none flex-col items-end gap-1">
        <StatusBadge status={b.status} />
        <span className="text-sm font-semibold">{dollars(b.price_cents)}</span>
      </div>
      <Icon name="chevR" size={18} className="text-muted" />
    </Link>
  );
}

const NEXT_LABEL: Record<string, string> = {
  confirmed: "I am on my way",
  en_route: "Start the job",
  in_progress: "Mark complete",
};

/** Buttons a detailer can use on a job. */
export function DetailerActions({ b, size = "md" }: { b: Booking; size?: "md" | "lg" }) {
  if (b.status === "requested") {
    return (
      <div className="flex gap-2">
        <form action={respondBooking}>
          <input type="hidden" name="id" value={b.id} />
          <input type="hidden" name="accept" value="false" />
          <Button type="submit" variant="outline" size={size}>
            Decline
          </Button>
        </form>
        <form action={respondBooking}>
          <input type="hidden" name="id" value={b.id} />
          <input type="hidden" name="accept" value="true" />
          <Button type="submit" variant="dark" size={size}>
            Accept
          </Button>
        </form>
      </div>
    );
  }
  if (NEXT_LABEL[b.status]) {
    return (
      <form action={advanceBooking}>
        <input type="hidden" name="id" value={b.id} />
        <Button type="submit" variant="dark" size={size}>
          {NEXT_LABEL[b.status]}
        </Button>
      </form>
    );
  }
  return null;
}

export function CancelButton({ id }: { id: string }) {
  return (
    <form action={cancelBooking}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="danger" size="lg" className="w-full">
        Cancel booking
      </Button>
    </form>
  );
}
