/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
    "./store/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        paper: "#F8FAFC",
        accent: "#0EA5E9",
        accentSoft: "#E0F2FE",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      boxShadow: {
        glow: "0 12px 40px rgba(14, 165, 233, 0.18)",
      },
    },
  },
  plugins: [],
};
