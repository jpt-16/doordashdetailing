import Link from "next/link";
import { brand } from "@config/brand";
import { getCurrentProfile, homeFor } from "@/lib/auth";
import { SearchFlow } from "@/components/home/search-flow";
import { buttonClass } from "@/components/ui/button";

const steps = [
  {
    title: "Pick a time",
    body: "Choose your address, a day and an arrival window. Instant booking or a request, depending on the detailer.",
    icon: "M8 3v4M16 3v4M3.5 10h17M5 5h14a1.500 1.500 0 0 1 1.500 1.500v12A1.500 1.500 0 0 1 19 20H5a1.500 1.500 0 0 1-1.500-1.500v-12A1.500 1.500 0 0 1 5 5z",
  },
  {
    title: `Pay ${brand.depositPercent}% to hold it`,
    body: "The deposit holds your slot. The rest is charged after the job is done.",
    icon: "M3 7.500A2.500 2.500 0 0 1 5.500 5h13A2.500 2.500 0 0 1 21 7.500v9a2.500 2.500 0 0 1-2.500 2.500h-13A2.500 2.500 0 0 1 3 16.500zM3 10h18",
  },
  {
    title: "They come to you",
    body: "A vetted detailer arrives with water and power. Rebook your favorite in one tap.",
    icon: "M12 3 5 6v5c0 4.500 3 8 7 10 4-2 7-5.500 7-10V6zM9 12l2 2 4-4",
  },
];

export default async function Home() {
  const profile = await getCurrentProfile();
  const searchHref = profile ? homeFor(profile.role) : "/signup";
  return (
    <div className="-mx-6">
      <section className="px-6 pb-12 pt-8 sm:pt-14">
        <h1 className="max-w-2xl text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-5xl">{brand.tagline}</h1>
        <p className="mt-3 max-w-md text-base text-muted">
          Book a vetted mobile detailer in {brand.launchArea}. Pay a deposit, and rebook your favorite any time.
        </p>
        <div className="mt-8">
          <SearchFlow
            defaultWhere={profile?.saved_address ?? ""}
            defaultVehicle={profile?.saved_vehicle_size ?? null}
            searchHref={searchHref}
          />
        </div>
      </section>

      <div className="h-2 bg-band" />

      <section className="px-6 py-10">
        <h2 className="text-[22px] font-semibold tracking-tight">How it works</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rise-in flex gap-4" style={{ ["--i" as string]: i }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-none" aria-hidden="true">
                <path d={s.icon} />
              </svg>
              <div>
                <p className="text-base font-semibold">{s.title}</p>
                <p className="mt-1 text-sm text-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="h-2 bg-band" />

      <section className="px-6 py-10">
        <h2 className="text-[22px] font-semibold tracking-tight">Detail cars for a living?</h2>
        <p className="mt-2 max-w-md text-base text-muted">
          Join {brand.name} to get booked by neighbors. You set your services, hours and service area.
        </p>
        <Link href="/signup?role=detailer" className={buttonClass("outline", "lg", "mt-5")}>
          I’m a detailer
        </Link>
      </section>
    </div>
  );
}
