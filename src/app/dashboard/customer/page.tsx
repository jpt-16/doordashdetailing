import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { buttonClass } from "@/components/ui/button";
import { CustomerTripPreview } from "@/components/dashboard/sample-preview";

export default async function CustomerDashboard({ searchParams }: { searchParams: Promise<{ sample?: string }> }) {
  const profile = await requireRole("customer");
  const { sample } = await searchParams;

  // Bookings do not exist yet (they arrive with the booking step), so there is nothing real to list.
  if (sample === "1" && process.env.NODE_ENV !== "production") return <CustomerTripPreview />;

  return (
    <div className="mx-auto max-w-xl py-6 sm:py-12">
      <p className="text-sm text-muted">Hi, {profile.full_name}</p>
      <h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight">No details booked yet</h1>
      <p className="mt-3 text-base text-muted">
        When you book a detailer, your arrival window, address and receipt will be right here.
      </p>
      <Link href="/" className={buttonClass("primary", "lg", "mt-8")}>
        Book a detail
      </Link>
    </div>
  );
}
