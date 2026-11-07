import type { ButtonHTMLAttributes } from "react";

// Existing variants (primary, secondary, danger) keep working. New: dark, outline, link.
const styles = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  dark: "bg-ink text-white hover:bg-black",
  outline: "bg-white text-ink ring-1 ring-ink hover:bg-band",
  secondary: "bg-white text-ink ring-1 ring-field hover:bg-band",
  danger: "bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50",
  link: "bg-transparent px-0 font-semibold text-ink underline underline-offset-2",
};

const sizes = {
  md: "min-h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClass(variant: keyof typeof styles = "primary", size: keyof typeof sizes = "md", extra = "") {
  return `press inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition-[transform,background-color,box-shadow,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 ${sizes[size]} ${styles[variant]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof styles; size?: keyof typeof sizes }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}
