import Link from "next/link";
import { ListingArt } from "@/components/detailers/listing-art";
import { Band, Hairline, IconRow, LabelRow, Section } from "@/components/ui/section";
import { Icon } from "@/components/ui/icons";

/** Preview of the trip-details layout with placeholder data. Only reachable outside production via ?sample=1. */
export function CustomerTripPreview() {
  return (
    <div className="-mx-6">
      <div className="px-6">
        <p className="mb-3 inline-block rounded-btn bg-band px-3 py-1.5 text-xs text-muted">Sample booking, for layout review</p>
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight">Your detail with Bay State Mobile Detail</h1>
        <div className="mt-5 aspect-[16/10] overflow-hidden rounded-card">
          <ListingArt slug="bay-state-mobile-detail" />
        </div>
        <div className="mt-5 grid grid-cols-2 pb-5">
          <div className="pr-4">
            <p className="text-base font-semibold">Arrival window</p>
            <p className="text-muted">Sat, Nov 7</p>
            <p className="text-muted">9:00 to 12:00</p>
          </div>
          <div className="border-l border-line pl-4">
            <p className="text-base font-semibold">Finish by</p>
            <p className="text-muted">Sat, Nov 7</p>
            <p className="text-muted">1:30 PM</p>
          </div>
        </div>
        <Hairline />
        <IconRow icon="chat" title="Message your detailer">Bay State Mobile Detail</IconRow>
        <IconRow icon="pin" title="Your address">14 Edgell Rd, Framingham, MA</IconRow>
      </div>
      <Band />
      <div className="px-6">
        <Section title="Booking details">
          <div className="divide-y divide-line">
            <LabelRow label="Vehicle">2021 Subaru Outback · SUV</LabelRow>
            <LabelRow label="Service">Premium exterior</LabelRow>
            <LabelRow label="Confirmation code">DD2041K7</LabelRow>
            <LabelRow label="Cancellation policy">Free cancellation until 9:00 AM on Nov 6.</LabelRow>
          </div>
        </Section>
      </div>
      <Band />
      <div className="px-6">
        <Section title="Payment info">
          <LabelRow label="Total cost">$98.00 USD</LabelRow>
          <Hairline />
          <LabelRow label="Deposit paid">$24.50 USD</LabelRow>
          <Hairline />
          <div className="flex items-center justify-between py-4 text-base">
            <span className="flex items-center gap-3"><Icon name="receipt" size={22} /> Get receipt</span>
            <Icon name="chevR" size={18} />
          </div>
        </Section>
      </div>
      <Band />
      <div className="px-6">
        <Section title="Get support anytime">
          <p className="text-base text-muted">Questions about a booking? Message support and a person will reply.</p>
        </Section>
      </div>
    </div>
  );
}

export function DetailerJobPreview() {
  return (
    <div>
      <p className="mb-3 inline-block rounded-btn bg-band px-3 py-1.5 text-xs text-muted">Sample jobs, for layout review</p>
      <div className="divide-y divide-line rounded-card border border-line">
        {[
          ["Sat, Nov 7 · 9:00 to 12:00", "Full detail", "Maya P. · Natick", "$245"],
          ["Sat, Nov 7 · 1:00 to 4:00", "Premium exterior", "Alex K. · Framingham", "$98"],
        ].map(([when, svc, who, price]) => (
          <div key={when} className="p-5">
            <p className="text-base font-semibold">{when}</p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <div>
                <p className="text-base">{svc}</p>
                <p className="text-sm text-muted">{who}</p>
              </div>
              <p className="text-base font-semibold">{price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SampleLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="link text-sm">
      {children}
    </Link>
  );
}
