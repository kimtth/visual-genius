import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0078d4",
          foreground: "#ffffff",
          hover: "#005a9e",
          active: "#004578"
        }
      }
    }
  },
  plugins: []
};

export default config;
