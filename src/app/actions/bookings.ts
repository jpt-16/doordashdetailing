"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

export type BookingResult = { ok: true; id: string } | { ok: false; error: string };

const input = z.object({
  detailerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  vehicle: z.enum(["sedan", "suv", "truck"]),
  address: z.string().trim().min(5, "Enter the address.").max(200),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a day."),
  win: z.enum(["morning", "afternoon", "evening"]),
  note: z.string().max(500).default(""),
});

/** The price, deposit and capacity checks all happen inside the create_booking database function. */
export async function createBooking(raw: unknown): Promise<BookingResult> {
  const parsed = input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Log in to book." };

  const v = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_booking", {
    p_detailer: v.detailerId,
    p_service: v.serviceId,
    p_vehicle: v.vehicle,
    p_address: v.address,
    p_day: v.day,
    p_win: v.win,
    p_note: v.note,
  });
  if (error || !data) return { ok: false, error: error?.message ?? "Could not book. Try again." };
  revalidatePath("/dashboard/customer");
  return { ok: true, id: data as string };
}

async function run(fn: "cancel_booking" | "advance_booking" | "respond_booking", args: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/customer");
  revalidatePath("/dashboard/detailer");
  revalidatePath("/bookings/[id]", "page");
}

export async function cancelBooking(formData: FormData) {
  await run("cancel_booking", { p_id: String(formData.get("id")) });
}
export async function advanceBooking(formData: FormData) {
  await run("advance_booking", { p_id: String(formData.get("id")) });
}
export async function respondBooking(formData: FormData) {
  await run("respond_booking", { p_id: String(formData.get("id")), p_accept: formData.get("accept") === "true" });
}
