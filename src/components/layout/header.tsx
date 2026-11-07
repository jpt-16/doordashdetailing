import Link from "next/link";
import { brand } from "@config/brand";
import { getCurrentProfile, homeFor } from "@/lib/auth";
import { UserMenu } from "@/components/layout/user-menu";

export async function Header() {
  const profile = await getCurrentProfile();
  const showBecomeDetailer = !profile || profile.role === "customer";
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="press -ml-1 rounded-btn px-1 text-xl font-semibold tracking-tight text-brand-600 transition-transform duration-150 ease-out active:scale-[0.97]">
          {brand.name}
        </Link>
        <nav className="flex items-center gap-4">
          {showBecomeDetailer && (
            <Link href="/signup?role=detailer" className="link hidden text-sm font-medium sm:inline">
              Become a detailer
            </Link>
          )}
          <UserMenu name={profile?.full_name ?? null} dashboardHref={profile ? homeFor(profile.role) : null} />
        </nav>
      </div>
    </header>
  );
}
