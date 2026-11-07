import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  // `hover:` only applies on devices that really hover, so touch screens never get stuck hover states.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
        },
        ink: "#222222", // primary text
        muted: "#6a6a6a", // secondary text
        line: "#ebebeb", // hairline dividers
        band: "#f7f7f7", // thick section separators
        field: "#b0b0b0", // input borders
      },
      borderRadius: { card: "16px", btn: "8px" },
      boxShadow: {
        card: "0 6px 16px rgba(0,0,0,0.12)",
        pill: "0 3px 12px rgba(0,0,0,0.10)",
        footer: "0 -1px 0 #ebebeb",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
