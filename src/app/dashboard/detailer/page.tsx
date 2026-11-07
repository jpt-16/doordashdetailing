import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Icon, type IconName } from "@/components/ui/icons";
import { Band, Section } from "@/components/ui/section";
import { PhotoManager } from "@/components/photos/photo-manager";
import { AvailabilityForm, ProfileForm, ServicesManager } from "@/components/setup/setup-forms";
import { BookingRow, DetailerActions } from "@/components/bookings/booking-parts";
import { photoUrl } from "@/lib/photos";
import { ACTIVE } from "@/lib/bookings";
import type { Booking, Detailer, ServiceRow } from "@/types/db";

const status = {
  approved: { tone: "green", label: "Approved", icon: "shield", text: "You’re approved. You show up to customers once you have a service and open times." },
  rejected: { tone: "red", label: "Not approved", icon: "x", text: "Your application wasn’t approved. Contact support for details." },
  pending: {
    tone: "amber",
    label: "Pending approval",
    icon: "clock",
    text: "We’re reviewing your application. Set up your profile while you wait, and you’ll go live once approved.",
  },
} as const;

export default async function DetailerDashboard() {
  const profile = await requireRole("detailer");
  const supabase = await createClient();
  const { data } = await supabase.from("detailers").select("*").eq("user_id", profile.id).single();
  const detailer = data as Detailer | null;

  if (!detailer) {
    return (
      <div className="mx-auto max-w-xl py-10">
        <h1 className="text-[26px] font-semibold tracking-tight">We could not find your business profile</h1>
        <p className="mt-2 text-base text-muted">Contact support and we will fix it.</p>
      </div>
    );
  }

  const [photoRes, svcRes, avRes, jobRes] = await Promise.all([
    supabase.from("detailer_photos").select("id, path").eq("detailer_id", detailer.id).order("position").order("created_at"),
    supabase.from("services").select("*").eq("detailer_id", detailer.id).order("created_at"),
    supabase.from("availability").select("weekday, win").eq("detailer_id", detailer.id),
    supabase.from("bookings").select("*").eq("detailer_id", detailer.id).order("day").limit(60),
  ]);
  const photos = ((photoRes.data ?? []) as { id: string; path: string }[]).map((r) => ({ id: r.id, url: photoUrl(r.path) }));
  const services = (svcRes.data ?? []) as ServiceRow[];
  const open = ((avRes.data ?? []) as { weekday: number; win: string }[]).map((r) => `${r.weekday}:${r.win}`);
  const jobs = (jobRes.data ?? []) as Booking[];
  const activeJobs = jobs.filter((j) => ACTIVE.includes(j.status));
  const completed = jobs.filter((j) => j.status === "completed").length;
  const s = status[detailer.status];

  const checklist: [string, boolean, string][] = [
    ["Add your business details", !!detailer.business_name && !!detailer.town && !!detailer.bio, "#profile"],
    ["List at least one live service", services.some((x) => x.active), "#services"],
    ["Choose when you work", open.length > 0, "#availability"],
    ["Add photos of your work", photos.length > 0, "#photos"],
    ["Get approved by DetailDash", detailer.status === "approved", "#top"],
  ];
  const ready = checklist.every(([, done]) => done);
  const name = detailer.business_name || profile.full_name;

  const stats: [string, string][] = [
    ["Jobs", String(completed)],
    ["Rating", "–"],
    ["Years", "–"],
  ];

  return (
    <div className="-mx-6" id="top">
      <div className="px-6 pt-1">
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
              {detailer.verified && <Badge tone="neutral">Verified</Badge>}
            </div>
            {detailer.status === "approved" && (
              <Link href={`/d/${detailer.slug}`} className="link mt-3 text-sm">
                View your public page
              </Link>
            )}
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
          <Icon name={s.icon as IconName} size={24} />
          <p className="text-base">{s.text}</p>
        </div>

        {!ready && (
          <ul className="mt-4 divide-y divide-line rounded-card border border-line">
            {checklist.map(([label, done, href]) => (
              <li key={label}>
                <a href={href} className="press flex min-h-14 items-center gap-3 px-5 text-base transition-colors duration-150 hover:bg-band">
                  <span className={`grid h-6 w-6 flex-none place-items-center rounded-full border-2 ${done ? "border-ink bg-ink text-white" : "border-field"}`}>
                    {done && <Icon name="check" size={14} />}
                  </span>
                  <span className={done ? "text-muted line-through" : "font-semibold"}>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <Band />
      </div>
      <div className="px-6">
        <Section title="Jobs">
          {activeJobs.length === 0 ? (
            <div className="rounded-card border border-line p-6">
              <p className="text-base font-semibold">No jobs yet</p>
              <p className="mt-1 text-sm text-muted">Booked jobs show up here with the day, arrival window and price.</p>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {activeJobs.map((j) => (
                <div key={j.id} className="py-1">
                  <BookingRow b={j} title={j.service_name} sub={`${j.vehicle === "suv" ? "SUV" : j.vehicle} · ${j.address}`} />
                  <div className="pb-3">
                    <DetailerActions b={j} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <Band />
      <div className="px-6" id="services">
        <Section title="Services">
          <ServicesManager services={services} />
        </Section>
      </div>

      <Band />
      <div className="px-6" id="availability">
        <Section title="Availability and booking">
          <AvailabilityForm open={open} instantBook={detailer.instant_book} jobsPerWindow={detailer.jobs_per_window} />
        </Section>
      </div>

      <Band />
      <div className="px-6" id="profile">
        <Section title="Business profile">
          <ProfileForm detailer={detailer} />
        </Section>
      </div>

      <Band />
      <div className="px-6" id="photos">
        <Section title="Photos">
          <PhotoManager photos={photos} />
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
