"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, PHOTO_BUCKET } from "@/lib/photos";

export type PhotoResult = { ok: true } | { ok: false; error: string };

// Check the real file signature, not just the type the browser claims.
function sniff(bytes: Uint8Array): "jpg" | "png" | "webp" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "webp";
  return null;
}
const TYPE = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;

async function ownDetailerId() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "detailer") return null;
  const supabase = await createClient();
  const { data } = await supabase.from("detailers").select("id").eq("user_id", profile.id).single();
  return data ? { supabase, id: (data as { id: string }).id } : null;
}

/** One photo per call, so each upload stays under the request size limit. Authorization is checked here and by RLS. */
export async function uploadPhoto(formData: FormData): Promise<PhotoResult> {
  const own = await ownDetailerId();
  if (!own) return { ok: false, error: "Only detailers can add photos." };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a photo." };
  if (file.size > MAX_PHOTO_BYTES) return { ok: false, error: `${file.name} is over 5 MB.` };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniff(bytes);
  if (!kind) return { ok: false, error: `${file.name} is not a JPEG, PNG or WebP image.` };

  const { count } = await own.supabase.from("detailer_photos").select("id", { count: "exact", head: true }).eq("detailer_id", own.id);
  if ((count ?? 0) >= MAX_PHOTOS) return { ok: false, error: `You can add up to ${MAX_PHOTOS} photos.` };

  const path = `${own.id}/${crypto.randomUUID()}.${kind}`;
  const up = await own.supabase.storage.from(PHOTO_BUCKET).upload(path, bytes, { contentType: TYPE[kind], upsert: false });
  if (up.error) return { ok: false, error: "Upload failed. Try again." };

  const ins = await own.supabase.from("detailer_photos").insert({ detailer_id: own.id, path, position: count ?? 0 });
  if (ins.error) {
    await own.supabase.storage.from(PHOTO_BUCKET).remove([path]);
    return { ok: false, error: "Could not save the photo. Try again." };
  }
  revalidatePath("/dashboard/detailer");
  return { ok: true };
}

export async function deletePhoto(formData: FormData): Promise<void> {
  const own = await ownDetailerId();
  if (!own) throw new Error("Forbidden");
  const id = String(formData.get("id") ?? "");
  const { data } = await own.supabase.from("detailer_photos").select("path").eq("id", id).eq("detailer_id", own.id).single();
  if (!data) return;
  await own.supabase.storage.from(PHOTO_BUCKET).remove([(data as { path: string }).path]);
  await own.supabase.from("detailer_photos").delete().eq("id", id).eq("detailer_id", own.id);
  revalidatePath("/dashboard/detailer");
}
