// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind / NativeWind where to look for class names
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",      // <— add this
    "./components/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};