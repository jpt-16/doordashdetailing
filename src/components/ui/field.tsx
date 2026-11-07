import type { InputHTMLAttributes } from "react";

export function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-sm font-medium text-ink">
      {label}
      <input
        className="mt-1 block min-h-12 w-full rounded-btn border border-field bg-white px-3 text-base text-ink transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-muted focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
        {...props}
      />
    </label>
  );
}
