import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";
import { Band, Section } from "@/components/ui/section";
import { DetailerJobPreview } from "@/components/dashboard/sample-preview";
import { PhotoManager } from "@/components/photos/photo-manager";
import { photoUrl } from "@/lib/photos";
import type { Detailer } from "@/types/db";

const status = {
  approved: { tone: "green", label: "Approved", icon: "shield", text: "You’re live. Customers can find you once your services are set up." },
  rejected: { tone: "red", label: "Not approved", icon: "x", text: "Your application wasn’t approved. Contact support for details." },
  pending: {
    tone: "amber",
    label: "Pending approval",
    icon: "clock",
    text: "We’re reviewing your application. You can set up your profile while you wait, and you’ll go live once approved.",
  },
} as const;

export default async function DetailerDashboard({ searchParams }: { searchParams: Promise<{ sample?: string }> }) {
  const profile = await requireRole("detailer");
  const { sample } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("detailers").select("*").eq("user_id", profile.id).single();
  const detailer = data as Detailer | null;
  const { data: photoRows } = detailer
    ? await supabase.from("detailer_photos").select("id, path").eq("detailer_id", detailer.id).order("position").order("created_at")
    : { data: [] };
  const photos = ((photoRows ?? []) as { id: string; path: string }[]).map((r) => ({ id: r.id, url: photoUrl(r.path) }));
  const s = status[detailer?.status ?? "pending"];
  const showSample = sample === "1" && process.env.NODE_ENV !== "production";
  const name = detailer?.business_name || profile.full_name;

  const stats: [string, string][] = [
    ["Jobs", "0"],
    ["Rating", "–"],
    ["Years", "–"],
  ];

  return (
    <div className="-mx-6">
      <div className="px-6 pt-1">
        {/* Profile header card: identity on the left, stats stacked on the right. */}
        <div className="flex items-stretch gap-6 rounded-card p-6 shadow-card ring-1 ring-line">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-ink text-2xl font-semibold text-white">
              {name
                .split(/\s+/)
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
            <h1 className="mt-3 text-[22px] font-semibold leading-tight tracking-tight">{name}</h1>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              <Badge tone={s.tone}>{s.label}</Badge>
              {detailer?.verified && <Badge tone="neutral">Verified</Badge>}
            </div>
          </div>
          <dl className="w-24 flex-none divide-y divide-line self-center">
            {stats.map(([k, v]) => (
              <div key={k} className="py-2">
                <dd className="text-xl font-semibold leading-tight">{v}</dd>
                <dt className="text-xs font-medium text-muted">{k}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-4 flex gap-4 rounded-card bg-band p-5">
          <Icon name={s.icon} size={24} />
          <p className="text-base">{s.text}</p>
        </div>
      </div>

      <div className="mt-6">
        <Band />
      </div>
      {detailer && (
        <>
          <div className="px-6">
            <Section title="Photos">
              <PhotoManager photos={photos} />
            </Section>
          </div>
          <Band />
        </>
      )}
      <div className="px-6">
        <Section title="Upcoming jobs">
          {showSample ? (
            <DetailerJobPreview />
          ) : (
            <div className="rounded-card border border-line p-6">
              <p className="text-base font-semibold">No jobs yet</p>
              <p className="mt-1 text-sm text-muted">Booked jobs show up here with the day, arrival window and payout.</p>
            </div>
          )}
        </Section>
      </div>
      <Band />
      <div className="px-6">
        <Section title="Reviews">
          <p className="text-base text-muted">Reviews from customers will appear here after your first completed job.</p>
        </Section>
      </div>
    </div>
  );
}
