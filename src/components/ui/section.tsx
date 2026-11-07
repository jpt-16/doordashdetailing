import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icons";

/** Thick 8px strip between major sections. Pages that sit inside the 24px-padded main use `bleed`. */
export function Band({ bleed = false }: { bleed?: boolean }) {
  return <div className={`h-2 bg-band ${bleed ? "-mx-6" : ""}`} />;
}

/** Hairline between rows inside a section. */
export function Hairline() {
  return <div className="h-px bg-line" />;
}

export function Section({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`py-6 ${className}`}>
      {title && <h2 className="mb-4 text-[22px] font-semibold leading-tight tracking-tight">{title}</h2>}
      {children}
    </section>
  );
}

/** 24px line icon, title, muted subtitle. */
export function IconRow({ icon, title, children }: { icon: IconName; title: string; children?: ReactNode }) {
  return (
    <div className="flex gap-4 py-3">
      <Icon name={icon} size={24} className="mt-0.5 text-ink" />
      <div className="min-w-0">
        <p className="text-base font-semibold">{title}</p>
        {children && <div className="text-sm text-muted">{children}</div>}
      </div>
    </div>
  );
}

/** Bold label on the left, value below, optional right-hand action. */
export function LabelRow({ label, children, action }: { label: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-base font-semibold">{label}</p>
        <div className="text-base text-ink">{children}</div>
      </div>
      {action}
    </div>
  );
}

/** Rounded bordered box split into cells by vertical dividers. */
export function StatStrip({ cells }: { cells: ReactNode[] }) {
  return (
    <div className="grid rounded-card border border-line" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
      {cells.map((c, i) => (
        <div key={i} className={`flex flex-col items-center justify-center gap-1 px-2 py-4 text-center ${i > 0 ? "border-l border-line" : ""}`}>
          {c}
        </div>
      ))}
    </div>
  );
}

/** Sticky bottom bar: price on the left, action on the right. */
export function StickyFooter({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-white shadow-footer">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        {children}
      </div>
    </div>
  );
}
