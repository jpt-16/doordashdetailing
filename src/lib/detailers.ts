import { createClient } from "@/lib/supabase/server";
import { SAMPLE_DETAILERS, listingFor, type Listing, type Service } from "@/lib/sample-data";
import { photoUrl } from "@/lib/photos";
import type { Detailer, ServiceRow } from "@/types/db";

// Outside production, an empty marketplace falls back to sample detailers so the screens can be reviewed.
const showSamples = process.env.NODE_ENV !== "production";
const isReal = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

export async function getApprovedDetailers(): Promise<{ detailers: Detailer[]; sample: boolean }> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("detailers").select("*").eq("status", "approved").order("created_at");
    const rows = (data ?? []) as Detailer[];
    if (rows.length) return { detailers: rows, sample: false };
  } catch {
    // fall through to samples in development
  }
  return showSamples ? { detailers: SAMPLE_DETAILERS, sample: true } : { detailers: [], sample: false };
}

export async function getDetailerBySlug(slug: string): Promise<{ detailer: Detailer; sample: boolean } | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("detailers").select("*").eq("slug", slug).eq("status", "approved").maybeSingle();
    if (data) return { detailer: data as Detailer, sample: false };
  } catch {
    // fall through
  }
  const s = showSamples ? SAMPLE_DETAILERS.find((d) => d.slug === slug) : undefined;
  return s ? { detailer: s, sample: true } : null;
}

/** Photo URLs per detailer id, in display order. Returns {} if there are none or the table is not set up yet. */
export async function getPhotoUrls(detailerIds: string[]): Promise<Record<string, string[]>> {
  const ids = detailerIds.filter(isReal); // sample detailers have no photos
  if (ids.length === 0) return {};
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("detailer_photos")
      .select("detailer_id, path")
      .in("detailer_id", ids)
      .order("position")
      .order("created_at");
    const out: Record<string, string[]> = {};
    for (const row of (data ?? []) as { detailer_id: string; path: string }[]) {
      (out[row.detailer_id] ??= []).push(photoUrl(row.path));
    }
    return out;
  } catch {
    return {};
  }
}

export function toService(r: ServiceRow): Service {
  return {
    id: r.id,
    name: r.name,
    blurb: r.description,
    mins: r.minutes,
    base: r.price_sedan_cents / 100,
    cat: r.category,
    prices: { sedan: r.price_sedan_cents / 100, suv: r.price_suv_cents / 100, truck: r.price_truck_cents / 100 },
  };
}

/** Listings for a set of detailers: real ones from the database, samples from placeholder data. */
export async function getListings(detailers: Detailer[]): Promise<Record<string, Listing>> {
  const out: Record<string, Listing> = {};
  const real = detailers.filter((d) => isReal(d.id));
  for (const d of detailers) if (!isReal(d.id)) out[d.id] = listingFor(d.slug);
  if (real.length === 0) return out;

  const ids = real.map((d) => d.id);
  let services: ServiceRow[] = [];
  let open = new Set<string>();
  try {
    const supabase = await createClient();
    const [s, a] = await Promise.all([
      supabase.from("services").select("*").in("detailer_id", ids).eq("active", true).order("created_at"),
      supabase.from("availability").select("detailer_id").in("detailer_id", ids),
    ]);
    services = (s.data ?? []) as ServiceRow[];
    open = new Set(((a.data ?? []) as { detailer_id: string }[]).map((r) => r.detailer_id));
  } catch {
    // leave empty
  }
  for (const d of real) {
    out[d.id] = {
      rating: null,
      reviews: [],
      years: null,
      replyHours: null,
      factor: 1,
      instant: d.instant_book,
      services: services.filter((r) => r.detailer_id === d.id).map(toService),
      bookable: open.has(d.id),
      sample: false,
    };
  }
  return out;
}

export async function getListing(d: Detailer): Promise<Listing> {
  return (await getListings([d]))[d.id];
}
