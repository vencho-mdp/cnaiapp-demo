const colors = require("tailwindcss/colors");

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          blue: "#2EA7FF",
          lightblue: "#B3DFFF",
          darkblue: "#0982DA",
        },
        transparent: "transparent",
        current: "currentColor",
        white: { DEFAULT: "#F1F1F1", full: "#FFF" },
        green: {
          light: "#44CC00",
          DEFAULT: "#37A32F",
        },
        yellow: colors.amber,
        red: {
          DEFAULT: "#DE4218",
          dark: "#FF6259",
          light: "#FFE4E0",
        },
        black: { DEFAULT: "#414141", light: "rgba(0, 0, 0, .3)" },
        gray: { DEFAULT: "#8C8C8C", light: "rgba(140,140,140,.10)" },
      },
    },
    fontFamily: {
      sans: ["Lato", "sans-serif"],
      serif: ["Merriweather", "serif"],
    },
    fontSize: {
      xs: "16px",
      sm: "18px",
      tiny: "20px",
      base: "24px",
      lg: "28px",
      xl: "32px",
    },
  },
  content: [
    `components/**/*.{vue,js}`,
    `layouts/**/*.vue`,
    `pages/**/*.vue`,
    `composables/**/*.{js,ts}`,
    `plugins/**/*.{js,ts}`,
    `App.{js,ts,vue}`,
    `app.{js,ts,vue}`,
  ],
  safelist: [
    "fade-leave-to",
    "fade-enter-from",
    "fade-leave-active",
    "fade-enter-active",
    "overflow-hidden",
    "bg-blue-400",
    "bg-indigo-400",
    "bg-red-400",
    "bg-orange-400",
    "bg-green-400",
    "bg-pink-400",
    "bg-purple-400",
    "bg-yellow-400",
    "mr-12",
    "mx-12",
  ],
};
