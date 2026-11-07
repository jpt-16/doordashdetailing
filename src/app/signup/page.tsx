import type { Metadata } from "next";
import { AuthShell, SignupForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return (
    <AuthShell title="Create your account">
      <SignupForm defaultRole={role === "detailer" ? "detailer" : "customer"} />
    </AuthShell>
  );
}
