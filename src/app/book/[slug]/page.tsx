import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brand } from "@config/brand";
import { getDetailerBySlug, getPhotoUrls } from "@/lib/detailers";
import { getCurrentProfile } from "@/lib/auth";
import { listingFor, type VehicleSize } from "@/lib/sample-data";
import { BookingForm } from "@/components/booking/booking-form";
import { Icon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Request to book" };

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

export default async function BookPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const found = await getDetailerBySlug(slug);
  if (!found) notFound();
  const { detailer } = found;
  const profile = await getCurrentProfile();
  const photo = (await getPhotoUrls([detailer.id]))[detailer.id]?.[0];
  const l = listingFor(detailer.slug);
  const size: VehicleSize =
    sp.vehicle === "suv" || sp.vehicle === "truck" || sp.vehicle === "sedan" ? sp.vehicle : (profile?.saved_vehicle_size ?? "sedan");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-3 pb-6 pt-1">
        <Link
          href={`/d/${slug}`}
          aria-label="Back"
          className="press grid h-9 w-9 place-items-center rounded-full transition-[transform,background-color] duration-150 ease-out hover:bg-band active:scale-[0.97]"
        >
          <Icon name="chevL" size={22} />
        </Link>
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight">{l.instant ? "Confirm and pay" : "Request to book"}</h1>
      </div>
      <BookingForm
        name={detailer.business_name}
        photo={photo}
        rating={l.rating}
        reviewCount={l.reviews.length}
        instant={l.instant}
        services={l.services}
        factor={l.factor}
        initial={{
          service: sp.service ?? l.services[0].id,
          date: sp.date ?? "",
          window: sp.window ?? "morning",
          vehicle: size,
          where: sp.where ?? profile?.saved_address ?? "",
        }}
        signedIn={!!profile}
        depositPercent={brand.depositPercent}
      />
    </div>
  );
}
