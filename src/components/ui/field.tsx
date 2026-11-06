import type { InputHTMLAttributes } from "react";

export function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        className="mt-1 block min-h-11 w-full rounded-lg border-0 bg-white px-3 text-base ring-1 ring-slate-300 focus:ring-2 focus:ring-brand-500"
        {...props}
      />
    </label>
  );
}
