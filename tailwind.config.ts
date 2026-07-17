import type { Config } from "tailwindcss";

/**
 * Colors are driven entirely by CSS variables declared in app/globals.css.
 * Change a token there and the whole app (light + dark) re-themes.
 * The scale below is deliberately tight — near-monochrome with a single
 * violet accent, matching the bhtran.com "Linear" redesign.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        "bg-subtle": "rgb(var(--bg-subtle) / <alpha-value>)",
        "bg-elevated": "rgb(var(--bg-elevated) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        "border-strong": "rgb(var(--border-strong) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        "fg-muted": "rgb(var(--fg-muted) / <alpha-value>)",
        "fg-subtle": "rgb(var(--fg-subtle) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-fg": "rgb(var(--accent-fg) / <alpha-value>)",
        "accent-subtle": "rgb(var(--accent-subtle) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        "success-subtle": "rgb(var(--success-subtle) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        "warning-subtle": "rgb(var(--warning-subtle) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        "danger-subtle": "rgb(var(--danger-subtle) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
        xl: "14px",
      },
      fontSize: {
        // tight type scale
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.875rem", { lineHeight: "1.5rem" }],
        lg: ["1rem", { lineHeight: "1.5rem" }],
        xl: ["1.125rem", { lineHeight: "1.6rem" }],
        "2xl": ["1.375rem", { lineHeight: "1.75rem" }],
        "3xl": ["1.75rem", { lineHeight: "2.1rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
      maxWidth: {
        content: "72rem",
        prose: "44rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 160ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
