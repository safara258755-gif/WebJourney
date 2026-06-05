/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./*.js"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF6F0",
        sand: "#F4EBE1",
        terracotta: "#D48C70",
        clay: "#C58F7A",
        sage: "#A3B19B",
        charcoal: "#2C2A29",
        dustypink: "#E2B4B4",
        softrose: "#F0D5D5",
        // Phase colors
        menstrual: "#E07A7A",
        follicular: "#E9C46A",
        ovulation: "#E76F51",
        luteal: "#9B7E98",
      },
      fontFamily: {
        serif: ["Lora", "serif"],
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
}
