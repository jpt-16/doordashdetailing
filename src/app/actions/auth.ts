"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { homeFor } from "@/lib/auth";
import type { UserRole } from "@/types/db";

export type AuthState = { error?: string; notice?: string } | undefined;

const credentials = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const signupSchema = credentials.extend({
  full_name: z.string().trim().min(2, "Enter your name."),
  role: z.enum(["customer", "detailer"]),
});

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email, password, full_name, role } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role }, // read by the handle_new_user trigger; 'admin' is never accepted
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  // No session means email confirmation is on in Supabase.
  if (!data.session) return { notice: "Check your email to confirm your account, then log in." };
  redirect(homeFor(role as UserRole));
}

export async function logIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Incorrect email or password." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : homeFor((profile?.role ?? "customer") as UserRole));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
