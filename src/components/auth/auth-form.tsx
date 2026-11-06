"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { logIn, signUp, type AuthState } from "@/app/actions/auth";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(logIn, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required />
      <Message state={state} />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Logging in…" : "Log in"}
      </Button>
      <p className="text-center text-sm text-slate-600">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-brand-600">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm({ defaultRole }: { defaultRole: "customer" | "detailer" }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, undefined);
  return (
    <form action={action} className="space-y-4">
      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="mb-1 text-sm font-medium">I am a…</legend>
        {(["customer", "detailer"] as const).map((r) => (
          <label key={r} className="cursor-pointer">
            <input type="radio" name="role" value={r} defaultChecked={r === defaultRole} className="peer sr-only" />
            <span className="flex min-h-11 items-center justify-center rounded-lg bg-white text-sm font-semibold ring-1 ring-slate-300 peer-checked:bg-brand-50 peer-checked:text-brand-700 peer-checked:ring-2 peer-checked:ring-brand-500">
              {r === "customer" ? "Customer" : "Detailer"}
            </span>
          </label>
        ))}
      </fieldset>
      <Field label="Full name" name="full_name" autoComplete="name" required />
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      <Message state={state} />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600">
          Log in
        </Link>
      </p>
    </form>
  );
}

function Message({ state }: { state: AuthState }) {
  if (state?.error)
    return (
      <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
        {state.error}
      </p>
    );
  if (state?.notice) return <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{state.notice}</p>;
  return null;
}
