import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          navy: "#0d1527",
          navyDark: "#080d19",
          navyBorder: "#1e293b",
          blue: "#2563eb",
          blueLight: "#3b82f6",
          workspace: "#f8fafc",
          surface: "#ffffff",
          border: "#e2e8f0",
          textPrimary: "#0f172a",
          textSecondary: "#64748b",
          textMuted: "#94a3b8",
          emerald: "#16a34a",
          amber: "#ea580c",
          rose: "#dc2626",
          purple: "#8b5cf6",
          cyan: "#06b6d4"
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"]
      }
    },
  },
  plugins: [],
};

export default config;
