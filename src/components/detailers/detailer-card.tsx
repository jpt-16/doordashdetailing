import Link from "next/link";
import { brand } from "@config/brand";
import type { Detailer } from "@/types/db";
import { fromPrice, listingFor, type VehicleSize } from "@/lib/sample-data";
import { PhotoCarousel } from "@/components/detailers/photo-carousel";

export function DetailerCard({
  detailer,
  photos,
  query,
  size,
  index,
}: {
  detailer: Detailer;
  photos?: string[];
  query: string;
  size: VehicleSize;
  index: number;
}) {
  const l = listingFor(detailer.slug);
  const price = fromPrice(detailer.slug, size);
  return (
    <li className="rise-in" style={{ ["--i" as string]: index }}>
      <Link href={`/d/${detailer.slug}${query ? `?${query}` : ""}`} className="press group block transition-transform duration-150 ease-out active:scale-[0.99]">
        <PhotoCarousel name={detailer.business_name} photos={photos} dots className="aspect-[4/3] rounded-card" />
        <div className="mt-3 flex items-start justify-between gap-3">
          <p className="min-w-0 truncate text-base font-semibold">{detailer.business_name}</p>
          <p className="flex flex-none items-center gap-1 text-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="m12 2.500 2.900 6 6.600.9-4.800 4.600 1.200 6.500L12 17.400 6.100 20.500l1.200-6.500L2.500 9.400l6.600-.9z" />
            </svg>
            {l.rating.toFixed(1)} <span className="text-muted">({l.reviews.length})</span>
          </p>
        </div>
        <p className="text-sm text-muted">
          Mobile detailer in {detailer.town}
          {detailer.verified ? " · Verified" : ""}
        </p>
        <p className="text-sm text-muted">{l.instant ? "Instant book" : "Request to book"} · {brand.depositPercent}% deposit</p>
        <p className="mt-1 text-base">
          <span className="font-semibold underline underline-offset-2">From ${price}</span>
        </p>
      </Link>
    </li>
  );
}
