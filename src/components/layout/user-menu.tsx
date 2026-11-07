"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/actions/auth";

type Props = { name: string | null; dashboardHref: string | null };

export function UserMenu({ name, dashboardHref }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = name
    ? name
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  const item =
    "flex min-h-11 w-full items-center px-4 text-left text-sm font-medium text-ink transition-colors duration-150 hover:bg-band";

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu"
        onClick={() => setOpen((v) => !v)}
        className="press flex h-11 items-center gap-3 rounded-full border border-line bg-white pl-3.5 pr-1.5 shadow-pill transition-[transform,box-shadow] duration-150 ease-out hover:shadow-card active:scale-[0.97]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M2 4h12M2 8h12M2 12h12" />
        </svg>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs font-semibold text-white">
          {initials ?? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-7 8-7s8 2.600 8 7z" />
            </svg>
          )}
        </span>
      </button>

      {open && (
        <div role="menu" className="pop-in absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-card bg-white py-2 shadow-card ring-1 ring-line">
          {dashboardHref ? (
            <>
              <Link role="menuitem" href={dashboardHref} className={item} onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <div className="my-2 h-px bg-line" />
              <form action={signOut}>
                <button role="menuitem" type="submit" className={item}>
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link role="menuitem" href="/signup" className={`${item} font-semibold`} onClick={() => setOpen(false)}>
                Sign up
              </Link>
              <Link role="menuitem" href="/login" className={item} onClick={() => setOpen(false)}>
                Log in
              </Link>
              <div className="my-2 h-px bg-line" />
              <Link role="menuitem" href="/signup?role=detailer" className={item} onClick={() => setOpen(false)}>
                Become a detailer
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
