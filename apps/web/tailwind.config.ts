import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        muted: "#64748B",
        civic: "#1D4ED8",
        navy: "#0B1F3A",
        gold: "#C9A227",
        paper: "#F8FAFC",
        algeria: "#15803D",
        border: "#E2E8F0",
        warning: "#D97706",
        danger: "#B91C1C"
      },
      boxShadow: {
        soft: "0 14px 34px rgba(15, 23, 42, 0.08)",
        panel: "0 1px 2px rgba(15, 23, 42, 0.06), 0 12px 28px rgba(15, 23, 42, 0.05)"
      }
    }
  },
  plugins: []
} satisfies Config;
