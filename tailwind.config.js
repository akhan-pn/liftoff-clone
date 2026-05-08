/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#F5F6FA",
          100: "#E6E8F0",
          200: "#9AA0B4",
          300: "#5C6178",
          400: "#3A3F54",
          500: "#262A3B",
          600: "#1B1E2C",
          700: "#13151F",
          800: "#0C0E16",
          900: "#06070D",
        },
        accent: {
          DEFAULT: "#FF5630",
          50: "#FFF1ED",
          100: "#FFD6CB",
          400: "#FF7A5C",
          500: "#FF5630",
          600: "#E33F1F",
          700: "#B92C12",
        },
        gold: "#F5C04A",
        success: "#22C55E",
        danger: "#EF4444",
      },
      fontFamily: {
        display: ["System"],
      },
    },
  },
  plugins: [],
};
