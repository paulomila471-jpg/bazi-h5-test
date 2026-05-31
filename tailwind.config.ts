import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        night: "#0a1324",
        gold: "#d9b56c",
        mutedgold: "#8f7442"
      },
      boxShadow: {
        aureate: "0 18px 60px rgba(217, 181, 108, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
