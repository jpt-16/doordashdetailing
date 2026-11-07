"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { WINS } from "@/lib/bookings";

export type FormState = { ok?: boolean; error?: string } | undefined;

async function mine() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "detailer") return null;
  const supabase = await createClient();
  const { data } = await supabase.from("detailers").select("id").eq("user_id", profile.id).single();
  return data ? { supabase, id: (data as { id: string }).id } : null;
}

const first = (e: z.ZodError) => e.issues[0]?.message ?? "Check the details and try again.";

/* ---------- business profile ---------- */
const profileSchema = z.object({
  business_name: z.string().trim().min(2, "Enter your business name.").max(60),
  town: z.string().trim().max(40),
  zip: z.string().trim().regex(/^(\d{5})?$/, "Zip code should be 5 digits."),
  bio: z.string().trim().max(600, "Keep the description under 600 characters."),
});

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const own = await mine();
  if (!own) return { error: "Only detailers can edit a business profile." };
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: first(parsed.error) };
  const { error } = await own.supabase.from("detailers").update(parsed.data).eq("id", own.id);
  if (error) return { error: "Could not save. Try again." };
  revalidatePath("/dashboard/detailer");
  return { ok: true };
}

/* ---------- services ---------- */
const dollar = (label: string) =>
  z.coerce.number({ message: `Enter the ${label} price.` }).min(10, `${label} price must be at least $10.`).max(2000, `${label} price must be $2,000 or less.`);

const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Enter a service name.").max(80),
  description: z.string().trim().max(300, "Keep the description under 300 characters."),
  minutes: z.coerce.number({ message: "Enter the duration in minutes." }).int().min(15, "Duration must be at least 15 minutes.").max(720, "Duration must be 12 hours or less."),
  category: z.enum(["exterior", "interior", "full", "ceramic", "fleet"]),
  sedan: dollar("Sedan"),
  suv: dollar("SUV"),
  truck: dollar("Truck"),
  active: z.string().optional(),
});

export async function saveService(_prev: FormState, formData: FormData): Promise<FormState> {
  const own = await mine();
  if (!own) return { error: "Only detailers can edit services." };
  const raw = Object.fromEntries(formData) as Record<string, string>;
  if (!raw.id) delete raw.id;
  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) return { error: first(parsed.error) };
  const v = parsed.data;
  const row = {
    detailer_id: own.id,
    name: v.name,
    description: v.description,
    minutes: v.minutes,
    category: v.category,
    price_sedan_cents: Math.round(v.sedan * 100),
    price_suv_cents: Math.round(v.suv * 100),
    price_truck_cents: Math.round(v.truck * 100),
    active: v.active === "on",
  };
  if (v.id) {
    const { error } = await own.supabase.from("services").update(row).eq("id", v.id).eq("detailer_id", own.id);
    if (error) return { error: "Could not save. Try again." };
  } else {
    const { count } = await own.supabase.from("services").select("id", { count: "exact", head: true }).eq("detailer_id", own.id);
    if ((count ?? 0) >= 20) return { error: "You can list up to 20 services." };
    const { error } = await own.supabase.from("services").insert({ ...row, active: true });
    if (error) return { error: "Could not add the service. Try again." };
  }
  revalidatePath("/dashboard/detailer");
  return { ok: true };
}

export async function deleteService(formData: FormData): Promise<void> {
  const own = await mine();
  if (!own) throw new Error("Forbidden");
  const id = z.string().uuid().parse(formData.get("id"));
  // Past bookings keep their own copy of the service name, so deleting a service is safe.
  await own.supabase.from("services").delete().eq("id", id).eq("detailer_id", own.id);
  revalidatePath("/dashboard/detailer");
}

/* ---------- availability + booking settings ---------- */
export async function saveAvailability(_prev: FormState, formData: FormData): Promise<FormState> {
  const own = await mine();
  if (!own) return { error: "Only detailers can edit availability." };

  const jobs = z.coerce.number().int().min(1).max(4).safeParse(formData.get("jobs_per_window"));
  if (!jobs.success) return { error: "Choose how many jobs you can take per window." };

  const wanted = new Set<string>();
  for (let d = 0; d < 7; d++) for (const w of WINS) if (formData.get(`slot-${d}-${w}`) === "on") wanted.add(`${d}:${w}`);

  const { data: existing, error: readErr } = await own.supabase.from("availability").select("weekday, win").eq("detailer_id", own.id);
  if (readErr) return { error: "Could not save. Try again." };
  const have = new Set(((existing ?? []) as { weekday: number; win: string }[]).map((r) => `${r.weekday}:${r.win}`));

  const add = [...wanted].filter((k) => !have.has(k)).map((k) => {
    const [d, w] = k.split(":");
    return { detailer_id: own.id, weekday: Number(d), win: w };
  });
  const remove = [...have].filter((k) => !wanted.has(k));

  if (add.length) {
    const { error } = await own.supabase.from("availability").insert(add);
    if (error) return { error: "Could not save. Try again." };
  }
  for (const k of remove) {
    const [d, w] = k.split(":");
    await own.supabase.from("availability").delete().eq("detailer_id", own.id).eq("weekday", Number(d)).eq("win", w);
  }
  const { error } = await own.supabase
    .from("detailers")
    .update({ instant_book: formData.get("instant_book") === "on", jobs_per_window: jobs.data })
    .eq("id", own.id);
  if (error) return { error: "Could not save. Try again." };
  revalidatePath("/dashboard/detailer");
  return { ok: true };
}
