import { createClient } from "@/lib/supabase/server";
import { SAMPLE_DETAILERS } from "@/lib/sample-data";
import type { Detailer } from "@/types/db";

// Outside production, an empty marketplace falls back to sample detailers so the screens can be reviewed.
const showSamples = process.env.NODE_ENV !== "production";

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
