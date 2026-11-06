import Link from "next/link";
import { brand } from "@config/brand";

export default function Home() {
  return (
    <section className="py-10 text-center">
      <h1 className="text-3xl font-bold sm:text-4xl">{brand.tagline}</h1>
      <p className="mx-auto mt-3 max-w-md text-slate-600">
        Book a vetted mobile detailer, pay a deposit, and rebook your favorite any time.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/signup" className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white">
          Book a detail
        </Link>
        <Link href="/signup?role=detailer" className="rounded-lg bg-white px-5 py-3 font-semibold ring-1 ring-slate-300">
          I’m a detailer
        </Link>
      </div>
    </section>
  );
}
