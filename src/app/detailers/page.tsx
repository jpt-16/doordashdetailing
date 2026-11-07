import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { getApprovedDetailers } from "@/lib/detailers";
import { fromPrice, listingFor, SERVICES, type VehicleSize } from "@/lib/sample-data";
import { CategoryTabs } from "@/components/detailers/category-tabs";
import { FiltersButton } from "@/components/detailers/filters-sheet";
import { DetailerCard } from "@/components/detailers/detailer-card";
import { Icon } from "@/components/ui/icons";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { title: "Find a detailer" };

type SP = Record<string, string | undefined>;

export default async function DetailersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const size: VehicleSize = sp.vehicle === "suv" || sp.vehicle === "truck" ? sp.vehicle : "sedan";
  const service = sp.service ?? "all";
  const min = sp.min ? Number(sp.min) : 0;
  const max = sp.max ? Number(sp.max) : Infinity;

  const { detailers, sample } = await getApprovedDetailers();
  const results = detailers
    .filter((d) => {
      const l = listingFor(d.slug);
      const p = fromPrice(d.slug, size);
      if (service !== "all" && !l.services.some((s) => s.cat === service)) return false;
      if (sp.type === "instant" && !l.instant) return false;
      if (sp.type === "request" && l.instant) return false;
      return p >= min && p <= max;
    })
    .sort((a, b) => listingFor(b.slug).rating - listingFor(a.slug).rating);

  // Carry the search through to the profile and booking pages.
  const carry = new URLSearchParams();
  for (const k of ["where", "date", "when", "window", "vehicle"]) if (sp[k]) carry.set(k, sp[k]!);
  const query = carry.toString();

  const where = sp.where || "Anywhere nearby";
  const when = sp.date ? format(new Date(sp.date + "T00:00"), "EEE, MMM d") : sp.when === "this-week" ? "This week" : "Any day";
  const veh = sp.vehicle ? (sp.vehicle === "suv" ? "SUV" : sp.vehicle[0].toUpperCase() + sp.vehicle.slice(1)) : "Any vehicle";

  return (
    <div className="space-y-5 pb-10">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="press flex min-w-0 flex-1 items-center gap-3 rounded-full border border-line py-2.5 pl-4 pr-5 text-left shadow-pill transition-transform duration-150 ease-out active:scale-[0.98]"
        >
          <Icon name="search" size={18} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{where}</span>
            <span className="block truncate text-xs text-muted">
              {when} · {veh}
            </span>
          </span>
        </Link>
        <FiltersButton />
      </div>

      <CategoryTabs active={service} />

      {sample && (
        <p className="rounded-btn bg-band px-4 py-3 text-sm text-muted">
          Sample detailers are shown because none are approved yet. In production this list only shows approved detailers.
        </p>
      )}

      <p className="text-sm text-muted">
        {results.length} {results.length === 1 ? "detailer" : "detailers"} · {SERVICES.length} services across the area
      </p>

      {results.length > 0 ? (
        <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((d, i) => (
            <DetailerCard key={d.id} detailer={d} query={query} size={size} index={i} />
          ))}
        </ul>
      ) : (
        <div className="py-16 text-center">
          <h2 className="text-[22px] font-semibold tracking-tight">No detailers match yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-base text-muted">Try another service type or widen the price range.</p>
          <Link href="/detailers" className={buttonClass("dark", "lg", "mt-6")}>
            Clear filters
          </Link>
        </div>
      )}
    </div>
  );
}
