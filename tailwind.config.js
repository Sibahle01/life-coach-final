/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          light: "#2d5f3f",
          DEFAULT: "#1a4d2e",
          dark: "#0f3d22",
        },
        gold: {
          light: "#f4c430",
          DEFAULT: "#d4af37",
          dark: "#b8941f",
        },
        cream: {
          light: "#faf9f6",
          DEFAULT: "#f5f5f0",
          dark: "#ebebe0",
        },
        charcoal: {
          light: "#4a5568",
          DEFAULT: "#2d3748",
          dark: "#1a202c",
        },
      },
      screens: {
        xs: "375px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [], // EMPTY ARRAY - REMOVE line-clamp
}