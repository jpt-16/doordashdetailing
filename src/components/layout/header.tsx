import Link from "next/link";
import { brand } from "@config/brand";
import { getCurrentProfile, homeFor } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export async function Header() {
  const profile = await getCurrentProfile();
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-brand-600">
          {brand.name}
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium">
          {profile ? (
            <>
              <Link href={homeFor(profile.role)}>Dashboard</Link>
              <form action={signOut}>
                <Button variant="secondary" type="submit" className="min-h-9">
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/signup" className="rounded-lg bg-brand-600 px-3 py-2 text-white">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
