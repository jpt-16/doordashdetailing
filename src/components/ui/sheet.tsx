"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icons";

const CLOSE_MS = 230;

/**
 * Bottom sheet on phones, centered dialog on desktop. Opens in 350ms, closes in 220ms, and a downward swipe
 * dismisses it when dragged past 25% of its height or flicked faster than 0.11 px/ms.
 * Controlled: parent owns `open` and receives `onClose` after the exit animation starts.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  back,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Show a back arrow instead of the close button (used for nested sheets). */
  back?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<"enter" | "open" | "closing">("enter");
  const [dragY, setDragY] = useState<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y0: number; t0: number; h: number } | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setState("enter");
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setState("open")));
      return () => cancelAnimationFrame(id);
    }
    if (mounted) {
      setState("closing");
      const t = setTimeout(() => {
        setMounted(false);
        setDragY(null);
      }, CLOSE_MS);
      return () => clearTimeout(t);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const request = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && request();
    document.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [mounted, request]);

  const desktop = () => window.matchMedia("(min-width: 768px)").matches;
  const down = (e: React.PointerEvent) => {
    if (desktop()) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { y0: e.clientY, t0: performance.now(), h: panel.current?.offsetHeight ?? 600 };
    setDragY(0);
  };
  const move = (e: React.PointerEvent) => drag.current && setDragY(Math.max(0, e.clientY - drag.current.y0));
  const up = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const dy = Math.max(0, e.clientY - d.y0);
    const v = dy / Math.max(1, performance.now() - d.t0);
    if (dy > d.h * 0.25 || v > 0.11) request();
    else setDragY(null);
  };

  if (!mounted) return null;
  return (
    <div className="fixed inset-0 z-50 md:flex md:items-center md:justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="sheet-backdrop absolute inset-0 bg-black" data-state={state === "open" ? "open" : "closed"} onClick={request} />
      <div
        ref={panel}
        tabIndex={-1}
        data-state={state}
        data-dragging={dragY !== null}
        style={dragY !== null ? { transform: `translateY(${dragY}px)` } : undefined}
        className="sheet-panel absolute inset-x-0 bottom-0 flex max-h-[94dvh] flex-col rounded-t-[24px] bg-white outline-none md:static md:max-h-[88dvh] md:w-full md:max-w-lg md:rounded-card md:shadow-card"
      >
        <div className="touch-none md:hidden" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <div className="flex justify-center pb-1 pt-2.5">
            <span className="h-1 w-9 rounded-full bg-field/60" />
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-line px-4 pb-3 pt-1 md:pt-4">
          <button
            type="button"
            onClick={request}
            aria-label={back ? "Back" : "Close"}
            className="press grid h-9 w-9 place-items-center rounded-full transition-[transform,background-color] duration-150 ease-out hover:bg-band active:scale-[0.97]"
          >
            <Icon name={back ? "chevL" : "x"} size={back ? 22 : 18} />
          </button>
          <p className="text-base font-semibold">{title}</p>
          <span className="w-9" />
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">{children}</div>
        {footer && (
          <div className="border-t border-line bg-white px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-footer md:rounded-b-card">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
