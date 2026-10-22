import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101A20",
        ink2: "#17262E",
        ink3: "#20343D",
        paper: "#F5F7F3",
        steel: "#7A878C",
        cyanLink: "#20D6C7",
        cyanSoft: "#B8FFF8",
        printOrange: "#FF7A45",
        success: "#82F6A7",
        alert: "#FF5E70"
      },
      boxShadow: {
        brand: "0 26px 80px rgba(0,0,0,.34)",
        card: "0 18px 45px rgba(0,0,0,.18)",
        glowCyan: "0 0 44px rgba(32,214,199,.20)",
        glowOrange: "0 0 44px rgba(255,122,69,.18)"
      },
      borderRadius: {
        brand: "26px"
      }
    },
  },
  plugins: [],
};
export default config;
