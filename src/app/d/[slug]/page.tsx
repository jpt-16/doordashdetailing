import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getDetailerBySlug } from "@/lib/detailers";
import { DEFAULT_BIO, listingFor, servicePrice, type VehicleSize } from "@/lib/sample-data";
import { PhotoCarousel } from "@/components/detailers/photo-carousel";
import { ReviewsBlock, ServicesList, ShowMore } from "@/components/profile/profile-parts";
import { Hairline, IconRow, Section, StatStrip, StickyFooter } from "@/components/ui/section";
import { Icon, Stars } from "@/components/ui/icons";
import { buttonClass } from "@/components/ui/button";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await getDetailerBySlug(slug);
  return { title: found?.detailer.business_name ?? "Detailer" };
}

export default async function DetailerProfile({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const found = await getDetailerBySlug(slug);
  if (!found) notFound();
  const { detailer: d } = found;

  const l = listingFor(d.slug);
  const size: VehicleSize = sp.vehicle === "suv" || sp.vehicle === "truck" ? sp.vehicle : "sedan";
  const lead = l.services.find((s) => s.id === "premium") ?? l.services[0];
  const price = servicePrice(lead.base, size, l.factor);

  const carry = new URLSearchParams();
  for (const k of ["where", "date", "when", "window", "vehicle"]) if (sp[k]) carry.set(k, sp[k]!);
  carry.set("service", lead.id);
  const dateLabel = sp.date ? format(new Date(sp.date + "T00:00"), "EEE, MMM d") : "Pick a day at checkout";

  return (
    <div className="-mx-6 pb-32 sm:mx-0">
      <div className="px-6 pb-3 pt-1 sm:px-0">
        <Link href="/detailers" className="link press inline-flex items-center gap-1 text-sm transition-transform duration-150 ease-out active:scale-[0.97]">
          <Icon name="chevL" size={16} /> All detailers
        </Link>
      </div>

      <PhotoCarousel slug={d.slug} count={l.photos} pill className="aspect-[4/3] sm:rounded-card md:aspect-[16/7]" />

      <div className="px-6 sm:px-0">
        <div className="pt-6">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight">{d.business_name}</h1>
          <p className="mt-2 text-base">Mobile detailer in {d.town}, MA</p>
          <p className="text-sm text-muted">Sedans · SUVs · Trucks · {l.years} {l.years === 1 ? "year" : "years"} on the road</p>
        </div>

        <div className="mt-5">
          <StatStrip
            cells={[
              <p key="r" className="text-xl font-semibold">{l.rating.toFixed(1)}</p>,
              <p key="b" className="text-base font-semibold leading-tight">{d.verified ? "Verified detailer" : "New detailer"}</p>,
              <p key="c" className="text-xl font-semibold">{l.reviews.length}</p>,
            ].map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                {c}
                {i === 0 && <span className="text-ink"><Stars n={l.rating} size={10} /></span>}
                {i === 1 && <span className="text-xs text-muted">{d.verified ? "Approved and checked" : "Recently joined"}</span>}
                {i === 2 && <a href="#reviews" className="text-xs font-semibold underline underline-offset-2">Reviews</a>}
              </div>
            ))}
          />
        </div>

        <div className="mt-4">
          {d.verified && <IconRow icon="shield" title="Verified and approved">Reviewed by a person before taking jobs.</IconRow>}
          <IconRow icon="plug" title="Brings water and power">Nothing needed from you but the car.</IconRow>
          <IconRow icon="chat" title={`Usually replies in ${l.replyHours} hr`}>Message them in the app after you book.</IconRow>
        </div>
        <Hairline />

        <Section>
          <ShowMore text={d.bio || DEFAULT_BIO} />
        </Section>
        <Hairline />

        <Section title="What’s included">
          <ServicesList services={l.services} size={size} factor={l.factor} />
        </Section>
        <Hairline />

        <Section title="Where they work">
          <p className="text-base">{d.town}, MA and nearby towns.</p>
          <p className="text-sm text-muted">Your exact address is only shared after the booking is confirmed.</p>
        </Section>
        <Hairline />

        <Section title={`${d.business_name} reviews`} className="scroll-mt-20" >
          <div id="reviews" />
          <ReviewsBlock reviews={l.reviews} business={d.business_name} />
        </Section>
        <p className="pb-4 text-xs text-muted">Photos, services and reviews are placeholders until detailers can add their own.</p>
      </div>

      <StickyFooter>
        <div>
          <p className="text-lg font-semibold">${price}</p>
          <p className="text-sm text-muted">{lead.name}</p>
          <p className="text-sm font-semibold underline underline-offset-2">{dateLabel}</p>
        </div>
        <Link href={`/book/${d.slug}?${carry.toString()}`} className={buttonClass("primary", "lg", "min-w-32")}>
          {l.instant ? "Book" : "Request"}
        </Link>
      </StickyFooter>
    </div>
  );
}
