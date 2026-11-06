"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  verified: z.enum(["true", "false"]).optional(),
});

/** Admin-only. Authorization is checked here AND enforced by RLS + the guard trigger. */
export async function updateDetailer(formData: FormData) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") throw new Error("Forbidden");

  const parsed = schema.parse(Object.fromEntries(formData));
  const patch: Record<string, unknown> = {};
  if (parsed.status) patch.status = parsed.status;
  if (parsed.verified) patch.verified = parsed.verified === "true";

  const supabase = await createClient();
  const { error } = await supabase.from("detailers").update(patch).eq("id", parsed.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
