import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        paper: "var(--paper)",
        mist: "var(--mist)",
        ash: "var(--ash)",
        smoke: "var(--smoke)",
        graphite: "var(--graphite)",
        steel: "var(--steel)",
        slate: "var(--slate)",
        marigold: "var(--marigold)",
        buttercream: "var(--buttercream)",
        cream: "var(--cream)",
      },
      borderRadius: {
        sm: "1px",
        md: "4px",
        lg: "8px",
      },
      maxWidth: {
        page: "1080px",
      },
    },
  },
  plugins: [],
};

export default config;
