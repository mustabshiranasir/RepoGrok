import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0a0a",
          surface: "#111111",
          "surface-hover": "#161616",
          border: "#1e1e1e",
        },
        accent: {
          DEFAULT: "#39AEA9",
          hover: "#2d9490",
          muted: "#39AEA920",
        },
        text: {
          primary: "#f4f4f5",
          secondary: "#a1a1aa",
          muted: "#52525b",
        },
        success: "#39AEA9",
        warning: "#f59e0b",
        error: "#ef4444",
      },
    },
  },
  plugins: [],
};

export default config;
