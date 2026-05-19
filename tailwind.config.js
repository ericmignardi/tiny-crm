/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2F6F73",
        secondary: "#8A6FAD",
        accent: "#E09F5A",
        background: "#F8F7F3",
        backgroundCard: "#FFFFFF",
        text: "#1F2933",
        textMuted: "#6B7280",
      },
      fontFamily: {
        sans: ["Inter-Regular", "sans-serif"],
      },
    },
  },
  plugins: [],
};
