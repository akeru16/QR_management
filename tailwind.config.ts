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
        ink: "#1f2933",
        paper: "#fbfaf7",
        line: "#ded9cf",
        mint: "#2f8f83",
        coral: "#d7664d"
      }
    }
  },
  plugins: []
};

export default config;
