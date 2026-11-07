"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icons";
import { logIn, signUp, type AuthState } from "@/app/actions/auth";

/** Full-height sheet look: close button top-left, 26/600 title, then the form. */
export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md pt-1">
      <Link
        href="/"
        aria-label="Close"
        className="press grid h-9 w-9 place-items-center rounded-full border border-field transition-transform duration-150 ease-out active:scale-[0.97]"
      >
        <Icon name="x" size={16} />
      </Link>
      <h1 className="mb-6 mt-6 text-[26px] font-semibold leading-tight tracking-tight">{title}</h1>
      {children}
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(logIn, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required />
      <Message state={state} />
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Logging in…" : "Log in"}
      </Button>
      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="link">
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
      <fieldset>
        <legend className="mb-2 text-sm font-medium">I am a…</legend>
        <div className="grid grid-cols-2 gap-3">
          {(["customer", "detailer"] as const).map((r) => (
            <label key={r} className="cursor-pointer">
              <input type="radio" name="role" value={r} defaultChecked={r === defaultRole} className="peer sr-only" />
              {/* Selection is a 2px ink border, not a tint. */}
              <span className="press flex min-h-20 flex-col justify-center rounded-card border-2 border-line bg-white px-4 transition-transform duration-150 ease-out peer-checked:border-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2 active:scale-[0.97]">
                <span className="text-base font-semibold">{r === "customer" ? "Customer" : "Detailer"}</span>
                <span className="text-xs text-muted">{r === "customer" ? "Book a detail" : "Get booked by neighbors"}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Full name" name="full_name" autoComplete="name" required />
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      <Message state={state} />
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="link">
          Log in
        </Link>
      </p>
    </form>
  );
}

function Message({ state }: { state: AuthState }) {
  if (state?.error)
    return (
      <p role="alert" className="rounded-btn bg-red-50 p-3 text-sm text-red-800">
        {state.error}
      </p>
    );
  if (state?.notice) return <p className="rounded-btn bg-green-50 p-3 text-sm text-green-800">{state.notice}</p>;
  return null;
}
