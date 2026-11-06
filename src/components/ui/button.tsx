import type { ButtonHTMLAttributes } from "react";

const styles = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-white text-ink ring-1 ring-slate-300 hover:bg-slate-50",
  danger: "bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof styles }) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
