import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/db";

export function homeFor(role: UserRole) {
  return role === "admin" ? "/admin" : role === "detailer" ? "/dashboard/detailer" : "/dashboard/customer";
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", auth.user.id).single();
  return (data as Profile | null) ?? null;
}

/** Page guard: redirects to /login if signed out, or to the user's own home if the role doesn't match. */
export async function requireRole(role: UserRole) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== role) redirect(homeFor(profile.role));
  return profile;
}
