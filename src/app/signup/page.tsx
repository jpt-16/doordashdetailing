import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">Create your account</h1>
      <SignupForm defaultRole={role === "detailer" ? "detailer" : "customer"} />
    </div>
  );
}
