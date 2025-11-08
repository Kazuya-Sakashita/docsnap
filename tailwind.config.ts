// tailwind.config.ts もしくは tailwind.config.js
import type { Config } from "tailwindcss"

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Noto Sans JP を最優先、次に Inter の変数
        sans: [
          "var(--font-noto-sans-jp)",
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Arial",
          "sans-serif",
        ],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config
