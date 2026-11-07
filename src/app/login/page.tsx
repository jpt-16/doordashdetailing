import type { Metadata } from "next";
import { AuthShell, LoginForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthShell title="Log in">
      <LoginForm next={next} />
    </AuthShell>
  );
}
